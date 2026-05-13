import Image from "next/image"

export default function mosaicoSignIn() {
  return (
        
        <section className="relative hidden h-full lg:flex items-end overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#fff7ed,_#f3e9dd_45%,_#e8dbcc_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(16,24,16,0.55),_rgba(16,24,16,0)_65%)]" />
          <div>

          <Image
            src="/fondo.webp"
            alt="Casa moderna en tonos cálidos"
            width={1280}
            height={1600}
            className="absolute inset-0 h-full w-full object-cover"
            priority
            sizes="(min-width: 1024px) 50vw, 0px"
          />
          <div className="relative z-10 p-[clamp(16px,3vw,48px)] text-white">
            <h2 className="hero-title mt-5 text-[clamp(28px,3.2vw,48px)] max-w-lg animate-[text-rise_700ms_ease-out_both] [animation-delay:120ms]">
            Coordina visitas con la elegancia que mereces.
          </h2>
          </div>
      </div>
    </section>
)}