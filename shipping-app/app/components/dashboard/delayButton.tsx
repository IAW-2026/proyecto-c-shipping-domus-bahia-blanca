'use client'

import { useTransition } from 'react'

type Props = {
  action: () => Promise<void>
  className: string
  children: React.ReactNode
}
//Hago esto para que no se pueda spamear los botones de tomar y cancelar turno. 
export function DelayButton({ action, className, children }: Props) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => action())}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}