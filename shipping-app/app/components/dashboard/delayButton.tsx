// components/dashboard/actionButton.tsx
'use client'

import { useTransition } from 'react'

type Props = {
  action: () => Promise<void>
  className: string
  children: React.ReactNode
}

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