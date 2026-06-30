import { ArrowLeft } from 'lucide-react'

type BackButtonProps = {
  href?: string
  label?: string
}

export function BackButton({ href, label = 'Volver' }: BackButtonProps) {
  return (
    <a
      href={href ?? '/'}
      className="inline-flex h-9 w-fit items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3.5 text-[12.5px] font-medium text-foreground shadow-soft transition-colors hover:bg-secondary"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </a>
  )
}
