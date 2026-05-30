import OnboardingClient from './onboardingClient'
import { crearAgente } from '@/lib/agente/agente'

export const metadata = {
  title: 'Onboarding - Domus',
}

export default function Page() {
  return (
    <main>
      <OnboardingClient crearAgente={crearAgente} />
    </main>
  )
}

