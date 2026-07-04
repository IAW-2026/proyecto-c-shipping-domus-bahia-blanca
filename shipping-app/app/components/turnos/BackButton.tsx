"use client"

import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

const DEFAULT_FALLBACK_URL = 'https://domus-buyer-app.vercel.app/'
const APP_LOADED_KEY = 'domus_app_loaded'
const HISTORY_START_KEY = 'domus_history_start'

function getTrustedOrigins() {
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
      window.location.href = fallbackUrl
      return
    }

    const referrer = document.referrer
    const historyStart = Number(sessionStorage.getItem(HISTORY_START_KEY) ?? window.history.length)
    const hasInternalHistory = window.history.length > historyStart
    
    const trustedOrigins = [window.location.origin, ...getTrustedOrigins()]
    const isTrustedReferrer = Boolean(
      referrer && trustedOrigins.some((origin) => referrer.includes(origin))
    )

    // Detectamos si el usuario viene de completar el flujo de autenticación
    const isAuthFlow = Boolean(
      referrer && ['/sign-in', '/sign-up', 'clerk', 'accounts'].some((path) => referrer.includes(path))
    )

    // CORRECCIÓN: Si viene del login, salteamos esa página en el historial
    if (isAuthFlow) {
      window.history.go(-2) // Retrocede 2 pasos de golpe (salta el /sign-in y vuelve a la propiedad)
      
      // Salvavidas de emergencia: Si el usuario abrió el link directo en una pestaña limpia
      // y no existen 2 páginas atrás en el historial, el .go(-2) no hará nada. 
      // Ponemos un pequeño timeout para redirigir por URL si el historial falla.
      const timeout = setTimeout(() => {
        window.location.href = fallbackUrl
      }, 150)

      // Limpiamos el timeout si la página logra desmontarse (navegación exitosa)
      window.addEventListener('unload', () => clearTimeout(timeout))
      return
    }

    // Si navegaste dentro de la app O venís de un origen confiable, volvé atrás naturalmente
    if (hasInternalHistory || isTrustedReferrer) {
       window.history.back()
      return
    }

    // Si entraste copiando y pegando la URL (sin referrer), usa el fallback
     window.location.href = fallbackUrl
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