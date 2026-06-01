import OnboardingClient from './onboardingClient'
import { crearAgente } from '@/lib/agente/agente'
import { getInmobiliarias } from '@/lib/agente/inmobiliarias'

export const metadata = {
  title: 'Onboarding - Domus',
  description: 'Seleccion de inmobiliaria y carga de datos para crear el perfil de agente.',
}

export default async function Page() {
  const inmobiliarias = await getInmobiliarias()

  return (
    <main>
      <OnboardingClient crearAgente={crearAgente} inmobiliarias={inmobiliarias} />
    </main>
  )
}

