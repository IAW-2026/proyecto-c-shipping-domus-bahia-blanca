import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#f8f4ef] text-stone-900">
      <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(0,520px)]">
        <section className="relative hidden lg:flex items-end overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#fff7ed,_#f3e9dd_45%,_#e8dbcc_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(16,24,16,0.55),_rgba(16,24,16,0)_65%)]" />
          <div className="relative z-10 p-12 text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em]">
              Scheduling App · v2.6
            </div>
            <h1 className="mt-6 max-w-xl font-serif text-4xl font-semibold leading-tight">
              Coordina visitas con la elegancia que tu cartera merece.
            </h1>
            <p className="mt-4 max-w-md text-sm text-white/80">
              Domus Bahia Blanca centraliza turnos, agentes y compradores en una experiencia moderna
              y ordenada para inmobiliarias premium.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12 lg:px-14">
          <div className="w-full max-w-md">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-stone-900 text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)]">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="leading-tight">
                <span className="block text-base font-semibold">Domus Bahia Blanca</span>
                <span className="block text-[10px] uppercase tracking-[0.25em] text-stone-500">Scheduling</span>
              </span>
            </Link>

            <div className="mt-10">
              <h2 className="text-3xl font-semibold tracking-tight">Bienvenido de nuevo</h2>
              <p className="mt-2 text-sm text-stone-500">
                Ingresa a tu cuenta para gestionar visitas, agentes y propiedades.
              </p>
            </div>

            <div className="mt-8 rounded-3xl border border-stone-200 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <SignIn
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "w-full bg-transparent p-0 shadow-none border-0",
                    headerTitle: "text-lg font-semibold text-stone-900",
                    headerSubtitle: "text-sm text-stone-500",
                    formFieldLabel: "text-xs font-medium text-stone-600",
                    formFieldInput:
                      "rounded-xl border-stone-200 bg-white text-stone-900 shadow-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200",
                    formButtonPrimary:
                      "rounded-xl bg-stone-900 text-white hover:bg-stone-800 focus:ring-2 focus:ring-stone-300",
                    socialButtonsBlockButton:
                      "rounded-xl border-stone-200 bg-white text-stone-700 hover:bg-stone-50",
                    footerActionLink: "text-amber-700 hover:text-amber-800",
                    dividerLine: "bg-stone-200",
                    dividerText: "text-[10px] uppercase tracking-[0.35em] text-stone-400",
                  },
                }}
              />
            </div>

            <p className="mt-8 text-xs text-stone-500">
              Sos un nuevo agente? <span className="font-medium text-amber-700">Solicita acceso</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
