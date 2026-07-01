"use client"

import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

const DEFAULT_FALLBACK_URL = 'https://domus-buyer-app.vercel.app/'
const APP_LOADED_KEY = 'domus_app_loaded'
const HISTORY_START_KEY = 'domus_history_start'

function getTrustedOrigins() {
  // CORRECCIÓN 1: Usar NEXT_PUBLIC_ y agregar el fallback directo a la matriz
  return [
    process.env.NEXT_PUBLIC_BUYER_APP_BASE_URL,
    'https://domus-buyer-app.vercel.app'
  ].filter(Boolean) as string[]
}

type BackButtonProps = {
  label?: string
  fallbackUrl?: string
  preferBrowserBack?: boolean
}

export function BackButton({
  label = 'Volver',
  // CORRECCIÓN 2: Usar la misma variable acá
  fallbackUrl = process.env.NEXT_PUBLIC_BUYER_APP_BASE_URL || DEFAULT_FALLBACK_URL,
  preferBrowserBack = true,
}: BackButtonProps) {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!sessionStorage.getItem(APP_LOADED_KEY)) {
      sessionStorage.setItem(APP_LOADED_KEY, 'true')
      sessionStorage.setItem(HISTORY_START_KEY, window.history.length.toString())
    }
  }, [])

  function handleClick() {
    if (typeof window === 'undefined') return

    if (!preferBrowserBack) {
      router.push(fallbackUrl)
      return
    }

    const referrer = document.referrer
    const historyStart = Number(sessionStorage.getItem(HISTORY_START_KEY) ?? window.history.length)
    const hasInternalHistory = window.history.length > historyStart
    
    const trustedOrigins = [window.location.origin, ...getTrustedOrigins()]
    const isTrustedReferrer = Boolean(
      referrer && trustedOrigins.some((origin) => referrer.includes(origin))
    )

    // Si navegaste dentro de la app O venís de un origen confiable (Buyer App), volvé atrás naturalmente
    if (hasInternalHistory || isTrustedReferrer) {
      router.back()
      return
    }

    // Si entraste copiando y pegando la URL (sin referrer), usa el fallback
    router.push(fallbackUrl)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex h-9 w-fit items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3.5 text-[12.5px] font-medium text-foreground shadow-soft transition-colors hover:bg-secondary"
      aria-label="Volver atrás"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  )
}