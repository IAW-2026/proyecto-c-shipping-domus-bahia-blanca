import { z } from 'zod'

export const agenteCreateSchema = z.object({
  id: z.string().min(1),
  nombreCompleto: z.string().min(1),
  email: z.string().email(),
  telefono: z.string().min(1),
  vendedorId: z.string().min(1),
})

export const agenteUpdateSchema = agenteCreateSchema.partial().omit({ id: true })

export const agentePerfilSchema = z.object({
  nombreCompleto: z.string().min(1).optional(),
  telefono: z.string().min(1).max(15).regex(/^\d+$/),
  vendedorId: z.string().min(1),
})
