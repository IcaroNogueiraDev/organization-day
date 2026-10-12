import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock3, LoaderCircle, Plus, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DeleteTaskDialog } from '@/components/agenda/DeleteTaskDialog'
import { ProfileDialog } from '@/components/agenda/ProfileDialog'
import { TaskCard } from '@/components/agenda/TaskCard'
import { TaskDialog } from '@/components/agenda/TaskDialog'
import { WeekStrip } from '@/components/agenda/WeekStrip'
import { useDailyTasks } from '@/hooks/useDailyTasks'
import { isSameDay, toLocalTimeString } from '@/lib/dates'
import type { DailyTask } from '@/types'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

/** A tarefa "da vez": a última já iniciada (pelo horário) que ainda não foi concluída. */
function getActiveTaskKey(tasks: DailyTask[], now: Date) {
  const currentTime = toLocalTimeString(now)
  return tasks.reduce<DailyTask | null>(
    (active, task) => (task.time_start.slice(0, 5) <= currentTime && !task.completed ? task : active),
    null,
  )?.task_key
}

function EmptyState() {
  return (
    <Card className="task-empty-state">
      <h2>Como usar o planejador</h2>
      <ol>
        <li><strong>Escolha uma data:</strong> toque em um dia da semana ou use as setas para outra semana. Cada data tem sua agenda.</li>
        <li><strong>Adicione tarefas:</strong> toque no botão + e informe nome, descrição e horário. Escolha se vale só para o dia ou se repete toda semana.</li>
        <li><strong>Acompanhe seu dia:</strong> as tarefas aparecem por horário. No dia atual, a tarefa da vez fica destacada no topo.</li>
        <li><strong>Atualize sua agenda:</strong> toque no círculo para concluir, na tarefa para editar e na lixeira para excluir.</li>
        <li><strong>Lembretes:</strong> ative as notificações em Perfil para ser avisado 10 minutos antes.</li>
      </ol>
      <p className="task-empty-note">Suas tarefas ficam salvas na sua conta e aparecem em qualquer aparelho.</p>
    </Card>
  )
}

export function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const { tasks, loading, error, addTask, editTask, deleteTask, toggleComplete } = useDailyTasks(selectedDate)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editing, setEditing] = useState<DailyTask | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<DailyTask | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentDate(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const isToday = isSameDay(selectedDate, currentDate)
  const activeKey = isToday ? getActiveTaskKey(tasks, currentDate) : undefined
  const orderedTasks = activeKey
    ? [...tasks].sort((a, b) => (a.task_key === activeKey ? -1 : b.task_key === activeKey ? 1 : 0))
    : tasks

  const shiftWeek = (days: number) => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + days)
    setSelectedDate(next)
  }

  const openAdd = () => {
    setCurrentDate(new Date())
    setEditing(null)
    setTaskDialogOpen(true)
  }

  const openEdit = (task: DailyTask) => {
    setEditing(task)
    setTaskDialogOpen(true)
  }

  const handleToggle = (task: DailyTask) => {
    setActionError(null)
    // o hook já desfaz a marcação e guarda o erro; aqui só evitamos a promessa solta
    toggleComplete(task).catch((err: unknown) => setActionError(err instanceof Error ? err.message : 'Erro ao concluir tarefa'))
  }

  const shownError = actionError ?? error?.message

  return (
    <main className="auth-app auth-app-tasks">
      <section className="tasks-screen" aria-labelledby="tasks-title">
        <div className="task-device">
          <header className="task-hero">
            <div>
              <p className="task-date">{dateFormatter.format(selectedDate)}</p>
              <h1 id="tasks-title">{isToday ? 'Hoje' : selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}</h1>
            </div>
            <div className="task-week-nav">
              <Button variant="icon" aria-label="Semana anterior" onClick={() => shiftWeek(-7)}><ChevronLeft aria-hidden="true" /></Button>
              <Button variant="icon" aria-label="Próxima semana" onClick={() => shiftWeek(7)}><ChevronRight aria-hidden="true" /></Button>
            </div>
          </header>
          <WeekStrip selectedDate={selectedDate} onSelectDay={setSelectedDate} />
          {shownError && <div className="form-alert form-alert-error agenda-alert" role="alert">{shownError}</div>}
          <section className="task-timeline" aria-label="Agenda do dia" aria-busy={loading}>
            {loading ? (
              <p className="agenda-status" role="status"><LoaderCircle aria-hidden="true" />Carregando tarefas…</p>
            ) : tasks.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="task-events">
                {orderedTasks.map((task) => (
                  <div className="task-row" key={task.task_key}>
                    <i className={`task-marker${task.task_key === activeKey ? ' is-active' : ''}${task.completed ? ' is-completed' : ''}`} aria-hidden="true" />
                    <TaskCard
                      task={task}
                      active={task.task_key === activeKey}
                      onEdit={() => openEdit(task)}
                      onToggleComplete={() => handleToggle(task)}
                      onDelete={() => setTaskToDelete(task)}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
          <nav className="task-bottom-nav" aria-label="Navegação principal">
            <Button className="task-nav-item task-nav-active" variant="icon" aria-label="Agenda" aria-current="page" onClick={() => setSelectedDate(new Date())}>
              <Clock3 aria-hidden="true" />
              <span>{isToday ? 'Agenda' : 'Hoje'}</span>
            </Button>
            <Button className="task-add-button" variant="icon" aria-label="Adicionar tarefa" onClick={openAdd}>
              <Plus aria-hidden="true" />
            </Button>
            <Button className="task-nav-item task-profile" variant="icon" aria-label="Abrir perfil" onClick={() => setProfileOpen(true)}>
              <UserRound aria-hidden="true" />
              <span>Perfil</span>
            </Button>
          </nav>
        </div>
        <TaskDialog
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          task={editing}
          date={selectedDate}
          onSave={async (input, scope) => {
            if (editing) {
              await editTask(editing, { title: input.title, description: input.description, time_start: input.time_start }, scope)
            } else {
              await addTask(input, scope)
            }
          }}
        />
        <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
        <DeleteTaskDialog task={taskToDelete} onClose={() => setTaskToDelete(null)} onConfirm={deleteTask} />
      </section>
    </main>
  )
}
