import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { toLocalDateString } from '../lib/dates'
import type {
    DailyTask,
    EditScope,
    NewTaskInput,
    TaskUpdates,
    UseDailyTasksResult,
} from '../types'

function toError(message: string): Error {
    return new Error(message)
}

async function getUserId() {
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')
    return user.id
}

/**
 * Carrega e muta as tarefas de um dia.
 *
 * - Listagem via RPC `get_day_agenda` (recorrentes + overrides + conclusão).
 * - Escritas em `task_overrides` (só hoje) ou `recurring_tasks` (sempre).
 * - `user_id` é sempre explícito nas escritas (RLS `auth.uid() = user_id`).
 * - Erros do Supabase são lançados como `Error` para a UI mostrar o motivo.
 */
export function useDailyTasks(date: Date): UseDailyTasksResult {
    const [tasks, setTasks] = useState<DailyTask[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    // descarta respostas antigas quando o usuário troca de dia rápido
    const requestId = useRef(0)

    const dateStr = toLocalDateString(date)
    const dayOfWeek = date.getDay()

    const fetchTasks = useCallback(
        async (showLoading: boolean) => {
            const id = ++requestId.current
            // setState só após o primeiro await (lint: set-state-in-effect)
            await Promise.resolve()
            if (showLoading) setLoading(true)
            const { data, error } = await supabase.rpc('get_day_agenda', {
                target_date: dateStr,
            })
            if (id !== requestId.current) return
            if (error) {
                setError(toError(error.message))
            } else {
                setError(null)
                setTasks(data as DailyTask[])
            }
            setLoading(false)
        },
        [dateStr],
    )

    useEffect(() => {
        void fetchTasks(true)
    }, [fetchTasks])

    /** Executa uma mutação, guarda o erro para a UI e recarrega a lista. */
    async function mutate(fallback: string, run: (userId: string) => Promise<void>) {
        setError(null)
        try {
            await run(await getUserId())
        } catch (err) {
            const e = err instanceof Error ? err : toError(fallback)
            setError(e)
            throw e
        }
        await fetchTasks(false)
    }

    /** Pula/edita só hoje uma recorrente: atualiza o override do dia ou cria um novo. */
    async function upsertOverride(
        userId: string,
        recurringId: string,
        values: Record<string, unknown>,
    ) {
        const { data: updated, error: updErr } = await supabase
            .from('task_overrides')
            .update(values)
            .eq('recurring_task_id', recurringId)
            .eq('date', dateStr)
            .eq('user_id', userId)
            .select('id')
        if (updErr) throw toError(updErr.message)

        if (!updated || updated.length === 0) {
            const { error } = await supabase.from('task_overrides').insert({
                user_id: userId,
                recurring_task_id: recurringId,
                date: dateStr,
                ...values,
            })
            if (error) throw toError(error.message)
        }
    }

    async function editTask(task: DailyTask, updates: TaskUpdates, scope: EditScope) {
        await mutate('Erro ao editar tarefa', async (userId) => {
            if (scope === 'today') {
                if (task.source === 'override') {
                    // já é uma linha em task_overrides → atualiza por id
                    const { error } = await supabase
                        .from('task_overrides')
                        .update(updates)
                        .eq('id', task.id)
                        .eq('user_id', userId)
                    if (error) throw toError(error.message)
                } else {
                    await upsertOverride(userId, task.id, { ...updates, status: 'edited' })
                }
                return
            }

            // "sempre": só existe definição semanal em tarefas recorrentes
            const recurringId = task.recurring_task_id
            if (!recurringId) {
                throw new Error('Esta tarefa só existe neste dia. Use "Só hoje".')
            }
            const { error } = await supabase
                .from('recurring_tasks')
                .update(updates)
                .eq('id', recurringId)
                .eq('user_id', userId)
            if (error) throw toError(error.message)
            // a edição só do dia (se havia) sai de cena: o dia passa a seguir a semanal
            if (task.source === 'override') {
                const { error: delErr } = await supabase
                    .from('task_overrides')
                    .delete()
                    .eq('id', task.id)
                    .eq('user_id', userId)
                if (delErr) throw toError(delErr.message)
            }
        })
    }

    /** Pular hoje = remover só este dia (recorrente vira skipped; avulsa é apagada). */
    async function skipTask(task: DailyTask) {
        await mutate('Erro ao pular tarefa', async (userId) => {
            if (task.source === 'override') {
                const { error } = task.recurring_task_id
                    ? await supabase
                          .from('task_overrides')
                          .update({ status: 'skipped' })
                          .eq('id', task.id)
                          .eq('user_id', userId)
                    : await supabase
                          .from('task_overrides')
                          .delete()
                          .eq('id', task.id)
                          .eq('user_id', userId)
                if (error) throw toError(error.message)
            } else {
                await upsertOverride(userId, task.id, { status: 'skipped' })
            }
        })
    }

    async function addTask(
        { title, description, time_start, time_end }: NewTaskInput,
        scope: EditScope,
    ) {
        await mutate('Erro ao salvar tarefa', async (userId) => {
            const base = {
                user_id: userId,
                title,
                description: description || null,
                time_start,
                time_end: time_end ?? null,
            }
            const { error } =
                scope === 'today'
                    ? await supabase
                          .from('task_overrides')
                          .insert({ ...base, date: dateStr, status: 'added' })
                    : await supabase
                          .from('recurring_tasks')
                          .insert({ ...base, day_of_week: dayOfWeek, active: true })
            if (error) throw toError(error.message)
        })
    }

    /**
     * Exclui uma tarefa.
     * - 'today': só este dia (igual a pular).
     * - 'always': soft delete da recorrente (`active = false`) para não
     *   quebrar a FK dos overrides já criados. Avulsas são sempre só do dia.
     */
    async function deleteTask(task: DailyTask, scope: EditScope) {
        const recurringId = task.recurring_task_id
        if (scope === 'today' || !recurringId) {
            await skipTask(task)
            return
        }
        await mutate('Erro ao excluir tarefa', async (userId) => {
            const { error } = await supabase
                .from('recurring_tasks')
                .update({ active: false })
                .eq('id', recurringId)
                .eq('user_id', userId)
            if (error) throw toError(error.message)
        })
    }

    /** Concluir/desconcluir: atualiza a tela na hora e desfaz se o banco recusar. */
    async function toggleComplete(task: DailyTask) {
        const completed = !task.completed
        const apply = (value: boolean) =>
            setTasks((current) =>
                current.map((t) => (t.task_key === task.task_key ? { ...t, completed: value } : t)),
            )
        apply(completed)
        setError(null)
        try {
            const userId = await getUserId()
            const { error } = completed
                ? await supabase
                      .from('task_completions')
                      .upsert({ user_id: userId, date: dateStr, task_key: task.task_key })
                : await supabase
                      .from('task_completions')
                      .delete()
                      .eq('user_id', userId)
                      .eq('date', dateStr)
                      .eq('task_key', task.task_key)
            if (error) throw toError(error.message)
        } catch (err) {
            apply(!completed)
            const e = err instanceof Error ? err : toError('Erro ao concluir tarefa')
            setError(e)
            throw e
        }
    }

    return { tasks, loading, error, editTask, skipTask, addTask, deleteTask, toggleComplete }
}
