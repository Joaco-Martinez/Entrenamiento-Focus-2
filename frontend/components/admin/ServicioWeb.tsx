"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { chargePeriod, formatDay, getServiceStatus, owedCharges, type ServiceStatus } from "@/lib/servicio-web";

const PAGE = "/admin/servicio-web";

function useServiceStatus() {
  const [status, setStatus] = useState<ServiceStatus | null | undefined>(undefined);
  useEffect(() => {
    getServiceStatus().then(setStatus);
  }, []);
  return status;
}

// Aviso arriba del panel cuando hay que pagar el mantenimiento web
// (si el sitio ya está suspendido se ve el cartel de mantenimiento, ver app/layout.tsx)
export function ServicioWebBanner() {
  const status = useServiceStatus();
  const pathname = usePathname();
  const owed = owedCharges(status ?? null);
  if (!status || !owed.length || pathname === PAGE) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4">
      <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-400" />
      <p className="min-w-0 flex-1 text-sm text-white/80">
        <strong className="text-white">Pago pendiente del mantenimiento web ({chargePeriod(owed[0])}).</strong> Si no
        se paga, el sitio pasa a mantenimiento el {formatDay(owed[0].suspendFrom)}.
      </p>
      <Link
        href={PAGE}
        className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300"
      >
        Pagar ahora
      </Link>
    </div>
  );
}

// Pago del mantenimiento web: la página de cobranza embebida
export function ServicioWebPayment() {
  const status = useServiceStatus();

  if (status === undefined) return <p className="text-sm text-white/55">Cargando...</p>;
  if (!status) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-white/60">
        No se pudo consultar el estado del servicio web. Probá de nuevo en un rato.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <iframe
        src={`${status.payUrl}?embed=1`}
        title="Pago del servicio web"
        className="h-[900px] w-full rounded-2xl border border-white/10 bg-white"
      />
      <a
        href={status.payUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-white/55 transition hover:text-white"
      >
        <ExternalLink className="h-4 w-4" /> Abrir en otra pestaña
      </a>
    </div>
  );
}
