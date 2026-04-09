import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessClient />
    </Suspense>
  );
}

function SuccessLoading() {
  return (
    <main className="min-h-screen bg-[#0b0b0f] px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#16161d] to-[#0d0d11] p-8 text-center shadow-2xl md:p-12">
          <div className="mb-6 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#D4AF37] border-t-transparent" />
          </div>

          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#D4AF37]">
            Entrenamiento Focus
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            Estamos cargando tu suscripción
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/70">
            Esperá un momento mientras validamos la información.
          </p>
        </div>
      </div>
    </main>
  );
}