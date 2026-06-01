import Image from 'next/image'

export function DashboardImage() {
  return (
    <div className="hidden h-full lg:block">
      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl">
        <Image
          src="/fotoDashboard.webp"
          alt="Resumen semanal"
          fill
          sizes="(min-width: 1280px) 720px, (min-width: 1024px) calc((100vw - 5rem) * 0.58), 0px"
          className="object-cover"
          priority
          fetchPriority="high"
          quality={75}
        />
      </div>
    </div>
  )
}
