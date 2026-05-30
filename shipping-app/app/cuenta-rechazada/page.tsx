export const metadata = {
  title: 'Cuenta rechazada - Domus',
}

export default function CuentaRechazadaPage() {
  return (
  <main className="min-h-screen bg-[#f8f4ef] text-stone-900">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Cuenta rechazada
        </h1>
        <p className="mt-4 text-base text-stone-600">
          Tu solicitud no fue aprobada por la inmobiliaria.
        </p>
        <p className="mt-2 text-sm text-stone-500">
          Si crees que esto es un error, contacta a la inmobiliaria para revisar tu
          caso.
        </p>
      </section>
    </main>
  )
}
