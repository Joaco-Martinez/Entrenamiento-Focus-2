"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Lock, ExternalLink } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { productsService, Product } from "@/services/products.service"
import { paymentsService } from "@/services/payments.service"
import { useAuth } from "@/context/AuthContext"

type CountryChoice = "AR" | "OTHER"

export default function RecursoDetailPage() {
  const params = useParams() as { id?: string; slug?: string }
  const router = useRouter()
  const { isAuth, isPremium } = useAuth()
const rawId = params.id ?? params.slug
  const id = Number(rawId)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [buying, setBuying] = useState(false)
  const [country, setCountry] = useState<CountryChoice | null>(null)

  const canOpenResource = useMemo(() => {
    if (!product) return false
    if (!product.requiresPremium) return true
    return isPremium
  }, [product, isPremium])

  useEffect(() => {
    if (!Number.isFinite(id)) {
      router.replace("/recursos")
      return
    }

    const run = async () => {
      setError(null)
      setLoading(true)
      try {
        const p = await productsService.getById(id)
        setProduct(p)
      } catch (e: any) {
        setError(e?.message || "No se pudo cargar el recurso")
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id, router])

  const handleViewResource = async () => {
    if (!product) return
    if (!isAuth) {
      router.push(`/login?redirect=${encodeURIComponent(`/recursos/${product.id}`)}`)
      return
    }

    try {
      const access = await productsService.getAccess(product.id)
      window.open(access.resourceUrl, "_blank", "noopener,noreferrer")
    } catch (e: any) {
      // si el back tira premium_required lo mostramos “humano”
      const msg = e?.message || "No tenés acceso todavía."
      alert(msg)
    }
  }

const startCheckout = async () => {
  if (!product) return

  // necesitamos país antes de pagar
  if (!country) {
    alert("Elegí tu país antes de pagar (Argentina u otro país).")
    return
  }

  if (!isAuth) {
    router.push(`/login?redirect=${encodeURIComponent(`/recursos/${product.id}`)}`)
    return
  }

  setBuying(true)
  try {
    if (country === "AR") {
      if (product.isSubscription) {
        const r = await paymentsService.createSubscription(product.id)
        window.location.href = r.init_point
        return
      }

      const r = await paymentsService.createPreference([{ id: String(product.id), quantity: 1 }])
      window.location.href = r.init_point
      return
    }

    // OTHER => PayPal
    const origin = window.location.origin

    if (product.isSubscription) {
      const r = await paymentsService.paypalCreateSubscription({
        productId: product.id,
        returnUrl: `${origin}/pay/paypal/success`,
        cancelUrl: `${origin}/pay/paypal/cancel`,
      })
      if (!r?.approveUrl) throw new Error("PayPal no devolvió approveUrl")
      window.location.href = r.approveUrl
      return
    }

    const r = await paymentsService.paypalCreateOrder({
      items: [{ id: String(product.id), quantity: 1 }],
      returnUrl: `${origin}/pay/paypal/success`,
      cancelUrl: `${origin}/pay/paypal/cancel`,
    })
    if (!r?.approveUrl) throw new Error("PayPal no devolvió approveUrl")
    window.location.href = r.approveUrl
  } catch (e: any) {
    alert(e?.message || "No se pudo iniciar el pago")
  } finally {
    setBuying(false)
  }
}

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">No encontramos el recurso.</p>
          <Link className="text-primary underline" href="/recursos">
            Volver
          </Link>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>
      </div>
    )
  }

  return (
    <section className="py-14 px-4 bg-[#0b0b0c]">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href="/recursos"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a recursos
          </Link>
        </div>

        <Card className="relative overflow-hidden border border-primary/20 bg-[#101114] px-6 py-10 md:px-12 md:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(99,102,241,0.16),transparent_60%)]" />

          <header className="relative text-center mb-10 space-y-3">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-wide text-primary">{product.name}</h1>
            <p className="text-white/60">{product.isSubscription ? "Suscripción" : "Recurso"} · {product.requiresPremium ? "Premium" : "Libre"}</p>
          </header>

          <div className="relative grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-10 md:gap-12 items-start">
            <aside className="order-1 md:order-2 md:sticky md:top-10">
              <div className="flex flex-col items-center">
                <div className="relative w-72 md:w-[380px] aspect-square overflow-hidden rounded-2xl border border-primary/20 bg-[#0c0d0f]">
                  <Image
                    src={product.coverImageUrl || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 288px, 380px"
                    className="object-cover"
                    priority
                  />
                </div>

                <div className="flex flex-col items-center gap-2 pt-5">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-primary">USD {Number(product.priceUsd).toFixed(2)}</span>
                    <span className="text-white/50">{product.isSubscription ? "mensual" : "pago único"}</span>
                  </div>
                  {product.priceArs != null ? (
                    <p className="text-sm text-white/60">ARS {Number(product.priceArs).toLocaleString("es-AR")}</p>
                  ) : null}
                </div>

                <div className="mt-7 w-full space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-semibold">Antes de pagar</p>
                    <p className="mt-1 text-xs text-white/60">Argentina → Mercado Pago · Otro país → PayPal</p>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCountry("AR")}
                        className={`flex-1 rounded-xl px-3 py-2 text-sm border transition ${
                          country === "AR" ? "border-primary bg-primary/15" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                        }`}
                      >
                        Argentina
                      </button>
                      <button
                        type="button"
                        onClick={() => setCountry("OTHER")}
                        className={`flex-1 rounded-xl px-3 py-2 text-sm border transition ${
                          country === "OTHER" ? "border-primary bg-primary/15" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                        }`}
                      >
                        Otro país
                      </button>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full rounded-2xl"
                    onClick={startCheckout}
                    disabled={buying}
                  >
                    {buying ? "Iniciando pago..." : product.isSubscription ? "Suscribirme" : "Comprar"}
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full rounded-2xl"
                    onClick={handleViewResource}
                    disabled={!canOpenResource}
                  >
                    {product.requiresPremium && !isPremium ? (
                      <span className="inline-flex items-center gap-2">
                        <Lock className="h-4 w-4" /> Requiere Premium
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" /> Ver recurso
                      </span>
                    )}
                  </Button>

                  <p className="text-xs text-white/50">
                    Si ya compraste y sos Premium, tocá “Ver recurso”.
                  </p>
                </div>
              </div>
            </aside>

            <div className="order-2 md:order-1 space-y-6">
              {product.description ? (
                <p className="text-white/70 leading-relaxed text-base md:text-lg whitespace-pre-line">
                  {product.description}
                </p>
              ) : (
                <p className="text-white/60">Este recurso todavía no tiene descripción.</p>
              )}

              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5 text-sm text-white/80">
                <p>
                  <span className="font-semibold text-white">Tip:</span> si el recurso es Premium, lo vas a poder abrir cuando tu suscripción esté activa.
                </p>
                <p className="mt-2">
                  Tu estado Premium lo podés ver en <Link className="underline text-primary" href="/dashboard">/dashboard</Link>.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
