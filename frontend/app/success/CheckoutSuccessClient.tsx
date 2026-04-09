"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
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

  useEffect(() => {
    if (
      normalizedStatus === "approved" ||
      normalizedStatus === "success" ||
      normalizedStatus === "paid"
    ) {
      clearCart();
    }
  }, [normalizedStatus, clearCart]);

  const statusConfig = useMemo(() => {
    if (
      normalizedStatus === "approved" ||
      normalizedStatus === "success" ||
      normalizedStatus === "paid"
    ) {
      return {
        title: "¡Pago aprobado!",
        description: "Tu pago fue procesado correctamente.",
        icon: CheckCircle2,
      };
    }

    if (
      normalizedStatus === "pending" ||
      normalizedStatus === "in_process" ||
      normalizedStatus === "processing"
    ) {
      return {
        title: "Pago pendiente",
        description: "Tu pago está siendo procesado.",
        icon: Clock3,
      };
    }

    return {
      title: "Pago no aprobado",
      description: "Hubo un problema con el pago o fue rechazado.",
      icon: XCircle,
    };
  }, [normalizedStatus]);

  const Icon = statusConfig.icon;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <Icon className="h-16 w-16 mb-4" />
          <h1 className="text-3xl font-bold">{statusConfig.title}</h1>
          <p className="mt-2 text-white/70">{statusConfig.description}</p>
        </div>

        <div className="mt-8 space-y-3 rounded-xl bg-black/30 p-5 border border-white/10">
          <InfoRow label="Estado" value={normalizedStatus || "-"} />
          <InfoRow label="Payment ID" value={data.paymentId} />
          <InfoRow label="Collection ID" value={data.collectionId} />
          <InfoRow label="External Reference" value={data.externalReference} />
          <InfoRow label="Tipo de pago" value={data.paymentType} />
          <InfoRow label="Merchant Order ID" value={data.merchantOrderId} />
          <InfoRow label="Preference ID" value={data.preferenceId} />
          <InfoRow label="Site ID" value={data.siteId} />
          <InfoRow label="Processing Mode" value={data.processingMode} />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 bg-white text-black font-semibold hover:opacity-90 transition"
          >
            <Home className="h-4 w-4" />
            Ir al inicio
          </Link>

          <Link
            href="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 border border-white/15 bg-white/5 hover:bg-white/10 transition"
          >
            <LayoutDashboard className="h-4 w-4" />
            Ir al dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2 last:border-b-0 last:pb-0">
      <span className="text-white/60">{label}</span>
      <span className="text-right font-medium">{value || "-"}</span>
    </div>
  );
}