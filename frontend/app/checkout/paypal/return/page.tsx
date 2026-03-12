"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function PaypalReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();

  const [message, setMessage] = useState("Confirmando pago con PayPal...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError("No llegó el token de PayPal.");
      setMessage("");
      return;
    }

    const confirmPayment = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payments/paypal/capture`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paypalOrderId: token,
            }),
          }
        );

        const data = await res.json();

        if (!res.ok || !data?.ok) {
          throw new Error(data?.message || "No se pudo capturar el pago");
        }

        clearCart();
        setMessage("Pago confirmado correctamente.");

        setTimeout(() => {
          router.replace("/checkout?paypal=success");
        }, 1200);
      } catch (err) {
        console.error("Error capturando PayPal:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Error al confirmar el pago con PayPal"
        );
        setMessage("");
      }
    };

    confirmPayment();
  }, [searchParams, clearCart, router]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-6 text-white">
      <div className="mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-black p-6">
        {message && <p className="text-sm text-zinc-300">{message}</p>}

        {error && (
          <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-200">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}