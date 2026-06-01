import { Loader2 } from 'lucide-react'

type Props = {
  observaciones: string
  submitError: string | null
  isPending: boolean
  canSubmit: boolean
  onObservacionesChange: (value: string) => void
  onSubmit: () => void
}

export function BookingNotes({
  observaciones,
  submitError,
  isPending,
  canSubmit,
  onObservacionesChange,
  onSubmit,
}: Props) {
  return (
    <div className="order-4 mt-4 rounded-2xl border border-border/60 bg-card p-6 shadow-soft space-y-4 lg:col-start-2 lg:row-start-1 lg:mt-[calc(150%+1.5rem)] lg:self-start">
      <div className="space-y-1.5">
        <p className="text-[12.5px] font-medium">Notas (opcional)</p>
        <textarea
          rows={3}
          value={observaciones}
          onChange={(event) => onObservacionesChange(event.target.value)}
          placeholder="Algo que el agente deba saber antes de la visita?"
          className="w-full rounded-lg border border-border/80 bg-background px-3 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>
      <button
        type="button"
        disabled={!canSubmit || isPending}
        onClick={onSubmit}
        className="h-11 w-full rounded-lg bg-primary text-[14px] font-medium tracking-wide text-white shadow-soft hover:bg-[oklch(0.36_0.03_150)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? 'Confirmando...' : 'Confirmar reserva'}
      </button>
      {submitError && (
        <p className="text-center text-[12px] font-medium text-red-600">
          {submitError}
        </p>
      )}
      <p className="text-center text-[11.5px] text-muted-foreground">
        Recibiras la confirmacion por mail y un recordatorio 24 hs antes.
      </p>
    </div>
  )
}
