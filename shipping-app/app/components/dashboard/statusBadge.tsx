import { cn } from "@/lib/utils"
import type { EstadoTurno } from "@prisma/client"

const statusStyles: Record<EstadoTurno, { label: string; chip: string; dot: string }> = {
  PENDIENTE_AGENTE: {
    label: "Pendiente",
    chip: "bg-[oklch(0.62_0.07_60_/_0.12)] text-[oklch(0.45_0.07_60)] ring-1 ring-inset ring-[oklch(0.62_0.07_60_/_0.2)]",
    dot: "bg-[oklch(0.62_0.07_60)]",
  },
  PRE_ACEPTADO: {
    label: "Pre-aceptado",
    chip: "bg-[oklch(0.72_0.06_130_/_0.2)] text-[oklch(0.38_0.06_140)] ring-1 ring-inset ring-[oklch(0.72_0.06_130_/_0.3)]",
    dot: "bg-[oklch(0.59_0.05_145)]",
  },
  CONFIRMADO: {
    label: "Confirmado",
    chip: "bg-[oklch(0.42_0.03_150_/_0.12)] text-primary ring-1 ring-inset ring-[oklch(0.42_0.03_150_/_0.25)]",
    dot: "bg-primary",
  },
  COMPLETADO: {
    label: "Completado",
    chip: "bg-secondary text-muted-foreground ring-1 ring-inset ring-border",
    dot: "bg-muted-foreground",
  },
  CANCELADO: {
    label: "Cancelado",
    chip: "bg-[oklch(0.62_0.11_40_/_0.12)] text-[oklch(0.5_0.13_35)] ring-1 ring-inset ring-[oklch(0.62_0.11_40_/_0.25)]",
    dot: "bg-accent",
  }
}

export function StatusBadge({
  status,
  className,
}: {
  status: EstadoTurno
  className?: string
}) {
  const s = statusStyles[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium",
        s.chip,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  )
}