"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { ArrowRight, Lock, Sparkles, ShoppingCart } from "lucide-react"
import { productsService, Product } from "@/services/products.service"
import { useCart } from "@/context/CartContext"

export default function RecursosPage() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToCart, isInCart } = useCart()

  
  useEffect(() => {
    const run = async () => {
      setError(null)
      setLoading(true)

      try {
        const data = await productsService.getAll()

        // por si la API devuelve array directo o { products: [...] }
        if (Array.isArray(data)) {
          setItems(data)
        } else {
          setItems(data.products ?? [])
        }
      } catch (e: any) {
        setError(e?.message || "No se pudieron cargar los recursos.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  return (
    <section className="bg-muted/20 px-4 py-24">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          <div className="space-y-5 text-center">
            <h1 className="text-balance text-4xl font-bold md:text-6xl">
              Recursos <span className="text-primary">Focus</span>
            </h1>

            <p className="mx-auto max-w-3xl text-lg text-muted-foreground md:text-xl">
              Elegí un recurso, mirá el detalle, agregalo al carrito o compralo directo.
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
                  className="h-95 animate-pulse rounded-2xl border border-primary/10 bg-card/40"
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
                  <Card className="relative overflow-hidden border-2 border-primary/15 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-2xl">
                    <div className="pointer-events-none absolute inset-0 bg-primary/0 transition-colors hover:bg-primary/5" />

                    <div className="absolute right-4 top-4 z-10 flex gap-2">
                      {item.requiresPremium ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                          <Lock className="h-4 w-4" />
                          Premium
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          <Sparkles className="h-4 w-4" />
                          Libre
                        </span>
                      )}
                    </div>

                    <Link href={`/recursos/${item.id}`} className="group block">
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-primary/20 bg-muted/30">
                        <Image
                          src={item.coverImageUrl || "/placeholder.svg"}
                          alt={item.title || "Imagen del recurso"}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </div>

                      <div className="relative mt-5 space-y-3">
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold leading-tight">
                            {item.title}
                          </h3>

                          {item.description ? (
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex items-baseline gap-2 pt-2">
                          <span className="text-2xl font-bold text-primary">
                            USD {Number(item.usdPrice ?? 0).toFixed(2)}
                          </span>

                          {item.arPrice != null ? (
                            <span className="text-xs text-muted-foreground">
                              · ARS {Number(item.arPrice).toLocaleString("es-AR")}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              · {item.isSubscription ? "mensual" : "pago único"}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() =>
                          addToCart({
                            id: String(item.id),
                            name: item.title,
                            price: Number(item.usdPrice ?? 0),
                            coverImageUrl: item.coverImageUrl || undefined,
                            quantity: 1,
                          })
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/15"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {isInCart(String(item.id))
                          ? "Agregar otro"
                          : "Agregar al carrito"}
                      </button>

                      <Link
                        href={`/recursos/${item.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                      >
                        Ver detalle
                        <ArrowRight className="h-4 w-4" />
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