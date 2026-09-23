import { useState } from "react";
import { useDailyTasks } from "../hooks/useDailyTasks";
import { ScheduleTable } from "../components/schedule/ScheduleTable";
import { DaySelector } from "../components/schedule/DaySelector";
import { AddTaskButton } from "../components/schedule/AddTaskButton";

/**
 * Página principal: stats do dia, seletor de dia, tabela de tarefas
 * e formulário de criação — tudo dentro de cards DaisyUI.
 */
export function DashboardUser() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { tasks, loading, error, addTask, editTask, skipTask, deleteTask } =
    useDailyTasks(selectedDate);

  const total = tasks.length;
  const recurring = tasks.filter((t) => t.source === "recurring").length;
  const oneOff = total - recurring;

  return (
    <div className="flex flex-col gap-4">
      {/* resumo do dia */}
      <div className="stats stats-vertical sm:stats-horizontal shadow w-full">
        <div className="stat">
          <div className="stat-title">Tarefas do dia</div>
          <div className="stat-value text-primary">{total}</div>
          <div className="stat-desc">
            {selectedDate.toLocaleDateString("pt-BR")}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Recorrentes</div>
          <div className="stat-value text-secondary">{recurring}</div>
          <div className="stat-desc">repetem toda semana</div>
        </div>
        <div className="stat">
          <div className="stat-title">Só hoje</div>
          <div className="stat-value">{oneOff}</div>
          <div className="stat-desc">avulsas deste dia</div>
        </div>
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error.message}</span>
        </div>
      )}

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body gap-4 p-4 md:p-6">
          <div className="overflow-x-auto">
            <DaySelector
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>

          <ScheduleTable
            tasks={tasks}
            loading={loading}
            onEdit={editTask}
            onSkip={skipTask}
            onDelete={deleteTask}
          />

          <div className="card-actions justify-end">
            <AddTaskButton onAdd={addTask} />
          </div>
        </div>
      </div>
    </div>
  );
}
