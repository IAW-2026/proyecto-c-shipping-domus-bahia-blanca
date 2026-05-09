import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// En desarrollo reutilizamos una única instancia de PrismaClient
// para evitar múltiples conexiones causadas por el hot reload
// ya que Next.js recompila y vuelve a ejecutar módulos constantemente
// durante el desarrollo. Si creáramos un PrismaClient nuevo
// en cada recarga, terminaríamos acumulando muchas conexiones
// abiertas a la base de datos.
//
// En producción no ocurre ese problema, por lo que se crea
// una instancia nueva normalmente.