'use client'

import { useState } from 'react'

type PhoneFormProps = {
  onSubmit?: (phone: string) => void
  loading?: boolean
  value?: string
  onChange?: (phone: string) => void
  formId?: string
}

export function PhoneForm({ onSubmit, loading = false, value, onChange, formId = 'onboarding-phone-form' }: PhoneFormProps) {
  const [internalPhone, setInternalPhone] = useState('')
  const phone = value ?? internalPhone

  const handlePhoneChange = (nextValue: string) => {
    if (onChange) {
      onChange(nextValue)
      return
    }
    setInternalPhone(nextValue)
  }

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault()
    if (phone.trim()) {
      onSubmit?.(phone.trim())
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-3 max-w-sm">
      <label htmlFor="phone" className="block text-xs font-semibold tracking-widest uppercase text-[#424844]">
        Teléfono
      </label>

      <div className="relative group">
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="+54 291 1234567"
          disabled={loading}
          className="peer w-full bg-white border border-[#c2c8c2] rounded-lg px-6 py-3 text-base
            text-[#1a1a1a] placeholder:text-[#424844] placeholder:opacity-70
            focus:ring-1 focus:ring-[#284335] focus:border-[#284335] outline-none
            transition-all duration-200 disabled:opacity-50"
        />
      </div>
    </form>
  )
}
