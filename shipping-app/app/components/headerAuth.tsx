'use client'

import { Show, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function HeaderAuth() {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)

  if (!mounted) return <div className="h-8 w-8" aria-hidden="true" />

  return (
    <>
      <Show when="signed-out">
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </>
  )
}
