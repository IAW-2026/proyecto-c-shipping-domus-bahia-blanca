'use client'

import { Show, UserButton } from '@clerk/nextjs'
import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function HeaderAuth() {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)

  if (!mounted) return <div className="h-10 w-10" aria-hidden="true" />

  return (
    <div className="grid h-10 w-10 place-items-center">
      <Show when="signed-out">
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  )
}
