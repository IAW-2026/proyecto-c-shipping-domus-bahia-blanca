export const metadata = {
  title: 'Cuenta en revision - Domus',
  description: 'Estado de revision de cuenta para agentes inmobiliarios en Domus.',
}

export default function CuentaEnRevisionPage() {
  return (
    <main className="min-h-screen bg-[#f8f4ef] text-stone-900">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Cuenta en revision
        </h1>
        <p className="mt-4 text-base text-stone-600">
          Tu cuenta fue creada y esta en proceso de validacion. Cuando el equipo
          de la inmobiliaria la apruebe, vas a poder acceder al dashboard.
        </p>
        <p className="mt-2 text-sm text-stone-500">
          Si necesitas asistencia, contacta al administrador.
        </p>
      </section>
    </main>
  )
}
