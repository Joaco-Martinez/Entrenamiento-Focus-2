/**
 * Mantenimiento web del sitio (cobranza.joacodev.com.ar): si hay un pago pendiente y si el sitio
 * está suspendido por falta de pago. Lo usan app/layout.tsx, el aviso del panel y /admin/servicio-web.
 * Sin las variables configuradas o si la API no responde, el sitio nunca se suspende.
 */
const API = process.env.NEXT_PUBLIC_MENSUALIDADES_API_URL;
const TOKEN = process.env.NEXT_PUBLIC_MENSUALIDADES_SITE_TOKEN;
const CACHE_MS = 5 * 60_000;

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export type ServiceCharge = {
  id: string;
  month: number;
  year: number;
  status: "PENDING_PAYMENT" | "PENDING_CONFIRMATION" | "REJECTED";
  amountARS: string;
  suspendFrom: string;
};

export type ServiceStatus = {
  suspended: boolean;
  payUrl: string;
  project: { name: string };
  charges: ServiceCharge[];
};

let cached: { status: ServiceStatus | null; at: number } | null = null;

export async function getServiceStatus(): Promise<ServiceStatus | null> {
  if (!API || !TOKEN) return null;
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.status;
  try {
    const res = await fetch(`${API}/site/${TOKEN}/status`, {
      next: { revalidate: CACHE_MS / 1000 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(String(res.status));
    const status = (await res.json()) as ServiceStatus;
    cached = { status, at: Date.now() };
    return status;
  } catch {
    return cached?.status ?? null;
  }
}

/** Cobros que faltan pagar (los informados quedan en revisión y no cuentan) */
export function owedCharges(status: ServiceStatus | null): ServiceCharge[] {
  return status?.charges.filter((c) => c.status === "PENDING_PAYMENT" || c.status === "REJECTED") ?? [];
}

export function chargePeriod(c: ServiceCharge): string {
  return `${MONTHS[c.month - 1]} ${c.year}`;
}

export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "long", timeZone: "America/Argentina/Buenos_Aires" });
}
