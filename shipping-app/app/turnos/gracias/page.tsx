import { redirect } from 'next/navigation'

export default async function TurnosGraciasRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ turnoId?: string }>
}) {
  const { turnoId } = await searchParams
  const params = turnoId ? `?turnoId=${encodeURIComponent(turnoId)}` : ''

  redirect(`/pedirturnos/gracias${params}`)
}
