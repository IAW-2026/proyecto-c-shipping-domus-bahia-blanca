"use client"

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

type BackButtonProps = {
  href?: string
  label?: string
}

export function BackButton({ href, label = 'Volver' }: BackButtonProps) {
  const router = useRouter()

  function handleClick() {
    if (!href) {
      router.back()
      return
    }

    try {
      const url = new URL(href)

      if (url.pathname.startsWith('/property/')) {
        router.back()
        return
      }
    } catch {
      if (href.startsWith('/property/')) {
        router.back()
        return
      }
    }

    router.push(href)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex h-9 w-fit items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3.5 text-[12.5px] font-medium text-foreground shadow-soft transition-colors hover:bg-secondary"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  )
}
