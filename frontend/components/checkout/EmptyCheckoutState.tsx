"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EmptyCheckoutState() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a0a] p-8 text-center text-white shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
        <h1 className="text-3xl font-semibold">Tu carrito está vacío</h1>

        <p className="mt-3 text-zinc-400">
          Agregá al menos un recurso antes de ir al checkout.
        </p>

        <Link
          href="/recursos"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#F5C84C] px-5 py-3 font-semibold text-black transition hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a recursos
        </Link>
      </div>
    </section>
  );
}