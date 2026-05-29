import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  cursor: Date
  today: Date
  cells: (Date | null)[]
  dayLabels: string[]
  monthLabels: string[]
  timeSlots: string[]
  selectedDate: Date | null
  selectedDateLabel: string | null
  selectedTime: string | null
  bookedTimesForSelectedDate: string[]
  onCursorChange: (date: Date) => void
  onSelectedDateChange: (date: Date) => void
  onSelectedTimeChange: (time: string) => void
  isSameDay: (a: Date, b: Date) => boolean
}

export function VisitCalendar({
  cursor,
  today,
  cells,
  dayLabels,
  monthLabels,
  timeSlots,
  selectedDate,
  selectedDateLabel,
  selectedTime,
  bookedTimesForSelectedDate,
  onCursorChange,
  onSelectedDateChange,
  onSelectedTimeChange,
  isSameDay,
}: Props) {
  return (
    <div className="order-3 self-start rounded-2xl border border-border/60 bg-card p-6 shadow-soft lg:col-start-2 lg:row-start-1">
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[12.5px] font-medium text-muted-foreground">Elegi un dia</p>
            <p className="mt-0.5 font-display text-[18px] text-foreground">
              {monthLabels[cursor.getMonth()]} {cursor.getFullYear()}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onCursorChange(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="h-9 w-9 rounded-lg border border-border/70 inline-flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onCursorChange(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="h-9 w-9 rounded-lg border border-border/70 inline-flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {dayLabels.map((day) => (
            <div key={day} className="py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {day}
            </div>
          ))}
          {cells.map((cell, index) => {
            if (!cell) return <div key={index} className="h-8 rounded-lg" />

            const disabled = cell < today || cell.getDay() === 0
            const isSelected = selectedDate && isSameDay(cell, selectedDate)
            const isToday = isSameDay(cell, today)

            return (
              <button
                key={index}
                type="button"
                disabled={disabled}
                onClick={() => onSelectedDateChange(cell)}
                className={cn(
                  'h-8 rounded-lg text-[13.5px] font-medium transition-all hover:bg-secondary',
                  disabled && 'text-muted-foreground/40 hover:bg-transparent cursor-not-allowed',
                  !disabled && !isSelected && 'text-foreground',
                  isToday && !isSelected && 'ring-1 ring-inset ring-border',
                  isSelected && 'bg-primary text-primary-foreground hover:bg-primary shadow-soft',
                )}
              >
                {cell.getDate()}
              </button>
            )
          })}
        </div>
      </div>

      <div className="min-h-[184px]">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-[12.5px] font-medium">Elegi un horario</p>
          {selectedDateLabel && (
            <p className="text-[12px] text-muted-foreground">{selectedDateLabel}</p>
          )}
        </div>
        {selectedDate ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {timeSlots.map((time) => {
              const isBooked = bookedTimesForSelectedDate.includes(time)

              return (
                <button
                  key={time}
                  type="button"
                  disabled={isBooked}
                  title={isBooked ? 'Horario no disponible' : undefined}
                  onClick={() => onSelectedTimeChange(time)}
                  className={cn(
                    'h-8 rounded-lg border text-[13px] font-medium transition-all',
                    isBooked && 'cursor-not-allowed border-border/50 bg-secondary/50 text-muted-foreground/50',
                    !isBooked && selectedTime === time
                      ? 'border-primary bg-primary text-primary-foreground shadow-soft'
                      : !isBooked && 'border-border/70 bg-background text-foreground hover:border-primary/40 hover:bg-secondary',
                  )}
                >
                  {time}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex h-[152px] items-center justify-center rounded-xl border border-dashed border-border/70 bg-secondary/30 text-[13px] text-muted-foreground">
            Selecciona un dia para ver horarios disponibles
          </div>
        )}
      </div>
    </div>
  )
}
