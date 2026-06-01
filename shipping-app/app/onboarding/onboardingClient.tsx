'use client'
import type { AgenteInmobiliario } from '@prisma/client'
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


type Props = {
  crearAgente: (data: { telefono: string; vendedorId: string }) => Promise<AgenteInmobiliario>
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

export default function OnboardingPage({ crearAgente }: Props) {
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
    await crearAgente({
      telefono: phoneValue.trim(),
      vendedorId: selectedInmobiliariaId,
    })

    router.refresh()
    router.replace('/cuenta-en-revision')
  } catch (error) {
    setSubmitError(error instanceof Error ? error.message : 'No se pudo completar el onboarding')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f8] font-sans">
      <div className="relative flex-grow flex items-center justify-center py-20 px-6">
        <div className="max-w-[1280px] w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          <OnboardingHeader>
            {submitError && (
              <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {submitError}
              </p>
            )}
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
      </div>
    </div>
  )
}
