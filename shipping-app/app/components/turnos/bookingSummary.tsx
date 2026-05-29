import type { ReactNode } from 'react'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import type { CompradorTurno, PropiedadTurno } from '@/app/components/turnos/types'

type Props = {
  comprador: CompradorTurno
  propiedad: PropiedadTurno
  selectedDateLabel: string
  selectedTime: string | null
}

export function BookingSummary({
  comprador,
  propiedad,
  selectedDateLabel,
  selectedTime,
}: Props) {
  return (
    <aside className="order-2 self-start space-y-4 lg:col-start-1 lg:row-start-1 lg:mt-[calc(75%+1.5rem)]">
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Reservando como</p>
        <p className="mt-2 text-[15px] font-medium">{comprador.nombre}</p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{comprador.email}</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
        <p className="text-[11px] uppercase tracking-[0.18em] text-accent-warm">Resumen</p>
        <h3 className="mt-2 font-display text-[20px] font-medium leading-snug">
          {propiedad.nombrePropiedad}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {propiedad.direccion}
        </p>
        <div className="mt-5 space-y-3 border-t border-border/60 pt-4 text-[13.5px]">
          <SummaryRow
            icon={<CalendarDays className="h-4 w-4" />}
            label="Dia"
            value={selectedDateLabel}
          />
          <SummaryRow
            icon={<Clock className="h-4 w-4" />}
            label="Horario"
            value={selectedTime ?? '-'}
          />
        </div>
      </div>
    </aside>
  )
}

function SummaryRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">{icon} {label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
