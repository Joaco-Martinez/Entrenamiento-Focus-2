"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookOpen, Gift, ArrowRight } from "lucide-react"
import Image from "next/image"
export function EbookSection() {
  const handleWhatsApp = () => {
    const message = "Hola! Quiero comprar el ebook de producción, mezcla y mastering"
    const url = `https://wa.me/5491112345678?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  return (
    <section className="py-24 px-4 bg-muted/20">
      <div className="container max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          {/* Section title */}
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold text-balance">
              Ebook <span className="text-primary">exclusivo</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Guía completa con técnicas profesionales de producción, mezcla y mastering
            </p>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </div>

          {/* Ebook card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="p-8 md:p-12 bg-card border-2 border-primary/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-br-full" />

              <div className="relative grid md:grid-cols-[1fr,2fr] gap-8 items-center">
                {/* Book visual */}
<div className="flex justify-center ">
  <div className="relative">
    <div className="relative w-56 sm:w-64 md:w-72 aspect-[3/4] rounded-xl overflow-hidden border-2 border-primary/40 shadow-2xl shadow-primary/20 bg-muted/30">
      <Image
        src="https://res.cloudinary.com/deb7jg37j/image/upload/v1768012046/01_Ebook_-_Gadgets_-_Entrenamiento_Focus_d3rlid.jpg"
        alt="Ebook Entrenamiento Focus"
        fill
        sizes="(max-width: 640px) 224px, (max-width: 768px) 256px, 288px"
        className="object-contain p-2"
        priority
      />
    </div>

    {/* Badge bonus */}
    <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg ring-4 ring-background">
      <Gift className="h-8 w-8 text-primary-foreground" />
    </div>
  </div>
</div>

                {/* Content */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-2xl md:text-3xl font-bold">Guía completa de producción, mezcla y mastering</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Todo lo que necesitás saber sobre técnicas profesionales de producción, mezcla y mastering en un
                      solo lugar. Aprende a tu ritmo.
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">USD 10</span>
                    <span className="text-lg text-muted-foreground">Pago único</span>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                    <Gift className="h-5 w-5 text-primary mt-1 shrink-0" />
                    <p className="text-foreground">
                      <span className="font-semibold text-primary">¡Bonus especial!</span> Si entrás a la mentoría por
                      USD 15, el ebook te lo damos <span className="font-bold text-primary">GRATIS</span>
                    </p>
                  </div>

                  <Button
                    size="lg"
                    className="w-full md:w-auto text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold group"
                    onClick={handleWhatsApp}
                  >
                    Comprar ebook
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
