export const metadata = {
  title: 'Acceso no autorizado - Domus',
  description: 'Aviso de acceso no autorizado a una seccion protegida de Domus.',
}

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Acceso no autorizado</h1>
        <p className="text-sm text-neutral-600">
          No tenes permisos para acceder a esta seccion.
        </p>
      </header>

      <section className="rounded-lg border border-neutral-200 p-6">
        <p className="text-sm text-neutral-700">
          Si crees que esto es un error, contacta al administrador.
        </p>
      </section>
    </main>
  )
}
