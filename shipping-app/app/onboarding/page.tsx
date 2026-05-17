export default function OnboardingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Onboarding</h1>
        <p className="text-sm text-neutral-600">
          Completa tu perfil para activar tu cuenta.
        </p>
      </header>

      <section className="rounded-lg border border-neutral-200 p-6">
        <p className="text-sm text-neutral-700">
          Te faltan algunos pasos para completar el alta. Proximamente vamos a
          mostrar el formulario aca.
        </p>
      </section>
    </main>
  )
}
