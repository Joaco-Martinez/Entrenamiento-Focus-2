"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { paymentsService } from "@/services/payments.service"

export default function UserDashboardPage() {
  const { user, isPremium } = useAuth()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{
    subscriptionId: string | null
    subscriptionStartDate: string | null
    subscriptionEndDate: string | null
    hasActiveSubscription: boolean
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const email = user?.email ?? "—"
  const providerHint = useMemo(() => {
    // Si el user tiene subscriptionId pero no sabemos proveedor, lo dejamos neutro.
    if (!user?.subscriptionId) return null
    return "(tenés una suscripción registrada)"
  }, [user?.subscriptionId])

  const refresh = async () => {
    setError(null)
    setLoading(true)
    try {
      // En el back existe /payments/subscription-status (MP).
      // Si tu suscripción es PayPal, podés usar /payments/paypal/subscription-status.
      const mp = await paymentsService.subscriptionStatus().catch(() => null)
      const pp = await paymentsService.paypalSubscriptionStatus().catch(() => null)

      const best = (pp?.hasActiveSubscription ? pp : mp) ?? mp ?? pp
      if (best) {
        setStatus({
          subscriptionId: best.subscriptionId,
          subscriptionStartDate: best.subscriptionStartDate,
          subscriptionEndDate: best.subscriptionEndDate,
          hasActiveSubscription: best.hasActiveSubscription,
        })
      } else {
        setStatus(null)
      }
    } catch (e: any) {
      setError(e?.message || "No se pudo cargar el estado de tu suscripción.")
    } finally {
      setLoading(false)
    }
  }

  const cancel = async () => {
    const ok = confirm("¿Seguro que querés cancelar tu suscripción?")
    if (!ok) return

    setError(null)
    setLoading(true)
    try {
      // Probamos primero MP, y si falla probamos PayPal.
      await paymentsService.cancelSubscription().catch(async () => {
        await paymentsService.paypalCancelSubscription("User requested cancellation")
      })
      await refresh()
      alert("Listo: se pidió la cancelación.")
    } catch (e: any) {
      setError(e?.message || "No se pudo cancelar la suscripción.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold md:text-4xl">Hola 👋</h1>
        <p className="mt-2 text-white/70">Email: {email}</p>
        <p className="mt-1 text-white/70">
          Premium: {isPremium ? "Sí" : "No"} {providerHint ? <span className="text-white/50">{providerHint}</span> : null}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card title="Recursos" desc="Ver y comprar recursos" href="/recursos" />
        <Card title="Mi suscripción" desc="Estado y cancelación" href="#" onClick={refresh} />
        <Card title="Soporte" desc="Contactanos" href="/" />
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-bold">Suscripción</p>
            <p className="text-sm text-white/60">
              {status?.hasActiveSubscription ? "Activa" : "Inactiva"}
              {status?.subscriptionId ? ` · ID: ${status.subscriptionId}` : ""}
            </p>
            {status?.subscriptionStartDate ? (
              <p className="mt-1 text-xs text-white/50">Inicio: {new Date(status.subscriptionStartDate).toLocaleString("es-AR")}</p>
            ) : null}
            {status?.subscriptionEndDate ? (
              <p className="mt-1 text-xs text-white/50">Fin: {new Date(status.subscriptionEndDate).toLocaleString("es-AR")}</p>
            ) : null}
          </div>

          <div className="flex gap-3">
            <button
              onClick={refresh}
              disabled={loading}
              className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm hover:bg-white/[0.07] disabled:opacity-60"
            >
              {loading ? "Cargando..." : "Actualizar"}
            </button>
            <button
              onClick={cancel}
              disabled={loading || !status?.hasActiveSubscription}
              className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm text-red-200 hover:bg-red-500/15 disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}
      </section>

      <p className="text-sm text-white/50">
        Tip: para ver una plantilla premium, entrá a un recurso y tocá “Ver recurso”.
      </p>
    </div>
  )
}

function Card({
  title,
  desc,
  href,
  onClick,
}: {
  title: string
  desc: string
  href: string
  onClick?: () => void
}) {
  const Inner = (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5 transition hover:bg-black/40">
      <p className="text-sm font-semibold text-white/85">{title}</p>
      <p className="mt-2 text-sm text-white/60">{desc}</p>
      <div className="mt-4 h-[2px] w-12 rounded-full bg-primary/80" />
    </div>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="text-left">
        {Inner}
      </button>
    )
  }

  return <Link href={href}>{Inner}</Link>
}
