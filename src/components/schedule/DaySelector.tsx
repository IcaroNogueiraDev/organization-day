import type { DayOfWeek } from "../../types";

const DAY_LABELS: Record<DayOfWeek, string> = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
};

interface DaySelectorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

/**
 * Seletor dos 7 dias da semana corrente (dom–sáb), responsivo
 * com scroll horizontal quando não couber na largura da tela.
 */
export function DaySelector({ selectedDate, onSelectDate }: DaySelectorProps) {
  const today = new Date();

  // gera os 7 dias da semana atual (domingo a sábado), a partir de hoje
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // volta até o domingo

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  function isSameDay(a: Date, b: Date) {
    return a.toDateString() === b.toDateString();
  }

  return (
    <div role="tablist" className="tabs tabs-boxed w-max min-w-full">
      {weekDays.map((date) => {
        const dayOfWeek = date.getDay() as DayOfWeek;
        const isSelected = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, today);

        return (
          <button
            key={date.toISOString()}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectDate(date)}
            className={`tab flex-col h-auto py-2 gap-0.5 ${isSelected ? "tab-active" : ""}`}
          >
            <span className="text-xs font-medium">{DAY_LABELS[dayOfWeek]}</span>
            <span className={`text-lg leading-none ${isToday ? "text-primary font-bold" : ""}`}>
              {date.getDate()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
