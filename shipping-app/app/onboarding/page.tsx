'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingHeader } from '@/app/components/onboarding/OnboardingHeader'
import { PhoneForm } from '@/app/components/onboarding/PhoneForm'
import { InmobiliariasPanel } from '@/app/components/onboarding/InmobiliariasPanel'

// Tipos
type Inmobiliaria = {
  id: string
  nombre: string
}
 
// TODO: reemplazar con fetch real a /api/inmobiliarias
function getInmobiliarias(): Inmobiliaria[] {
  return [
    { id: 'inm-1', nombre: 'Domus Centro' },
    { id: 'inm-2', nombre: 'Bahia Norte' },
    { id: 'inm-3', nombre: 'Costa Sur' },
    { id: 'inm-4', nombre: 'Domus Norte'},
    { id: 'inm-5', nombre: 'Costa Norte' },
    { id: 'inm-6', nombre: 'Bahia Sur' },
  ]
}

export default function OnboardingPage() {
  const inmobiliarias = getInmobiliarias()
  const router = useRouter()
  const [selectedInmobiliariaId, setSelectedInmobiliariaId] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const canContinue = Boolean(selectedInmobiliariaId && phone.trim())

  const handleConfirm = async (phoneValue: string) => {
    if (!selectedInmobiliariaId) return

    setLoading(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/agentes/perfil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telefono: phoneValue.trim(),
          vendedorId: selectedInmobiliariaId,
        }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        setSubmitError(payload?.error ?? 'No se pudo completar el onboarding')
        return
      }

      router.push('/cuenta-en-revision')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f8] font-sans">
      <main className="relative flex-grow flex items-center justify-center py-20 px-6">
        <div className="max-w-[1280px] w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          <OnboardingHeader>
            <PhoneForm
              value={phone}
              onChange={setPhone}
              loading={loading}
              onSubmit={handleConfirm}
            />
          </OnboardingHeader>

          <InmobiliariasPanel
            inmobiliarias={inmobiliarias}
            onSelect={setSelectedInmobiliariaId}
          />
        </div>

        <button
          type="submit"
          form="onboarding-phone-form"
          disabled={loading || !canContinue}
          className="absolute bottom-6 right-30 bg-[#284335] text-white font-semibold text-xs tracking-widest uppercase
            px-5 py-2 rounded-md hover:brightness-110 active:scale-[0.98]
            transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando...' : 'Continuar'}
        </button>
      </main>
      <footer className="py-6 px-6 text-center">
              <div className="max-w-[1280px] mx-auto border-t border-[#c2c8c2]/30 pt-6">
                <p className="text-xs text-[#424844]">
                  © 2026 Domus Bahía Blanca. Todos los derechos reservados.
                </p>
              </div>
            </footer>
    </div>
  )
}
