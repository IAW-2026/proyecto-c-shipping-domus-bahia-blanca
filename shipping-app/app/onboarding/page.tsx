"use client";

import { useState } from "react";
import { useSession } from "@clerk/nextjs";

export default function OnboardingPage() {
  const { isLoaded, isSignedIn, session } = useSession();
  const [isReloading, setIsReloading] = useState(false);

  const handleReload = async () => {
    if (!isLoaded || !isSignedIn || !session || isReloading) return;
    setIsReloading(true);
    try {
      await session.reload();
    } finally {
      setIsReloading(false);
    }
  };

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
        <div className="mt-4">
          <button
            type="button"
            onClick={handleReload}
            disabled={!isLoaded || !isSignedIn || isReloading}
            className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isReloading ? "Actualizando sesion..." : "Actualizar sesion"}
          </button>
        </div>
      </section>
    </main>
  )
}
