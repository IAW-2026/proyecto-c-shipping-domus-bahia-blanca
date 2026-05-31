import OnboardingClient from './onboardingClient'
import { crearAgente } from '@/lib/agente/agente'

export const metadata = {
  title: 'Onboarding - Domus',
  description: 'Seleccion de inmobiliaria y carga de datos para crear el perfil de agente.',
}

export default function Page() {
  return (
    <main>
      <OnboardingClient crearAgente={crearAgente} />
    </main>
  )
}

