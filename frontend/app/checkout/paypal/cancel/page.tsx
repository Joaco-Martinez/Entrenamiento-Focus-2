"use client";

import Link from "next/link";

export default function PaypalCancelPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] p-6 text-white">
      <div className="mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-black p-6">
        <h1 className="mb-3 text-lg font-semibold">Pago cancelado</h1>
        <p className="mb-4 text-sm text-zinc-400">
          Cancelaste el proceso de pago con PayPal.
        </p>

        <Link
          href="/checkout"
          className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
        >
          Volver al checkout
        </Link>
      </div>
    </main>
  );
}