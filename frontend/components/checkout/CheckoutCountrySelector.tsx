"use client";

import { Globe } from "lucide-react";
import { CheckoutCountry } from "@/components/newCheckout/CheckoutPageClient";

type Props = {
  onSelect: (country: CheckoutCountry) => void;
};

export default function CheckoutCountrySelector({ onSelect }: Props) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a0a] shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
      <div className="border-b border-white/8 px-6 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#F5C84C]/10 text-[#F5C84C]">
            <Globe className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Elegí tu país</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Así te mostramos el método de pago correcto.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-6 sm:grid-cols-2 sm:p-8">
        <button
          type="button"
          onClick={() => onSelect("arg")}
          className="group rounded-2xl border border-[#F5C84C]/20 bg-[#F5C84C]/6 p-5 text-left transition hover:border-[#F5C84C]/35 hover:bg-[#F5C84C]/10"
        >
          <div className="text-base font-semibold text-white">Argentina</div>
          <div className="mt-1 text-sm text-zinc-400">
            Pago con Mercado Pago
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelect("other")}
          className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left transition hover:border-white/20 hover:bg-white/[0.04]"
        >
          <div className="text-base font-semibold text-white">Otro país</div>
          <div className="mt-1 text-sm text-zinc-400">
            Pago internacional con PayPal
          </div>
        </button>
      </div>
    </div>
  );
}