import Image from 'next/image'

export function DashboardImage() {
  return (
    <div className="hidden h-full lg:block">
      <div className="overflow-hidden rounded-2xl">
        <Image
          src="/fotoDashboard.webp"
          alt="Resumen semanal"
          width={1200}
          height={800}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 50vw"
          className="h-auto w-full object-cover"
          priority
        />
      </div>
    </div>
  )
}
