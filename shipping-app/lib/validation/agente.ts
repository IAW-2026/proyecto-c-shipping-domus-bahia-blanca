import { z } from 'zod'

export const agenteCreateSchema = z.object({
  clerkUserId: z.string().min(1),
  nombreCompleto: z.string().min(1),
  email: z.string().email(),
  telefono: z.string().min(1),
  vendedorId: z.string().min(1),
})

export const agenteUpdateSchema = agenteCreateSchema.partial().omit({ clerkUserId: true })