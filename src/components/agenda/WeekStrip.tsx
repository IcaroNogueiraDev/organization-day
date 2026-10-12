import { Button } from '@/components/ui/button'
import { isSameDay } from '@/lib/dates'

const weekDayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

/** Os 7 dias (segunda a domingo) da semana da data selecionada. */
function getWeekDays(selectedDate: Date) {
  const monday = new Date(selectedDate)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))

  return weekDayLabels.map((label, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return { label, date, selected: isSameDay(date, selectedDate) }
  })
}

export function WeekStrip({ selectedDate, onSelectDay }: { selectedDate: Date; onSelectDay: (date: Date) => void }) {
  return (
    <nav className="task-week" aria-label="Dias da semana">
      {getWeekDays(selectedDate).map((day) => (
        <Button
          className={`task-day${day.selected ? ' is-selected' : ''}`}
          variant="icon"
          key={day.date.getTime()}
          aria-pressed={day.selected}
          onClick={() => onSelectDay(day.date)}
        >
          <span>{day.label}</span>
          <strong>{day.date.getDate()}</strong>
          {day.selected && <i aria-hidden="true" />}
        </Button>
      ))}
    </nav>
  )
}
