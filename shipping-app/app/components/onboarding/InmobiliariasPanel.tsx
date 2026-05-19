'use client'

import { useState } from 'react'
import { InmobiliariaCard } from './InmobiliariaCard'

type Inmobiliaria = {
  id: string
  nombre: string
}

type InmobiliariasPanelProps = {
  inmobiliarias: Inmobiliaria[]
  onSelect?: (id: string) => void
}

export function InmobiliariasPanel({ inmobiliarias, onSelect }: InmobiliariasPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleSelect = (id: string) => {
    setSelectedId(id)
    onSelect?.(id)
  }

  return (
    <div className="relative">
      <div className="bg-[#f6f3f2] rounded-xl p-6 border border-[#c2c8c2]/30 shadow-sm h-[600px] flex flex-col">
        <div className="mb-6 flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-[#284335]">Inmobiliarias</h2>
            <p className="text-xs text-[#424844]">Seleccione su agencia de preferencia</p>
          </div>
          <span className="material-symbols-outlined text-[#3f5b4b]">business_center</span>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {inmobiliarias.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-[#424844]">
              <span className="material-symbols-outlined text-4xl opacity-40">domain_disabled</span>
              <p className="text-sm">No hay inmobiliarias disponibles</p>
            </div>
          ) : (
            inmobiliarias.map((inm) => (
              <InmobiliariaCard
                key={inm.id}
                nombre={inm.nombre}
                selected={selectedId === inm.id}
                onClick={() => handleSelect(inm.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Decorative blur */}
      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#c5ecc9]/20 rounded-full blur-3xl -z-10" />
    </div>
  )
}
