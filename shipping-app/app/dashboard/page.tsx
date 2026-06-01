import { prisma } from '@/lib/prisma'
import { AppTopbar } from '@/app/components/dashboard/topBar'
import { requireAgente } from '@/lib/auth/requireAgente'
import { CalendarCheck2, CheckCircle2, Clock3 } from 'lucide-react'
import { DashboardHeader } from '../components/dashboard/dashboardHeader'
import { DashboardScheduleSection } from '../components/dashboard/dashboardScheduleSection'
import { MetricsSection } from '../components/dashboard/metricsSection'

export const metadata = {
  title: 'Dashboard - Domus',
  description: 'Resumen de turnos, metricas y proximas visitas del agente inmobiliario.',
}

export default async function DashboardPage() {
  const agente = await requireAgente()
  const agenteVendedorId = agente.vendedorId ?? ''

  const [upcoming, pendientesCount, confirmadasCount, completadasCount] = await Promise.all([
    prisma.turno.findMany({
      where: {
        agenteId: agente.id,
        estado: { in: ['PRE_ACEPTADO', 'CONFIRMADO'] },
      },
      orderBy: { fechaHoraSolicitada: 'asc' },
      take: 12,
      include: {
        propiedad: true,
      },
    }),
    prisma.turno.count({
      where: {
        vendedorId: agenteVendedorId,
        estado: 'PENDIENTE_AGENTE',
        agenteId: null,
        fechaHoraSolicitada: {
          gt: new Date(),
        },
      },
    }),
    prisma.turno.count({
      where: {
        agenteId: agente.id,
        estado: 'CONFIRMADO',
      },
    }),
    prisma.turno.count({
      where: {
        agenteId: agente.id,
        estado: 'COMPLETADO',
      },
    }),
  ])

  const firstName = agente.nombreCompleto?.split(' ')[0] ?? 'Agente'

  const metrics = [
    {
      label: 'Turnos pendientes',
      value: pendientesCount.toString(),
      delta: 'Sin agente asignado',
      icon: Clock3,
      accent: 'bg-[oklch(0.62_0.07_60_/_0.12)] text-[oklch(0.45_0.07_60)]',
    },
    {
      label: 'Turnos confirmados',
      value: confirmadasCount.toString(),
      delta: 'Confirmadas por vendedor',
      icon: CalendarCheck2,
      accent: 'bg-[oklch(0.42_0.03_150_/_0.12)] text-primary',
    },
    {
      label: 'Turnos completados',
      value: completadasCount.toString(),
      delta: 'Mes en curso',
      icon: CheckCircle2,
      accent: 'bg-[oklch(0.72_0.06_130_/_0.18)] text-[oklch(0.38_0.06_140)]',
    },
  ]

  return (
    <>
      <AppTopbar crumbs={[{ label: 'Inicio' }, { label: 'Dashboard' }]} />
      <main className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
        <DashboardHeader firstName={firstName} />

        {/* Metricas */}
        <MetricsSection metrics={metrics} />

        {/* ProximasVisitas + imagen */}
        <DashboardScheduleSection upcoming={upcoming} />
      </main>
    </>
  )
}
