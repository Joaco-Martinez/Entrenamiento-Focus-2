"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function PaypalSuccessPage() {
  const sp = useSearchParams()
  const subscriptionId = sp.get("subscription_id")
  const baToken = sp.get("ba_token")

  return (
    <div className="min-h-[70vh] grid place-items-center px-6">
      <div className="max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center space-y-4">
        <h1 className="text-3xl font-extrabold">Pago confirmado ✅</h1>
        <p className="text-white/70">
          Si estabas suscribiéndote por PayPal, en unos segundos el webhook va a actualizar tu cuenta.
        </p>
        {(subscriptionId || baToken) ? (
          <p className="text-xs text-white/50 break-all">
            {subscriptionId ? `subscription_id: ${subscriptionId}` : null}
            {subscriptionId && baToken ? " · " : null}
            {baToken ? `ba_token: ${baToken}` : null}
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          <Link href="/dashboard" className="rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground">
            Ir al dashboard
          </Link>
          <Link href="/recursos" className="rounded-xl border border-white/15 bg-white/[0.02] px-4 py-3 text-white/80">
            Volver a recursos
          </Link>
        </div>
      </div>
    </div>
  )
}
