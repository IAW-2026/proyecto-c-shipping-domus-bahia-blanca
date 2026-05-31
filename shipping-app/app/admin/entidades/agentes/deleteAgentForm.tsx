'use client'

import { useActionState } from 'react'
import { Trash2 } from 'lucide-react'
import { eliminarAgenteAdminConEstado } from '@/lib/agente/agente'

export function DeleteAgentForm({ agenteId }: { agenteId: string }) {
  const [state, formAction, isPending] = useActionState(eliminarAgenteAdminConEstado, {
    error: null,
  })

  return (
    <form action={formAction} className="mt-3">
      <input type="hidden" name="id" value={agenteId} />
      <button
        disabled={isPending}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 text-[13px] font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Trash2 className="h-4 w-4" />
        {isPending ? 'Eliminando...' : 'Eliminar agente'}
      </button>
      {state.error && (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] font-medium text-red-700">
          {state.error}
        </p>
      )}
    </form>
  )
}
