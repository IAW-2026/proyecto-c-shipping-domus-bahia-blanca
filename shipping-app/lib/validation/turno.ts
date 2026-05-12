import { z } from 'zod'

export const turnoCreateSchema = z.object({
  propiedadId: z.string().min(1),
  compradorId: z.string().min(1),
  vendedorId: z.string().min(1),
  fechaHoraSolicitada: z.coerce.date(),
  observaciones: z.string().optional(),
})

export const turnoTomarSchema = z.object({
  agenteId: z.string().min(1),
})

export const turnoAgenteAceptarSchema = z.object({
  estado: z.literal('PRE_ACEPTADO'),
})

export const turnoVendedorResponseSchema = z.object({
  estado: z.enum(['CONFIRMADO', 'RECHAZADO_VENDEDOR']),
  fechaHoraConfirmada: z.coerce.date(),
})


export const turnoUpdateSchema = z.object({
  fechaHoraSolicitada: z.coerce.date().optional(),
  observaciones: z.string().optional(),
})