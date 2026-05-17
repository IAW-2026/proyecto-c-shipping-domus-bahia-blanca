export default function CuentaRechazadaPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Cuenta rechazada</h1>
        <p className="text-sm text-neutral-600">
          Tu solicitud no fue aprobada por la inmobiliaria.
        </p>
      </header>

      <section className="rounded-lg border border-neutral-200 p-6">
        <p className="text-sm text-neutral-700">
          Si crees que esto es un error, contacta al soporte para revisar tu
          caso.
        </p>
      </section>
    </main>
  )
}
