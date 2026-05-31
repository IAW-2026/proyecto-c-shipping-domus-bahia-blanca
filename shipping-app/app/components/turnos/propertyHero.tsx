import Image from 'next/image'
import { MapPin } from 'lucide-react'
import type { PropiedadTurno } from '@/app/components/turnos/types'

type Props = {
  propiedad: PropiedadTurno
}

export function PropertyHero({ propiedad }: Props) {
  const image = [...propiedad.multimedia].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]

  return (
    <section className="order-1 self-start overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft lg:col-start-1 lg:row-start-1">
      <div className="relative aspect-[4/3] min-h-[260px] w-full bg-secondary">
        {image?.url ? (
          <Image
            src={image.url}
            alt={image.alt ?? propiedad.nombrePropiedad ?? 'Propiedad'}
            fill
            priority
            fetchPriority="high"
            quality={72}
            sizes="(max-width: 1024px) 100vw, 620px"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-[13px] text-muted-foreground">
            Imagen no disponible
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 text-white sm:p-6">
          <h2 className="font-display text-[26px] font-medium leading-tight sm:text-[30px]">
            {propiedad.nombrePropiedad}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-[13.5px] text-white/85">
            <MapPin className="h-3.5 w-3.5" /> {propiedad.direccion}
          </p>
        </div>
      </div>
    </section>
  )
}
