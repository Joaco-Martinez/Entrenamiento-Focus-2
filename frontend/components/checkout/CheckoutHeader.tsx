"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  fullName: string | null;
  totalItems: number;
};

export default function CheckoutHeader({ fullName, totalItems }: Props) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4 sm:mb-10">
      <div>
        <Link
          href="/recursos"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Seguir comprando
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Checkout
        </h1>

        <p className="mt-2 text-sm text-zinc-400 sm:text-base">
          {fullName
            ? `Finalizá tu compra, ${fullName}.`
            : "Finalizá tu compra de forma segura."}
        </p>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full border border-[#F5C84C]/20 bg-[#F5C84C]/8 px-3.5 py-2 text-sm text-[#F5C84C]">
        <span className="font-semibold">{totalItems}</span>
        <span>item{totalItems !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}