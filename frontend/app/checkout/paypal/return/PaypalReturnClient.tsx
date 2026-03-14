"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "../../../../lib/api";

type Status = "processing" | "success" | "error";

export default function PaypalReturnClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("processing");

  useEffect(() => {
    const token = searchParams.get("token");
    const payerId = searchParams.get("PayerID");

    if (!token) {
      router.replace("/checkout?error=paypal_missing_token");
      return;
    }

    const capture = async () => {
      try {
        await apiFetch("/paypal_checkout/capture", {
          method: "POST",
          body: JSON.stringify({
            paypalOrderId: token,
            payerId,
          }),
        });

        setStatus("success");

        setTimeout(() => {
          router.replace("/panel");
        }, 3000);
      } catch (err) {
        console.error("Error capturando pago PayPal", err);
        setStatus("error");

        setTimeout(() => {
          router.replace("/checkout?error=paypal_capture_failed");
        }, 3000);
      }
    };

    capture();
  }, [searchParams, router]);

  const content = {
    processing: {
      icon: (
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-700 border-t-yellow-500" />
      ),
      title: "Procesando pago con PayPal...",
      description:
        "Estamos confirmando tu pago. Esto puede tardar unos segundos.",
      badge: "Procesando",
      badgeClass:
        "bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20",
    },
    success: {
      icon: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-3xl ring-1 ring-green-500/20">
          ✅
        </div>
      ),
      title: "Pago procesado correctamente",
      description:
        "Tu compra fue confirmada. Podrás ver tus recursos comprados desde el panel de usuario.",
      badge: "Pago confirmado",
      badgeClass: "bg-green-500/10 text-green-400 ring-1 ring-green-500/20",
    },
    error: {
      icon: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-3xl ring-1 ring-red-500/20">
          ❌
        </div>
      ),
      title: "Hubo un problema con el pago",
      description:
        "No pudimos confirmar tu pago. Intentá nuevamente en unos instantes.",
      badge: "Error",
      badgeClass: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
    },
  }[status];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-zinc-950 to-black px-4 py-10 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 flex justify-center">{content.icon}</div>

        <div className="mb-4 flex justify-center">
          <span
            className={`rounded-full px-4 py-1 text-sm font-medium ${content.badgeClass}`}
          >
            {content.badge}
          </span>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {content.title}
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-zinc-300 sm:text-base">
            {content.description}
          </p>

          {status === "success" && (
            <p className="mt-4 text-sm text-zinc-400">
              Serás redirigido automáticamente al panel.
            </p>
          )}

          {status === "processing" && (
            <p className="mt-4 text-sm text-zinc-400">
              Por favor, no cierres esta ventana.
            </p>
          )}

          {status === "error" && (
            <button
              onClick={() => router.replace("/checkout")}
              className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Volver al checkout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}