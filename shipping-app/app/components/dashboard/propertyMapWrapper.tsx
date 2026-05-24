'use client'

import dynamic from 'next/dynamic'

const PropertyMap = dynamic(
  () => import('./propertyMaps').then(m => m.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full rounded-xl bg-secondary animate-pulse" />
    )
  }
)

export { PropertyMap }