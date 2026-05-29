import { z } from 'zod'

export const turnoCreateSchema = z.object({
  propiedadId: z.string().min(1),
  compradorId: z.string().min(1),
  vendedorId: z.string().min(1),
  nombrePropiedad: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  latitud: z.number().optional().nullable(),
  longitud: z.number().optional().nullable(),
  nombreInmobiliaria: z.string().optional().nullable(),
})

export const turnoTomarSchema = z.object({
  agenteId: z.string().min(1),
})

export const turnoAgenteAceptarSchema = z.object({
  estado: z.literal('PRE_ACEPTADO'),
})

export const turnoVendedorResponseSchema = z.object({
  estado: z.enum(['CONFIRMADO', 'RECHAZADO_VENDEDOR']),
})


export const turnoUpdateSchema = z.object({
  fechaHoraSolicitada: z.coerce.date().optional(),
  observaciones: z.string().optional(),
})
