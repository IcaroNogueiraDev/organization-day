import { Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { DailyTask } from '@/types'

export function TaskCard({
  task,
  active,
  onEdit,
  onToggleComplete,
  onDelete,
}: {
  task: DailyTask
  active: boolean
  onEdit: () => void
  onToggleComplete: () => void
  onDelete: () => void
}) {
  return (
    <Card className={task.completed ? 'task-event-completed' : ''} variant={active ? 'featured' : 'default'}>
      {active && <h2 className="task-current-label">O que você precisa fazer agora:</h2>}
      <button className="task-card-body" type="button" onClick={onEdit} aria-label={`Editar tarefa ${task.title}`}>
        <header className="task-event-heading">
          <h2>{task.title}</h2>
          <time>{task.time_start.slice(0, 5)}</time>
        </header>
        {task.description && <p>{task.description}</p>}
        {task.recurring_task_id && <span className="task-recurring-tag">Repete toda semana</span>}
      </button>
      <div className="task-card-actions">
        <Button
          className="task-complete-button"
          variant="icon"
          aria-label={task.completed ? `Desmarcar ${task.title} como concluída` : `Marcar ${task.title} como concluída`}
          aria-pressed={task.completed}
          onClick={onToggleComplete}
        >
          {task.completed && <Check aria-hidden="true" />}
        </Button>
        <Button className="task-delete-button" variant="icon" aria-label={`Excluir tarefa ${task.title}`} onClick={onDelete}>
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </Card>
  )
}
