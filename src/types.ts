// ============================================================
// Tipos que espelham as tabelas do Supabase (schema.sql)
// ============================================================

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = domingo ... 6 = sábado

export interface RecurringTask {
    id: string
    user_id: string
    day_of_week: DayOfWeek
    time_start: string // formato 'HH:mm:ss'
    time_end: string | null
    title: string
    active: boolean
    created_at: string
}

export type OverrideStatus = 'skipped' | 'edited' | 'added'

export interface TaskOverride {
    id: string
    user_id: string
    recurring_task_id: string | null // null quando status = 'added'
    date: string // formato 'YYYY-MM-DD'
    title: string | null
    time_start: string | null
    time_end: string | null
    status: OverrideStatus
    created_at: string
}

export interface Profile {
    id: string
    full_name: string | null
    created_at: string
}

// ============================================================
// Tipo de retorno da function get_tasks_for_day (já mergeado)
// ============================================================

export type TaskSource = 'recurring' | 'override'

export interface DailyTask {
    id: string
    title: string
    time_start: string
    time_end: string | null
    source: TaskSource
}

// ============================================================
// Tipos usados pelos hooks
// ============================================================

// 'today' = cria override só pra data atual
// 'always' = altera a recurring_task pra sempre
export type EditScope = 'today' | 'always'

export interface TaskUpdates {
    title?: string
    time_start?: string
    time_end?: string | null
}

export interface NewTaskInput {
    title: string
    time_start: string
    time_end?: string | null
}

// dia da semana em que a nova tarefa recorrente deve se repetir
// (só usado quando addTask é chamado com scope 'always')
export interface NewRecurringTaskInput extends NewTaskInput {
    day_of_week: DayOfWeek
}

// Retorno do hook useDailyTasks
export interface UseDailyTasksResult {
    tasks: DailyTask[]
    loading: boolean
    error: Error | null
    editTask: (task: DailyTask, updates: TaskUpdates, scope: EditScope) => Promise<void>
    skipTask: (task: DailyTask) => Promise<void>
    addTask: (input: NewTaskInput, scope: EditScope) => Promise<void>
    // 'today' = remove só este dia; 'always' = remove a recorrente (soft delete)
    deleteTask: (task: DailyTask, scope: EditScope) => Promise<void>
}

// Retorno do hook useAuth / valor do AuthContext
// signUp devolve true quando o Supabase criou a sessão junto com a conta
// (sem confirmação de email); false = precisa confirmar o email antes do login.
export interface AuthContextValue {
    user: { id: string; email?: string } | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string) => Promise<boolean>
    signOut: () => Promise<void>
}