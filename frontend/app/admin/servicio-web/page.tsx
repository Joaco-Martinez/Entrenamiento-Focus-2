"use client";

import { ServicioWebPayment } from "@/components/admin/ServicioWeb";

export default function ServicioWebPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Servicio web</h1>
      <p className="mt-2 mb-6 text-sm text-white/55">
        Pago mensual del mantenimiento del sitio. Transferí al CBU o alias indicado y avisá desde acá.
      </p>
      <ServicioWebPayment />
    </div>
  );
}
