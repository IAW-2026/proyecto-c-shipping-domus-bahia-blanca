import type { Prisma } from '@prisma/client'
import { DashboardImage } from './dashboardImage'
import { UpcomingTurnos } from './upcomingTurnos'

type UpcomingTurno = Prisma.TurnoGetPayload<{
  include: {
    propiedad: true
  }
}>

type DashboardScheduleSectionProps = {
  upcoming: UpcomingTurno[]
}

export function DashboardScheduleSection({ upcoming }: DashboardScheduleSectionProps) {
  return (
    <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-stretch">
      <DashboardImage />
      <UpcomingTurnos turnos={upcoming} />
    </section>
  )
}
