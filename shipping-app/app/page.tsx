import { redirect } from 'next/navigation'
import { requireAgente } from '@/lib/auth/requireAgente'

export const metadata = {
  title: 'Domus',
  description: 'Redireccion principal de Domus para agentes inmobiliarios.',
}

export default async function Page() {
  await requireAgente()
  redirect('/dashboard')
}
