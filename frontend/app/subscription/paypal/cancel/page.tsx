import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaypalCancelPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <section className="mx-auto max-w-2xl rounded-3xl border border-red-500/20 bg-gradient-to-b from-[#111111] to-[#050505] p-8 shadow-[0_0_40px_rgba(255,0,0,0.08)]">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
            <XCircle className="h-10 w-10 text-red-400" />
          </div>
        </div>

        <h1 className="text-center text-3xl font-bold">
          Suscripción cancelada
        </h1>

        <p className="mt-4 text-center text-white/75">
          Cancelaste el proceso de suscripción con PayPal. No se realizó ningún
          cobro.
        </p>

        <div className="mt-8">
          <Link
            href="/mentoria"
            className="block w-full rounded-2xl bg-[#D4AF37] px-5 py-3 text-center font-semibold text-black transition hover:opacity-90"
          >
            Volver a mentoría
          </Link>
        </div>
      </section>
    </main>
  );
}