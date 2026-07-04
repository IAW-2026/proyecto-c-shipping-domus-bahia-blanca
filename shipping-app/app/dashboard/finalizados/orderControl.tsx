'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type OrdenFecha = 'asc' | 'desc'

type Props = {
  orden: OrdenFecha
}

export function OrderControl({ orden }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setOrden(nextOrden: OrdenFecha) {
    const params = new URLSearchParams(searchParams)
    params.set('orden', nextOrden)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="inline-flex rounded-lg border border-border/70 bg-card p-1 shadow-soft">
      <button
        type="button"
        onClick={() => setOrden('desc')}
        className={`rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
          orden === 'desc'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        Mas recientes
      </button>
      <button
        type="button"
        onClick={() => setOrden('asc')}
        className={`rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
          orden === 'asc'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        Mas antiguos
      </button>
    </div>
  )
}
