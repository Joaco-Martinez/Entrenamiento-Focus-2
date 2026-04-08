"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Clock3,
  Home,
  LayoutDashboard,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CheckoutSuccessClient() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const didClearCartRef = useRef(false);

  const data = useMemo(() => {
    return {
      collectionId: searchParams.get("collection_id"),
      collectionStatus: searchParams.get("collection_status"),
      paymentId: searchParams.get("payment_id"),
      status: searchParams.get("status"),
      externalReference: searchParams.get("external_reference"),
      paymentType: searchParams.get("payment_type"),
      merchantOrderId: searchParams.get("merchant_order_id"),
      preferenceId: searchParams.get("preference_id"),
      siteId: searchParams.get("site_id"),
      processingMode: searchParams.get("processing_mode"),
    };
  }, [searchParams]);

  const normalizedStatus = (
    data.status ||
    data.collectionStatus ||
    ""
  ).toLowerCase();

  const statusConfig = useMemo(() => {
    if (normalizedStatus === "approved") {
      return {
        title: "¡Pago aprobado!",
        description:
          "Tu pago fue procesado correctamente. En breve vas a poder ver tu compra reflejada en tu cuenta.",
        icon: <CheckCircle2 className="h-14 w-14 text-green-400" />,
        badge: "Aprobado",
        badgeClass: "border-green-500/30 bg-green-500/10 text-green-300",
      };
    }

    if (normalizedStatus === "pending" || normalizedStatus === "in_process") {
      return {
        title: "Pago en proceso",
        description:
          "Tu pago todavía se está verificando. Apenas Mercado Pago lo confirme, vas a ver el acceso actualizado.",
        icon: <Clock3 className="h-14 w-14 text-yellow-400" />,
        badge: "En proceso",
        badgeClass: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
      };
    }

    return {
      title: "No se pudo confirmar el pago",
      description:
        "No pudimos validar el pago como aprobado desde esta pantalla. Revisá el estado en tu cuenta o volvé a intentarlo.",
      icon: <XCircle className="h-14 w-14 text-red-400" />,
      badge: "No aprobado",
      badgeClass: "border-red-500/30 bg-red-500/10 text-red-300",
    };
  }, [normalizedStatus]);

  useEffect(() => {
    if (normalizedStatus === "approved" && !didClearCartRef.current) {
      didClearCartRef.current = true;
      clearCart();
    }
  }, [normalizedStatus]);

  return (
    <main className="min-h-screen bg-[#070707] px-4 py-10 text-white md:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <div className="border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent px-6 py-8 md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/40">
              Checkout
            </p>

            <div className="mt-5 flex flex-col items-start gap-4">
              {statusConfig.icon}

              <div>
                <div
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusConfig.badgeClass}`}
                >
                  {statusConfig.badge}
                </div>

                <h1 className="mt-4 text-3xl font-extrabold md:text-4xl">
                  {statusConfig.title}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 md:text-base">
                  {statusConfig.description}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 md:px-8">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard
                label="Estado"
                value={data.status || data.collectionStatus || "Sin datos"}
              />
              <InfoCard
                label="Payment ID"
                value={data.paymentId || data.collectionId || "Sin datos"}
              />
              <InfoCard
                label="Referencia externa"
                value={data.externalReference || "Sin datos"}
              />
              <InfoCard
                label="Merchant Order ID"
                value={data.merchantOrderId || "Sin datos"}
              />
              <InfoCard
                label="Tipo de pago"
                value={data.paymentType || "Sin datos"}
              />
              <InfoCard
                label="Preference ID"
                value={data.preferenceId || "Sin datos"}
              />
            </div>

            {normalizedStatus === "approved" && (
              <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm leading-6 text-white/85">
                Tu compra fue registrada correctamente.
                <br />
                <span className="text-white/65">ID de orden interna:</span>{" "}
                <span className="font-semibold text-primary">
                  {data.externalReference || "No disponible"}
                </span>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
              >
                <Home className="h-4 w-4" />
                Ir al inicio
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[0_14px_40px_rgba(255,190,0,0.20)] transition hover:scale-[1.01] hover:opacity-95"
              >
                <LayoutDashboard className="h-4 w-4" />
                Ir a mi panel de usuario
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-medium text-white/90">
        {value}
      </p>
    </div>
  );
}