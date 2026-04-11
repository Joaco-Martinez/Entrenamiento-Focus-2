"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { paymentsService } from "@/services/payments.service";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

function PaypalReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("Verificando suscripción...");
  const [subscriptionId, setSubscriptionId] = useState("");

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        const id =
          searchParams.get("subscription_id") ||
          searchParams.get("subscriptionId") ||
          "";

        if (!id) {
          setMessage("No se recibió el ID de suscripción de PayPal.");
          setLoading(false);
          return;
        }

        setSubscriptionId(id);

        const res = await paymentsService.verifyPaypalSubscriptionSuccess(id);

        if (res?.verified || res?.ok || res?.status === "ACTIVE") {
          setVerified(true);
          setMessage("Tu suscripción quedó activa correctamente.");

          setTimeout(() => {
            router.push("/dashboard");
          }, 2500);
        } else {
          setVerified(false);
          setMessage(
            "PayPal respondió, pero todavía no pudimos confirmar la activación de la suscripción."
          );
        }
      } catch (error: any) {
        setVerified(false);
        setMessage(
          error?.message || "Ocurrió un error verificando la suscripción."
        );
      } finally {
        setLoading(false);
      }
    };

    verifySubscription();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <section className="mx-auto max-w-2xl rounded-3xl border border-[#D4AF37]/20 bg-gradient-to-b from-[#111111] to-[#050505] p-8 shadow-[0_0_40px_rgba(212,175,55,0.12)]">
        <div className="mb-6 flex justify-center">
          {loading ? (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
            </div>
          ) : verified ? (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            </div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10">
              <AlertTriangle className="h-10 w-10 text-yellow-400" />
            </div>
          )}
        </div>

        <h1 className="text-center text-3xl font-bold">
          {loading
            ? "Confirmando tu suscripción"
            : verified
            ? "Suscripción activada"
            : "No pudimos confirmar la suscripción"}
        </h1>

        <p className="mt-4 text-center text-white/75">{message}</p>

        {subscriptionId ? (
          <p className="mt-4 text-center text-sm text-white/40">
            ID de suscripción: {subscriptionId}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="flex-1 rounded-2xl bg-[#D4AF37] px-5 py-3 text-center font-semibold text-black transition hover:opacity-90"
          >
            Ir a mis compras y suscripciones
          </Link>

          <Link
            href="/mentoria"
            className="flex-1 rounded-2xl border border-white/10 px-5 py-3 text-center font-semibold text-white transition hover:bg-white/5"
          >
            Volver a mentoría
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function PaypalReturnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <PaypalReturnContent />
    </Suspense>
  );
}