import Image from 'next/image'
import { MapPin } from 'lucide-react'
import type { PropiedadTurno } from '@/app/components/turnos/types'

type Props = {
  propiedad: PropiedadTurno
}

export function PropertyHero({ propiedad }: Props) {
  const images = [...propiedad.multimedia].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
    <section className="order-1 self-start overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft lg:col-start-1 lg:row-start-1">
      <div className="relative aspect-[4/3] min-h-[260px] w-full bg-secondary">
        {images.length > 0 ? (
          <div className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((image, index) => (
              <div key={image.id} className="relative h-full min-w-full snap-center">
                <Image
                  src={image.url}
                  alt={image.alt ?? propiedad.nombrePropiedad ?? 'Propiedad'}
                  fill
                  priority={index === 0}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  quality={70}
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 620px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid h-full place-items-center text-[13px] text-muted-foreground">
            Imagen no disponible
          </div>
        )}

        {images.length > 1 ? (
          <div className="absolute right-4 top-4 rounded-full bg-black/55 px-3 py-1 text-[12px] font-medium text-white backdrop-blur-sm">
            {images.length} fotos
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 text-white sm:p-6">
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
