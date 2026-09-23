import { useState } from "react";
import type { DailyTask, EditScope, TaskUpdates } from "../../types";

interface TaskRowProps {
  task: DailyTask;
  onEdit: (task: DailyTask, updates: TaskUpdates, scope: EditScope) => Promise<void>;
  onSkip: (task: DailyTask) => Promise<void>;
  onDelete: (task: DailyTask, scope: EditScope) => Promise<void>;
}

/**
 * Uma linha da tabela de tarefas: visualização, edição inline e exclusão
 * com confirmação — erros do backend aparecem na própria linha.
 */
export function TaskRow({ task, onEdit, onSkip, onDelete }: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [timeStart, setTimeStart] = useState(task.time_start);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOverride = task.source === "override";

  async function handleSave(scope: EditScope) {
    setBusy(true);
    setError(null);
    try {
      await onEdit(task, { title, time_start: timeStart }, scope);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao editar tarefa");
    } finally {
      setBusy(false);
    }
  }

  async function handleSkip() {
    setBusy(true);
    setError(null);
    try {
      await onSkip(task);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao pular tarefa");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      // avulsa: só existe hoje → apaga a linha;
      // recorrente: remove a definição semanal
      await onDelete(task, isOverride ? "today" : "always");
      setConfirmDelete(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir tarefa");
    } finally {
      setBusy(false);
    }
  }

  function handleCancel() {
    setTitle(task.title);
    setTimeStart(task.time_start);
    setError(null);
    setIsEditing(false);
  }

  if (error) {
    return (
      <tr className="border-b">
        <td colSpan={3} className="p-2">
          <div role="alert" className="alert alert-error py-2 text-sm">
            <span>{error}</span>
            <button
              className="btn btn-ghost btn-xs"
              onClick={() => setError(null)}
            >
              Fechar
            </button>
          </div>
        </td>
      </tr>
    );
  }

  if (isEditing) {
    return (
      <tr className="border-b">
        <td className="p-2">
          <input
            type="time"
            value={timeStart}
            onChange={(e) => setTimeStart(e.target.value)}
            className="input input-bordered input-sm w-28"
          />
        </td>
        <td className="p-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input input-bordered input-sm w-full"
          />
        </td>
        <td className="p-2">
          <div className="flex flex-wrap gap-1 justify-end">
            <button
              onClick={() => handleSave("today")}
              disabled={busy}
              className="btn btn-xs btn-outline btn-primary"
            >
              Salvar só hoje
            </button>
            {/* "sempre" só faz sentido para tarefa recorrente */}
            {!isOverride && (
              <button
                onClick={() => handleSave("always")}
                disabled={busy}
                className="btn btn-xs btn-primary"
              >
                Salvar sempre
              </button>
            )}
            <button
              onClick={handleCancel}
              disabled={busy}
              className="btn btn-xs btn-ghost"
            >
              Cancelar
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b hover:bg-base-200/50">
      <td className="font-mono text-sm">{task.time_start.slice(0, 5)}</td>
      <td>{task.title}</td>
      <td>
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={() => setIsEditing(true)}
            disabled={busy}
            className="btn btn-xs btn-ghost text-primary"
          >
            Editar
          </button>

          {task.source === "recurring" && (
            <button
              onClick={handleSkip}
              disabled={busy}
              className="btn btn-xs btn-ghost"
            >
              Pular hoje
            </button>
          )}

          {confirmDelete ? (
            <>
              <button
                onClick={handleDelete}
                disabled={busy}
                className="btn btn-xs btn-error"
              >
                {busy ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  "Confirmar"
                )}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={busy}
                className="btn btn-xs btn-ghost"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={busy}
              className="btn btn-xs btn-ghost text-error"
            >
              Excluir
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
