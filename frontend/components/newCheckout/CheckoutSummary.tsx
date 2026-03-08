"use client";

import Image from "next/image";
import { CartItem } from "@/context/CartContext";

type Props = {
  cart: CartItem[];
  subtotal: number;
  currency: "ARS" | "USD";
};

function formatMoney(value: number, currency: "ARS" | "USD") {
  return new Intl.NumberFormat(currency === "ARS" ? "es-AR" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function getUnitPriceByCurrency(item: CartItem, currency: "ARS" | "USD") {
  return currency === "ARS" ? item.arPrice : item.usdPrice;
}

export default function CheckoutSummary({ cart, subtotal, currency }: Props) {
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <aside className="h-fit overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a0a] shadow-[0_20px_80px_rgba(0,0,0,0.35)] xl:sticky xl:top-6">
      <div className="flex items-start justify-between gap-3 border-b border-white/8 px-5 py-5 sm:px-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#F5C84C]/70">
            Tu compra
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Resumen</h2>
        </div>

        <div className="rounded-full bg-[#F5C84C]/10 px-3 py-1 text-xs font-semibold text-[#F5C84C]">
          {totalQuantity} item{totalQuantity !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="space-y-3 px-5 py-5 sm:px-6">
        {cart.map((item) => {
          const unitPrice = getUnitPriceByCurrency(item, currency);
          const lineTotal = unitPrice * item.quantity;

          return (
            <div
              key={item.id}
              className="flex gap-3 rounded-2xl bg-white/[0.03] p-3"
            >
              <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                <Image
                  src={item.coverImageUrl || "/placeholder.svg"}
                  alt={item.title || "Producto"}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-2 text-sm font-medium text-white">
                    {item.title}
                  </h3>
                  <span className="shrink-0 text-sm font-semibold text-white">
                    {formatMoney(lineTotal, currency)}
                  </span>
                </div>

                {item.description ? (
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                    {item.description}
                  </p>
                ) : null}

                <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                  <span>
                    {item.quantity} x {formatMoney(unitPrice, currency)}
                  </span>

                  <span className="rounded-full bg-white/6 px-2.5 py-1 text-[11px] text-zinc-300">
                    Digital
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/8 px-5 py-5 sm:px-6">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal, currency)}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span>Moneda</span>
            <span>{currency === "ARS" ? "Pesos argentinos" : "Dólares"}</span>
          </div>
        </div>

        <div className="my-5 h-px bg-white/8" />

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-400">Total</p>
            <p className="text-2xl font-semibold text-[#F5C84C]">
              {formatMoney(subtotal, currency)}
            </p>
          </div>

          <p className="max-w-[140px] text-right text-xs leading-relaxed text-zinc-500">
            Pago seguro y acceso automático al contenido.
          </p>
        </div>
      </div>
    </aside>
  );
}