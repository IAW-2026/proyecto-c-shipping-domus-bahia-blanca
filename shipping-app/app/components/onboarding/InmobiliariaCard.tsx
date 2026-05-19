type InmobiliariaCardProps = {
  nombre: string
  selected?: boolean
  verified?: boolean
  onClick?: () => void
}

export function InmobiliariaCard({
  nombre,
  selected = false,
  verified = false,
  onClick,
}: InmobiliariaCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-6 p-3 bg-white rounded-lg border transition-all duration-200 cursor-pointer
        ${selected
          ? 'border-[#afceba] ring-1 ring-[#afceba]'
          : 'border-transparent hover:border-[#afceba] hover:shadow-sm'
        }`}
    >
      {/* Avatar placeholder en lugar de imagen mockeada */}
      <div className="w-16 h-16 rounded-lg flex-shrink-0 bg-[#f0eded] flex items-center justify-center">
        <span className="material-symbols-outlined text-[#728973] text-2xl">business</span>
      </div>

      <div className="flex-grow">
        <div className="flex items-center gap-1">
          <h3 className={`font-semibold text-sm tracking-wide uppercase transition-colors
            ${selected ? 'text-[#284335]' : 'text-[#1b1c1c] group-hover:text-[#284335]'}`}>
            {nombre}
          </h3>
          {verified && (
            <span
              className="material-symbols-outlined text-[14px] text-[#284335]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
          )}
        </div>
      </div>

      <span className={`material-symbols-outlined transition-all
        ${selected
          ? 'text-[#284335] opacity-100'
          : 'text-[#727973] opacity-0 group-hover:opacity-100 group-hover:text-[#284335]'
        }`}>
        {selected ? 'check_circle' : 'arrow_forward_ios'}
      </span>
    </div>
  )
}
