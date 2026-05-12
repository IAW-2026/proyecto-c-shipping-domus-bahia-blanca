import { z } from 'zod'

export const historialTurnoCreateSchema = z.object({
  turnoId: z.string().min(1),
  estado: z.enum([
    'PENDIENTE_AGENTE',
    'PRE_ACEPTADO',
    'RECHAZADO_VENDEDOR',
    'CONFIRMADO',
    'CANCELADO',
    'COMPLETADO',
  ]),
  detalle: z.string().optional(),
  realizadoPor: z.string().min(1),
})

export const historialTurnoUpdateSchema = historialTurnoCreateSchema
  .omit({ turnoId: true })
  .partial()
