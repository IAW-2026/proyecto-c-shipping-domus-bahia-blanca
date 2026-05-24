import { redirect } from 'next/navigation'
import { requireAgente } from '@/lib/auth/requireAgente'

export default async function Page() {
  await requireAgente()
  redirect('/dashboard')
}