import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { DailyTask, EditScope } from '@/types'

function DeleteBody({ task, onConfirm }: { task: DailyTask; onConfirm: (scope: EditScope) => Promise<void> }) {
  const [scope, setScope] = useState<EditScope>('today')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recurring = task.recurring_task_id !== null

  const confirm = async () => {
    setBusy(true)
    setError(null)
    try {
      await onConfirm(recurring ? scope : 'today')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir tarefa')
      setBusy(false)
    }
  }

  return (
    <>
      {recurring && (
        <div className="scope-options" role="radiogroup" aria-label="O que excluir">
          <label className="scope-option">
            <input type="radio" name="delete-scope" checked={scope === 'today'} onChange={() => setScope('today')} />
            Só neste dia
          </label>
          <label className="scope-option">
            <input type="radio" name="delete-scope" checked={scope === 'always'} onChange={() => setScope('always')} />
            Todas as semanas
          </label>
        </div>
      )}
      {error && <p className="dialog-error" role="alert">{error}</p>}
      <DialogFooter>
        <DialogClose asChild><Button className="dialog-secondary" variant="secondary">Cancelar</Button></DialogClose>
        <Button className="task-delete-confirm" variant="submit" disabled={busy} onClick={confirm}>
          {busy ? 'Excluindo…' : 'Excluir tarefa'}
        </Button>
      </DialogFooter>
    </>
  )
}

export function DeleteTaskDialog({
  task,
  onClose,
  onConfirm,
}: {
  task: DailyTask | null
  onClose: () => void
  onConfirm: (task: DailyTask, scope: EditScope) => Promise<void>
}) {
  return (
    <Dialog open={task !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="task-delete-dialog">
        <DialogHeader>
          <div>
            <p className="task-dialog-eyebrow">REMOVER DA AGENDA</p>
            <DialogTitle>Excluir esta tarefa?</DialogTitle>
            <DialogDescription>A tarefa “{task?.title}” será removida da sua agenda.</DialogDescription>
          </div>
          <DialogClose asChild>
            <Button className="dialog-close" variant="icon" aria-label="Fechar confirmação"><X aria-hidden="true" /></Button>
          </DialogClose>
        </DialogHeader>
        {task && (
          <DeleteBody
            key={task.task_key}
            task={task}
            onConfirm={async (scope) => { await onConfirm(task, scope); onClose() }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
