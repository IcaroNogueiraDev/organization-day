import { useState } from "react";
import type { EditScope, NewTaskInput } from "../../types";

interface AddTaskButtonProps {
  onAdd: (input: NewTaskInput, scope: EditScope) => Promise<void>;
}

/**
 * Formulário inline (em um card DaisyUI) para criar tarefa
 * recorrente ("sempre") ou avulsa ("só hoje").
 */
export function AddTaskButton({ onAdd }: AddTaskButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [timeStart, setTimeStart] = useState("");
  const [scope, setScope] = useState<EditScope>("today");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !timeStart) return;

    setSubmitting(true);
    setError(null);
    try {
      await onAdd({ title, time_start: timeStart }, scope);
      // reseta o form e fecha só em caso de sucesso
      setTitle("");
      setTimeStart("");
      setScope("today");
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar tarefa");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button className="btn btn-primary btn-sm" onClick={() => setIsOpen(true)}>
        + Adicionar tarefa
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-3 border border-base-300 rounded-box p-4 bg-base-200"
    >
      {error && (
        <div role="alert" className="alert alert-error py-2 text-sm">
          <span>{error}</span>
        </div>
      )}

      <input
        type="text"
        placeholder="Nome da tarefa"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="input input-bordered w-full"
      />

      <label className="form-control w-full max-w-40">
        <div className="label py-1">
          <span className="label-text text-sm">Horário</span>
        </div>
        <input
          type="time"
          value={timeStart}
          onChange={(e) => setTimeStart(e.target.value)}
          required
          className="input input-bordered"
        />
      </label>

      {/* decide se a tarefa é só de hoje ou repete toda semana */}
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="label cursor-pointer gap-2">
          <input
            type="radio"
            name="scope"
            className="radio radio-primary"
            checked={scope === "today"}
            onChange={() => setScope("today")}
          />
          <span className="label-text">Só hoje</span>
        </label>
        <label className="label cursor-pointer gap-2">
          <input
            type="radio"
            name="scope"
            className="radio radio-primary"
            checked={scope === "always"}
            onChange={() => setScope("always")}
          />
          <span className="label-text">Toda semana, nesse dia</span>
        </label>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setIsOpen(false);
            setError(null);
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={`btn btn-primary btn-sm ${submitting ? "btn-disabled" : ""}`}
          disabled={submitting}
        >
          {submitting ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            "Salvar"
          )}
        </button>
      </div>
    </form>
  );
}
