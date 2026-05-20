import OnboardingClient from './onboardingClient'
import { crearAgente } from '@/lib/agente/agente'

export default function Page() {
  return <OnboardingClient crearAgente={crearAgente} />
}

