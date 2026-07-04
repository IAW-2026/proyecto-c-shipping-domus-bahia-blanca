export default function mosaicoSignIn({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative hidden h-full lg:flex items-end overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#fff7ed,_#f3e9dd_45%,_#e8dbcc_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(16,24,16,0.55),_rgba(16,24,16,0)_65%)]" />
      {children}
      <div className="relative z-10 p-[clamp(16px,3vw,48px)] text-white">
        <h2 className="mt-5 max-w-lg animate-[text-rise_700ms_ease-out_both] text-[clamp(28px,3.2vw,48px)] font-display font-semibold leading-[1.05] tracking-[-0.02em] [animation-delay:120ms]">
          Coordina visitas con la elegancia que mereces.
        </h2>
      </div>
    </section>
  )
}
