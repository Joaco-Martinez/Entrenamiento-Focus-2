"use client";

import PaymentWithMpCard from "./payments/PaymentWithMpCard";
import { CheckoutCountry } from "@/components/checkout/CheckoutPageClient";
import { CartItem } from "@/context/CartContext";

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
      <div className="rounded-3xl border border-primary/20 bg-black/50 p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Pago en Argentina</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Pagá con Mercado Pago o tarjeta.
            </p>
          </div>

          <button
            type="button"
            onClick={onChangeCountry}
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            Cambiar país
          </button>
        </div>

        {creatingPreference ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
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
              unit_price: item.price,
              currency_id: "ARS" as const,
              description: item.description || item.title,
            }))}
            payerEmail={userEmail}
            onSuccess={(paymentId) => {
              console.log("Pago exitoso:", paymentId);
            }}
          />
        ) : (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-300">
            No se pudo generar la preferencia de pago.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-6 shadow-2xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Pago internacional</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Para compras fuera de Argentina vamos a usar PayPal.
          </p>
        </div>

        <button
          type="button"
          onClick={onChangeCountry}
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          Cambiar país
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-zinc-300">
          PayPal todavía no está integrado en este proyecto.
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Después conectamos este bloque con el checkout internacional.
        </p>
      </div>
    </div>
  );
}