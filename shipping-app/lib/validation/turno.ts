import { z } from 'zod'

export const turnoCreateSchema = z.object({
  propiedadId: z.string().min(1),
  compradorId: z.string().min(1),
  vendedorId: z.string().min(1),
  nombrePropiedad: z.string().optional().nullable(),
  descripcion: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  barrio: z.string().optional().nullable(),
  ciudad: z.string().optional().nullable(),
  provincia: z.string().optional().nullable(),
  pais: z.string().optional().nullable(),
  codigoPostal: z.string().optional().nullable(),
  latitud: z.number().optional().nullable(),
  longitud: z.number().optional().nullable(),
  precio: z.union([z.string(), z.number()]).optional().nullable(),
  expensas: z.union([z.string(), z.number()]).optional().nullable(),
  moneda: z.string().optional(),
  ambientes: z.number().int().optional().nullable(),
  dormitorios: z.number().int().optional().nullable(),
  banios: z.number().int().optional().nullable(),
  metrosTotales: z.number().int().optional().nullable(),
  metrosCubiertos: z.number().int().optional().nullable(),
  antiguedad: z.string().optional().nullable(),
  condicion: z.string().optional().nullable(),
  nombreInmobiliaria: z.string().optional().nullable(),
  multimedia: z.array(z.object({
    id: z.string().min(1),
    url: z.string().min(1),
    alt: z.string().optional().nullable(),
    order: z.number().int().optional().nullable(),
  })).optional(),
})

export const turnoTomarSchema = z.object({
  agenteId: z.string().min(1),
})

export const turnoAgenteAceptarSchema = z.object({
  estado: z.literal('PRE_ACEPTADO'),
})

export const turnoVendedorResponseSchema = z.object({
  estado: z.enum(['CONFIRMADO', 'PENDIENTE_AGENTE']),
})


export const turnoUpdateSchema = z.object({
  fechaHoraSolicitada: z.coerce.date().optional(),
  observaciones: z.string().optional(),
})
