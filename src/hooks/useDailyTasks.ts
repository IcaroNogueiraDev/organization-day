import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
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

/** 'YYYY-MM-DD' na data LOCAL (toISOString usa UTC e erra o dia perto da meia-noite). */
function toLocalDateString(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
}

/**
 * Carrega e muta as tarefas de um dia.
 *
 * - Listagem via RPC `get_tasks_for_day`.
 * - Escritas em `task_overrides` (só hoje) ou `recurring_tasks` (sempre).
 * - `user_id` é sempre explícito nas escritas (RLS `auth.uid() = user_id`).
 * - Erros do Supabase são lançados como `Error` para a UI mostrar o motivo.
 */
export function useDailyTasks(date: Date): UseDailyTasksResult {
    const [tasks, setTasks] = useState<DailyTask[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const dateStr = toLocalDateString(date)

    const fetchTasks = useCallback(async () => {
        // setState só após o primeiro await (lint: set-state-in-effect)
        try {
            await Promise.resolve()
            setLoading(true)
            setError(null)
            const { data, error } = await supabase.rpc('get_tasks_for_day', {
                target_date: dateStr,
            })

            if (error) {
                setError(toError(error.message))
            } else {
                setTasks(data as DailyTask[])
            }
        } finally {
            setLoading(false)
        }
    }, [dateStr])

    useEffect(() => {
        void fetchTasks()
    }, [fetchTasks])

    async function getUserId() {
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error('Usuário não autenticado')
        return user.id
    }

    async function editTask(task: DailyTask, updates: TaskUpdates, scope: EditScope) {
        setError(null)
        try {
            if (scope === 'today') {
                const user_id = await getUserId()

                if (task.source === 'override') {
                    // já é uma linha em task_overrides → atualiza por id
                    const { error } = await supabase
                        .from('task_overrides')
                        .update(updates)
                        .eq('id', task.id)
                        .eq('user_id', user_id)
                    if (error) throw toError(error.message)
                } else {
                    // recorrente: tenta atualizar o override deste dia; se não
                    // existir, insere um novo (upsert sem onConflict sempre
                    // inseriria uma linha duplicada)
                    const { data: updated, error: updErr } = await supabase
                        .from('task_overrides')
                        .update({ ...updates, status: 'edited' })
                        .eq('recurring_task_id', task.id)
                        .eq('date', dateStr)
                        .eq('user_id', user_id)
                        .select('id')
                    if (updErr) throw toError(updErr.message)

                    if (!updated || updated.length === 0) {
                        const { error } = await supabase.from('task_overrides').insert({
                            user_id,
                            recurring_task_id: task.id,
                            date: dateStr,
                            status: 'edited',
                            ...updates,
                        })
                        if (error) throw toError(error.message)
                    }
                }
            } else {
                if (task.source === 'override') {
                    throw new Error(
                        'Esta tarefa só existe neste dia — use "Salvar só hoje"',
                    )
                }
                const { error } = await supabase
                    .from('recurring_tasks')
                    .update(updates)
                    .eq('id', task.id)
                if (error) throw toError(error.message)
            }
        } catch (err) {
            const e = err instanceof Error ? err : toError('Erro ao editar tarefa')
            setError(e)
            throw e
        }
        await fetchTasks()
    }

    async function skipTask(task: DailyTask) {
        setError(null)
        try {
            const user_id = await getUserId()


            // se já existe override recorrente deste dia, só muda p/ skipped
            const { data: updated, error: updErr } = await supabase
                .from('task_overrides')
                .update({ status: 'skipped', user_id })
                .eq('recurring_task_id', task.id)
                .eq('date', dateStr)
                .eq('user_id', user_id)
                .select('id')
            if (updErr) throw toError(updErr.message)

            if (!updated || updated.length === 0) {
                const { error } = await supabase.from('task_overrides').insert({
                    user_id,
                    recurring_task_id: task.id,
                    date: dateStr,
                    status: 'skipped',
                })
                if (error) throw toError(error.message)
            }
        } catch (err) {
            const e = err instanceof Error ? err : toError('Erro ao pular tarefa')
            setError(e)
            throw e
        }
        await fetchTasks()
    }

    async function addTask(
        { title, time_start, time_end }: NewTaskInput,
        scope: EditScope
    ) {
        setError(null)
        try {
            const user_id = await getUserId()

            if (scope === 'today') {
                const { error } = await supabase.from('task_overrides').insert({
                    user_id,
                    date: dateStr,
                    status: 'added',
                    title,
                    time_start,
                    time_end: time_end ?? null,
                })
                if (error) throw toError(error.message)
            } else {
                const { error } = await supabase.from('recurring_tasks').insert({
                    user_id,
                    day_of_week: date.getDay(),
                    title,
                    time_start,
                    time_end: time_end ?? null,
                    active: true,
                })
                if (error) throw toError(error.message)
            }
        } catch (err) {
            const e = err instanceof Error ? err : toError('Erro ao salvar tarefa')
            setError(e)
            throw e
        }
        await fetchTasks()
    }

    /**
     * Exclui uma tarefa.
     * - override (avulsa): apaga a linha do dia.
     * - recorrente + 'today': vira skipped (equivalente a pular).
     * - recorrente + 'always': soft delete (`active = false`) para não
     *   quebrar FK dos overrides já criados.
     */
    async function deleteTask(task: DailyTask, scope: EditScope) {
        setError(null)
        try {
            const user_id = await getUserId()

            if (task.source === 'override' || scope === 'today') {
                if (task.source === 'override') {
                    const { error } = await supabase
                        .from('task_overrides')
                        .delete()
                        .eq('id', task.id)
                        .eq('user_id', user_id)
                    if (error) throw toError(error.message)
                } else {
                    // recorrente: apagar só este dia = marcar como skipped
                    await skipTask(task)
                    return
                }
            }

            if (task.source === 'recurring') {
                const { error } = await supabase
                    .from('recurring_tasks')
                    .update({ active: false })
                    .eq('id', task.id)
                    .eq('user_id', user_id)
                if (error) throw toError(error.message)
            }
        } catch (err) {
            const e = err instanceof Error ? err : toError('Erro ao excluir tarefa')
            setError(e)
            throw e
        }
        await fetchTasks()
    }

    return { tasks, loading, error, editTask, skipTask, addTask, deleteTask }
}
