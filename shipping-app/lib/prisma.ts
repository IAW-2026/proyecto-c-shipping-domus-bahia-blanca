import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}
//Especie de middleware para automatizar el cambio de estado dentro de estado. 
// Ej: Si cambia de estado de PRE_ACEPTADO a CONFIRMADO luego aqui estadoComprador que estaba en PENDIENTE 
// pasa a CONFIRMADO.
function createPrismaClient() {
  return new PrismaClient().$extends({
    query: {
      turno: {
        async update({ args, query }) {
          const estado = args.data?.estado

          if (estado) {
            const estadoComprador =
              estado === 'CONFIRMADO' ? 'CONFIRMADO' :
              estado === 'CANCELADO'  ? 'CANCELADO'  :
              estado === 'COMPLETADO' ? 'COMPLETADO' :
              'PENDIENTE'

            args.data.estadoComprador = estadoComprador
          }

          return query(args)
        },
      },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

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