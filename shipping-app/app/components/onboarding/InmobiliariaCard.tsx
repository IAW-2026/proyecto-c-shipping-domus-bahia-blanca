import { Building2, CheckCircle2, ChevronRight } from 'lucide-react'

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
        <Building2 className="h-6 w-6 text-[#728973]" />
      </div>

      <div className="flex-grow">
        <div className="flex items-center gap-1">
          <h3 className={`font-semibold text-sm tracking-wide uppercase transition-colors
            ${selected ? 'text-[#284335]' : 'text-[#1b1c1c] group-hover:text-[#284335]'}`}>
            {nombre}
          </h3>
          {verified && (
            <CheckCircle2 className="h-3.5 w-3.5 fill-[#284335] text-[#284335]" />
          )}
        </div>
      </div>

      {selected ? (
        <CheckCircle2 className="h-5 w-5 text-[#284335] opacity-100 transition-all" />
      ) : (
        <ChevronRight className={`h-5 w-5 transition-all
        ${selected
          ? 'text-[#284335] opacity-100'
          : 'text-[#727973] opacity-0 group-hover:opacity-100 group-hover:text-[#284335]'
        }`}
        />
      )}
    </div>
  )
}
