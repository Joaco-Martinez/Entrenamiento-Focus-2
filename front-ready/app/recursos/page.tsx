"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Lock, Sparkles } from "lucide-react"
import { productsService, Product } from "@/services/products.service"

export default function RecursosPage() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      setError(null)
      setLoading(true)
      try {
        const res = await productsService.getAll(1, 60)
        setItems(res.data)
      } catch (e: any) {
        setError(e?.message || "No se pudieron cargar los recursos.")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  return (
    <section className="py-24 px-4 bg-muted/20">
      <div className="container max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          <div className="text-center space-y-5">
            <h1 className="text-4xl md:text-6xl font-bold text-balance">
              Recursos <span className="text-primary">Focus</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Elegí un recurso, mirá el detalle y compralo.
            </p>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[340px] rounded-2xl border border-primary/10 bg-card/40 animate-pulse" />
              ))
            ) : items.length === 0 ? (
              <p className="text-muted-foreground">Todavía no hay recursos cargados.</p>
            ) : (
              items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.35 }}
                >
                  <Link href={`/recursos/${item.id}`} className="block group">
                    <Card
                      className="relative overflow-hidden p-5 border-2 border-primary/15 bg-card cursor-pointer transition-all hover:border-primary/35 hover:shadow-2xl hover:-translate-y-0.5"
                    >
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />

                      <div className="absolute top-4 right-4 z-10 flex gap-2">
                        {item.requiresPremium ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold shadow-lg">
                            <Lock className="h-4 w-4" /> Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold border border-primary/20">
                            <Sparkles className="h-4 w-4" /> Libre
                          </span>
                        )}
                      </div>

                      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-primary/20 bg-muted/30">
                        <Image
                          src={item.coverImageUrl || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>

                      <div className="mt-5 space-y-3 relative">
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold leading-tight">{item.name}</h3>
                          {item.description ? (
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                          ) : null}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-primary">USD {Number(item.priceUsd).toFixed(2)}</span>
                            {item.priceArs != null ? (
                              <span className="text-xs text-muted-foreground">· ARS {Number(item.priceArs).toLocaleString("es-AR")}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">· {item.isSubscription ? "mensual" : "pago único"}</span>
                            )}
                          </div>

                          <Button variant="ghost" className="group/btn px-0 text-primary hover:bg-transparent">
                            Ver detalle
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
