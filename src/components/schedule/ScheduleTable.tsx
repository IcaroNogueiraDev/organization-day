import type { DailyTask, EditScope, TaskUpdates } from "../../types";
import { TaskRow } from "./TaskRow";

interface ScheduleTableProps {
  tasks: DailyTask[];
  loading: boolean;
  onEdit: (task: DailyTask, updates: TaskUpdates, scope: EditScope) => Promise<void>;
  onSkip: (task: DailyTask) => Promise<void>;
  onDelete: (task: DailyTask, scope: EditScope) => Promise<void>;
}

/**
 * Lista as tarefas do dia em tabela responsiva (scroll horizontal no mobile).
 */
export function ScheduleTable({
  tasks,
  loading,
  onEdit,
  onSkip,
  onDelete,
}: ScheduleTableProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-sm opacity-60">Carregando tarefas...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="alert alert-ghost justify-start">
        <span>Nenhuma tarefa pra esse dia.</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Horário</th>
            <th>Tarefa</th>
            <th className="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onEdit={onEdit}
              onSkip={onSkip}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
