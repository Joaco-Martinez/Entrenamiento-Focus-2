"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, XCircle, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "EXPIRED"
  | "PAST_DUE"
  | "SUSPENDED";

type IntentStatus =
  | "PENDING"
  | "MATCHED"
  | "ACTIVATED"
  | "FAILED"
  | "EXPIRED";

type SubscriptionResponse = {
  ok: boolean;
  subscription?: {
    id: string;
    status: SubscriptionStatus;
    provider?: string;
    payerEmail?: string | null;
    externalId?: string | null;
  } | null;
  latestIntent?: {
    id: string;
    status: IntentStatus;
    mpPreapprovalId?: string | null;
  } | null;
  isPremium?: boolean;
};

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const preapprovalId = searchParams.get("preapprovalId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<SubscriptionResponse | null>(null);

  const intentStatus = data?.latestIntent?.status;

  const title = useMemo(() => {
    if (loading) return "Estamos activando tu suscripción";
    if (data?.isPremium) return "Tu suscripción ya está activa";
    if (intentStatus === "PENDING" || intentStatus === "MATCHED") {
      return "Tu pago fue recibido";
    }
    return "No pudimos confirmar la suscripción";
  }, [loading, data?.isPremium, intentStatus]);

  const description = useMemo(() => {
    if (loading) {
      return "Estamos verificando tu suscripción con Mercado Pago. Esto puede tardar unos segundos.";
    }

    if (data?.isPremium) {
      return "Ya tenés acceso habilitado. Podés entrar a tu panel y acceder al contenido.";
    }

    if (intentStatus === "PENDING" || intentStatus === "MATCHED") {
      return "Tu suscripción figura en proceso. Si el webhook tarda unos segundos, se va a activar automáticamente.";
    }

    return (
      error ||
      "Todavía no pudimos confirmar la activación. Probá actualizar en unos segundos."
    );
  }, [loading, data?.isPremium, intentStatus, error]);

  useEffect(() => {
    let cancelled = false;

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const checkSubscription = async () => {
      try {
        setLoading(true);
        setError("");

        for (let i = 0; i < 6; i++) {
          const res = (await apiFetch(
  "/mp-link-subscriptions/me",
  { method: "GET" }
)) as SubscriptionResponse;

          if (cancelled) return;

          setData(res);

          if (res?.isPremium) {
            setLoading(false);
            return;
          }

          if (i < 5) {
            await sleep(3000);
          }
        }

        if (!cancelled) {
          setLoading(false);
        }
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "No se pudo verificar tu suscripción"
        );
        setLoading(false);
      }
    };

    checkSubscription();

    return () => {
      cancelled = true;
    };
  }, [preapprovalId]);

  const statusIcon = useMemo(() => {
    if (loading) {
      return <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37]" />;
    }

    if (data?.isPremium) {
      return <CheckCircle2 className="h-12 w-12 text-green-400" />;
    }

    if (intentStatus === "PENDING" || intentStatus === "MATCHED") {
      return <Clock3 className="h-12 w-12 text-yellow-400" />;
    }

    return <XCircle className="h-12 w-12 text-red-400" />;
  }, [loading, data?.isPremium, intentStatus]);

  return (
    <main className="min-h-screen bg-[#0b0b0f] px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#16161d] to-[#0d0d11] p-8 text-center shadow-2xl md:p-12">
          <div className="mb-6 flex justify-center">{statusIcon}</div>

          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#D4AF37]">
            Entrenamiento Focus
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            {title}
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/70">
            {description}
          </p>

          {preapprovalId && (
            <p className="mt-5 break-all text-xs text-white/40">
              ID de suscripción: {preapprovalId}
            </p>
          )}

          {data?.subscription && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left">
              <p className="text-sm text-white/60">
                Estado actual:{" "}
                <span className="font-semibold text-white">
                  {data.subscription.status}
                </span>
              </p>

              {data.subscription.provider && (
                <p className="mt-2 text-sm text-white/60">
                  Proveedor:{" "}
                  <span className="font-semibold text-white">
                    {data.subscription.provider}
                  </span>
                </p>
              )}

              {data.subscription.payerEmail && (
                <p className="mt-2 text-sm text-white/60">
                  Email pagador:{" "}
                  <span className="font-semibold text-white">
                    {data.subscription.payerEmail}
                  </span>
                </p>
              )}

              {data.subscription.externalId && (
                <p className="mt-2 break-all text-sm text-white/60">
                  ID externo:{" "}
                  <span className="font-semibold text-white">
                    {data.subscription.externalId}
                  </span>
                </p>
              )}
            </div>
          )}

          {data?.latestIntent && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left">
              <p className="text-sm text-white/60">
                Estado del intento:{" "}
                <span className="font-semibold text-white">
                  {data.latestIntent.status}
                </span>
              </p>

              {data.latestIntent.mpPreapprovalId && (
                <p className="mt-2 break-all text-sm text-white/60">
                  Preapproval ID:{" "}
                  <span className="font-semibold text-white">
                    {data.latestIntent.mpPreapprovalId}
                  </span>
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Ir a mi panel
            </Link>

            <Link
              href="/mentoria"
              className="inline-flex min-w-[220px] items-center justify-center rounded-2xl border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              Volver a mentoría
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}