"use client";

import PaymentWithMpCard from "./PaymentWithMpCard";
import { CheckoutCountry } from "@/components/newCheckout/CheckoutPageClient";
import { CartItem } from "@/context/CartContext";
import { Globe2, ShieldCheck } from "lucide-react";

type Props = {
  resolvedCountry: CheckoutCountry;
  preferenceId: string;
  subtotal: number;
  cart: CartItem[];
  userEmail?: string;
  creatingPreference?: boolean;
  onChangeCountry: () => void;
};

export default function CheckoutPaymentSection({
  resolvedCountry,
  preferenceId,
  subtotal,
  cart,
  userEmail,
  creatingPreference = false,
  onChangeCountry,
}: Props) {
  if (resolvedCountry === "arg") {
    return (
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a0a] shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-4 border-b border-white/8 px-6 py-6 sm:px-8 sm:py-7 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F5C84C]/10 px-3 py-1 text-xs font-medium text-[#F5C84C]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Checkout seguro
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">Pago en Argentina</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Pagá en ARS con Mercado Pago o con tarjeta, sin salir del checkout.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onChangeCountry}
            className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
          >
            <Globe2 className="h-4 w-4" />
            Cambiar país
          </button>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {creatingPreference ? (
            <div className="rounded-2xl bg-white/[0.03] px-6 py-10 text-center text-sm text-zinc-400">
              Generando checkout de Mercado Pago...
            </div>
          ) : preferenceId ? (
            <PaymentWithMpCard
              amount={Number(subtotal.toFixed(2))}
              preferenceId={preferenceId}
              items={cart.map((item) => ({
                id: item.id,
                title: item.title,
                quantity: item.quantity,
                unit_price: item.arPrice,
                currency_id: "ARS" as const,
                description: item.description || item.title,
              }))}
              payerEmail={userEmail}
              onSuccess={(paymentId) => {
                console.log("Pago exitoso:", paymentId);
              }}
            />
          ) : (
            <div className="rounded-2xl bg-red-500/10 px-6 py-10 text-center text-sm text-red-300">
              No se pudo generar la preferencia de pago.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a0a] shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
      <div className="flex flex-col gap-4 border-b border-white/8 px-6 py-6 sm:px-8 sm:py-7 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Pago internacional</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Para compras fuera de Argentina vamos a usar PayPal.
          </p>
        </div>

        <button
          type="button"
          onClick={onChangeCountry}
          className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
        >
          <Globe2 className="h-4 w-4" />
          Cambiar país
        </button>
      </div>

      <div className="p-6 sm:p-8">
        <div className="rounded-2xl bg-white/[0.03] p-6">
          <p className="text-sm text-zinc-300">
            PayPal todavía no está integrado en este proyecto.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Después conectamos este bloque con el checkout internacional.
          </p>
        </div>
      </div>
    </div>
  );
}