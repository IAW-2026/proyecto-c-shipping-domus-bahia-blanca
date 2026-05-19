type OnboardingHeaderProps = {
  children?: React.ReactNode
}

export function OnboardingHeader({ children }: OnboardingHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <span className="font-semibold text-xs tracking-widest uppercase text-[#284335]">
          Bienvenido
        </span>
        <h1 className="text-[36px] md:text-[48px] font-bold leading-tight tracking-tight text-[#284335]">
          Domus Bahía Blanca
        </h1>
        <p className="text-lg text-[#424844] max-w-md leading-relaxed">
          Descubra el estándar de excelencia en el mercado inmobiliario. Comience su recorrido
          configurando su perfil de acceso.
        </p>
      </div>

      {children && <div className="pt-6">{children}</div>}
    </div>
  )
}
