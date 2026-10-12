import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toLocalTimeString } from '@/lib/dates'
import type { DailyTask, EditScope, NewTaskInput } from '@/types'

type TaskDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Tarefa sendo editada; sem ela o diálogo cria uma nova. */
  task: DailyTask | null
  date: Date
  onSave: (input: NewTaskInput, scope: EditScope) => Promise<void>
}

function TaskForm({ task, date, onSave }: Pick<TaskDialogProps, 'task' | 'date' | 'onSave'>) {
  const [timeZone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'fuso horário local')
  const [time, setTime] = useState(() => (task ? task.time_start.slice(0, 5) : toLocalTimeString(new Date())))
  const [scope, setScope] = useState<EditScope>('today')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // tarefa avulsa só existe naquele dia: não há o que repetir
  const canChooseScope = !task || task.recurring_task_id !== null
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setSaving(true)
    setError(null)
    try {
      await onSave(
        {
          title: String(formData.get('title')).trim(),
          description: String(formData.get('description')).trim() || null,
          time_start: time,
        },
        canChooseScope ? scope : 'today',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar tarefa')
      setSaving(false)
    }
  }

  return (
    <form className="task-dialog-form" onSubmit={handleSubmit}>
      <label className="dialog-field" htmlFor="task-title">
        <span>Nome da tarefa</span>
        <Input id="task-title" name="title" placeholder="Ex.: Caminhada" maxLength={60} defaultValue={task?.title} required autoFocus />
      </label>
      <label className="dialog-field" htmlFor="task-description">
        <span>Descrição (opcional)</span>
        <Textarea id="task-description" name="description" placeholder="Adicione alguns detalhes" rows={3} maxLength={240} defaultValue={task?.description ?? ''} />
      </label>
      <label className="dialog-field" htmlFor="task-time">
        <span>Horário</span>
        <Input id="task-time" name="time" type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
        <small>Horário local · {timeZone}</small>
      </label>
      {canChooseScope && (
        <fieldset className="dialog-field" style={{ border: 0, padding: 0, margin: 0 }}>
          <span>Quando</span>
          <div className="scope-options">
            <label className="scope-option">
              <input type="radio" name="scope" checked={scope === 'today'} onChange={() => setScope('today')} />
              Só neste dia
            </label>
            <label className="scope-option">
              <input type="radio" name="scope" checked={scope === 'always'} onChange={() => setScope('always')} />
              Toda {weekday}
            </label>
          </div>
        </fieldset>
      )}
      {error && <p className="dialog-error" role="alert">{error}</p>}
      <DialogFooter>
        <DialogClose asChild><Button variant="secondary" type="button">Cancelar</Button></DialogClose>
        <Button className="submit-button" variant="submit" type="submit" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar tarefa'}
        </Button>
      </DialogFooter>
    </form>
  )
}

/** Diálogo único para adicionar e editar tarefa (o formulário reinicia a cada abertura). */
export function TaskDialog({ open, onOpenChange, task, date, onSave }: TaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="task-dialog" aria-describedby="task-dialog-description">
        <DialogHeader>
          <div>
            <p className="task-dialog-eyebrow">SUA AGENDA</p>
            <DialogTitle>{task ? 'Editar tarefa' : 'Adicionar tarefa'}</DialogTitle>
            <DialogDescription id="task-dialog-description">
              {task ? 'Altere os detalhes da tarefa.' : 'Preencha os detalhes para incluir uma tarefa na agenda.'}
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button variant="close" aria-label="Fechar"><X aria-hidden="true" /></Button>
          </DialogClose>
        </DialogHeader>
        <TaskForm task={task} date={date} onSave={async (input, scope) => { await onSave(input, scope); onOpenChange(false) }} />
      </DialogContent>
    </Dialog>
  )
}
