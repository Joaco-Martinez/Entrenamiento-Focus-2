"use client";

import Image from "next/image";
import { CartItem } from "@/context/CartContext";

type Props = {
  cart: CartItem[];
  subtotal: number;
};

export default function CheckoutSummary({ cart, subtotal }: Props) {
  return (
    <aside className="h-fit rounded-3xl border border-white/10 bg-black/40 p-6 shadow-2xl">
      <h2 className="text-xl font-bold">Resumen</h2>

      <div className="mt-5 space-y-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-3"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
              <Image
                src={item.coverImageUrl || "/placeholder.svg"}
                alt={item.title || "Producto"}
                fill
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 font-semibold">{item.title}</h3>

              {item.description ? (
                <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                  {item.description}
                </p>
              ) : null}

              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-zinc-400">Cantidad: {item.quantity}</span>
                <span className="font-semibold">
                  USD {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>Subtotal</span>
          <span>USD {subtotal.toFixed(2)}</span>
        </div>

        <div className="mt-3 flex items-center justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-primary">USD {subtotal.toFixed(2)}</span>
        </div>
      </div>
    </aside>
  );
}