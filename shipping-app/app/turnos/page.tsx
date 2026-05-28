import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { TurnoForm } from '@/app/turnos/turnoForm'

// TODO: reemplazar con la URL real de la app externa
async function fetchPropiedad(propiedadId: string) {
  // Mock mientras no esté disponible el endpoint
  return {
    id: propiedadId,
    nombrePropiedad: 'Casa en Av. Alem 1200',
    direccion: 'Av. Alem 1200, Bahía Blanca',
    latitud: -38.7183,
    longitud: -62.2663,
    vendedorId: 'vendedor-mock-id',
    nombreInmobiliaria: 'Domus Bahía Blanca',
  }

  // Cuando esté listo:
  // const res = await fetch(`https://otra-app.com/api/propiedades/${propiedadId}`)
  // if (!res.ok) return null
  // return res.json()
}

export default async function NuevoTurnoPage({
  searchParams,
}: {
  searchParams: Promise<{ propiedadId?: string }>
}) {
  const { propiedadId } = await searchParams
  const { userId } = await auth()

  if (!userId) {
    redirect(`/sign-in?redirect_url=/turnos/nuevo?propiedadId=${propiedadId}`)
  }

  if (!propiedadId) redirect('/')

  const [propiedad, user] = await Promise.all([
    fetchPropiedad(propiedadId),
    currentUser(),
  ])

  if (!propiedad) redirect('/')

  return (
    <TurnoForm
      propiedad={{
        ...propiedad,
        id: propiedadId,
      }}
      comprador={{
        id: userId,
        nombre: user?.fullName ?? '',
        email: user?.emailAddresses[0].emailAddress ?? '',
      }}
    />
  )
}