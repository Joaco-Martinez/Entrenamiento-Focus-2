"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Gift, Sparkles, Package } from "lucide-react"
import { RECURSOS } from "@/lib/ebooks"

function BadgeIcon({ badge }: { badge?: "Bonus" | "Nuevo" | "Pack" }) {
  if (badge === "Bonus") return <Gift className="h-4 w-4" />
  if (badge === "Nuevo") return <Sparkles className="h-4 w-4" />
  if (badge === "Pack") return <Package className="h-4 w-4" />
  return null
}

export default function EbooksPage() {
  return (
    <section className="py-24 px-4 bg-muted/20">
      <div className="container max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="text-center space-y-5">
            <h1 className="text-4xl md:text-6xl font-bold text-balance">
             Recursos <span className="text-primary">Focus</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Elegí el recurso, mirá el detalle y compralo en 1 click.
            </p>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </div>

          {/* Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {RECURSOS.map((item, idx) => (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.4 }}
              >
                <Link href={`/recursos/${item.slug}`} className="block group">
                  <Card
                    className="
                      relative overflow-hidden p-5 border-2 border-primary/15 bg-card
                      cursor-pointer
                      transition-all
                      hover:border-primary/35
                      hover:shadow-2xl
                      hover:-translate-y-0.5
                    "
                  >
                    {/* hover overlay */}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />

                    {/* Badge */}
                    {item.badge && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold shadow-lg">
                          <BadgeIcon badge={item.badge} />
                          {item.badge}
                        </div>
                      </div>
                    )}

                    {/* Cover */}
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-primary/20 bg-muted/30">
                      <Image
                        src={item.coverUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="mt-5 space-y-3 relative">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold leading-tight">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.descriptionShort}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-primary">USD {item.priceUsd}</span>
                          <span className="text-xs text-muted-foreground">pago único</span>
                        </div>

                        <Button
                          variant="ghost"
                          className="group/btn px-0 text-primary hover:bg-transparent"
                        >
                          Ver detalle
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
