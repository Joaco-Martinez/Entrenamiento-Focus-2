"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { ArrowRight, Lock, Sparkles, ShoppingCart } from "lucide-react"
import { productsService, Product } from "@/services/products.service"
import { paymentsService } from "@/services/payments.service"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"

const HIDDEN_PRODUCT_ID = "mentoria-focus-product-id"

export default function RecursosPage() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { addToCart, isInCart } = useCart()
  const { user } = useAuth()

  const isAdmin = user?.role === "ADMIN" 

  useEffect(() => {
    const run = async () => {
      setError(null)
      setLoading(true)

      try {
        const [productsData, mpStatus, paypalStatus] = await Promise.all([
          productsService.getAll(),
          paymentsService.subscriptionStatus().catch(() => null),
          paymentsService.paypalSubscriptionStatus().catch(() => null),
        ])

        const rawItems = Array.isArray(productsData)
          ? productsData
          : productsData.products ?? []

        const bestStatus =
          (paypalStatus?.hasActiveSubscription ? paypalStatus : mpStatus) ??
          mpStatus ??
          paypalStatus

        const hasActiveSubscription = Boolean(bestStatus?.hasActiveSubscription)

        const filteredItems = rawItems.filter((item) => {
          if (String(item.id) === HIDDEN_PRODUCT_ID) return false

          if (item.requiresPremium && !hasActiveSubscription && !isAdmin) {
            return false
          }

          return true
        })

        setItems(filteredItems)
      } catch (e: any) {
        setError(e?.message || "No se pudieron cargar los recursos.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [isAdmin])

  return (
    <section className="bg-muted/20 px-4 py-20 md:py-24">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          <div className="space-y-5 text-center">
            <h1 className="text-balance text-4xl font-bold md:text-6xl">
              Productos <span className="text-primary">Focus</span>
            </h1>

            <p className="mx-auto max-w-3xl text-lg text-muted-foreground md:text-xl">
              Elegí un recurso, mirá el detalle y agregalo al carrito.
            </p>

            <div className="mx-auto h-1 w-16 rounded-full bg-primary" />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[520px] animate-pulse rounded-3xl bg-card/40"
                />
              ))
            ) : items.length === 0 ? (
              <p className="text-muted-foreground">
                Todavía no hay recursos cargados.
              </p>
            ) : (
              items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.35 }}
                >
                  <Card className="group relative overflow-hidden rounded-3xl border border-white/10 bg-card p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                    <div className="absolute right-5 top-5 z-20">
                      {item.requiresPremium ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                          <Lock className="h-3.5 w-3.5" />
                          Premium
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm">
                          <Sparkles className="h-3.5 w-3.5" />
                          Libre
                        </span>
                      )}
                    </div>

                    <Link href={`/recursos/${item.id}`} className="block">
                      <div className="relative overflow-hidden rounded-2xl">
                        <div className="relative aspect-4/3 w-full">
                          <Image
                            src={item.coverImageUrl || "/placeholder.svg"}
                            alt={item.title || "Imagen del recurso"}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="bg-transparent object-contain"
                          />
                        </div>
                      </div>

                      <div className="mt-5 space-y-3">
                        <div className="space-y-2">
                          <h3 className="line-clamp-2 text-2xl font-bold leading-tight">
                            {item.title}
                          </h3>

                          {item.description ? (
                            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                              {item.description}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap items-end gap-2 pt-1">
                          <span className="text-3xl font-extrabold text-primary">
                            USD {Number(item.usdPrice ?? 0).toFixed(2)}
                          </span>

                          {item.arPrice != null ? (
                            <span className="pb-1 text-sm text-muted-foreground">
                              · ARS{" "}
                              {Number(item.arPrice).toLocaleString("es-AR")}
                            </span>
                          ) : (
                            <span className="pb-1 text-sm text-muted-foreground">
                              · {item.isSubscription ? "mensual" : "pago único"}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const cartItem = {
                            id: String(item.id),
                            title: item.title ?? "",
                            arPrice: Number(item.arPrice ?? 0),
                            usdPrice: Number(item.usdPrice ?? 0),
                            coverImageUrl: item.coverImageUrl || undefined,
                            description: item.description || undefined,
                            quantity: 1,
                          }

                          addToCart(cartItem)
                        }}
                        className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/15"
                      >
                        <ShoppingCart className="h-4 w-4 shrink-0" />
                        <span className="text-center">
                          {isInCart(String(item.id))
                            ? "Agregar otro"
                            : "Agregar al carrito"}
                        </span>
                      </button>

                      <Link
                        href={`/recursos/${item.id}`}
                        className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                      >
                        Ver detalle
                        <ArrowRight className="h-4 w-4 shrink-0" />
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}