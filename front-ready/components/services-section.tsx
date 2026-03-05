"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sliders, Headphones, ArrowRight } from "lucide-react"
import Image from "next/image"

export function ServicesSection() {
  const handleWhatsApp = () => {
    const message =
      "Hola! Quiero consultar por el pack de servicios profesionales (Producción + Mezcla + Mastering)"
    const url = `https://wa.me/5491112345678?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 bg-background">
      <div className="container max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-10 sm:space-y-12"
        >
          {/* Title */}
          <div className="text-center space-y-4 sm:space-y-5 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">
              Sumanos a tu <span className="text-primary">equipo</span>
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground">
              ¿Necesitás grabar, producir, mezclar o masterizar tu música?
            </p>

            <div className="w-14 h-1 bg-primary mx-auto rounded-full" />
          </div>

          {/* Pack Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mx-auto w-full max-w-4xl"
          >
            <Card className="p-5 sm:p-6 md:p-8 bg-card/80 border-2 border-primary/30">
              <div className="space-y-7 sm:space-y-8">
                {/* Header pack */}
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Sliders className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold">Pack Focus</h3>
                  </div>

                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                    Tu visión primero.
Llevamos tu canción de 0 a 100% con enfoque personalizado y obsesión en los detalles.
                  </p>
                </div>

                {/* People */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {/* Fran */}
                  <div className="space-y-4">
                   <div className="w-full rounded-xl overflow-hidden border border-primary/10 bg-muted/50">
  <div className="relative h-56 sm:h-64 md:aspect-square md:h-auto">
    <Image
      src="https://res.cloudinary.com/deb7jg37j/image/upload/v1768012086/copy_DAF67B21-A6A5-47EE-A8BA-55D1D3DF116A_1_pqrwnw.jpg"
      alt="Franco Cano"
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      className="object-cover"
      priority={false}
    />
    {/* overlay suave para legibilidad */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/0 to-black/10" />

    {/* iconito arriba */}
    <div className="absolute top-4 left-4 w-12 h-12 bg-primary/20 backdrop-blur rounded-full flex items-center justify-center">
      <Sliders className="h-6 w-6 text-primary" />
    </div>
  </div>
</div>

                    <div className="text-center md:text-left space-y-1">
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <Sliders className="h-4 w-4 text-primary" />
                        <h4 className="text-base sm:text-lg font-semibold">
                          Franco Cano - Grabación y Producción
                        </h4>
                      </div>

                    </div>
                  </div>

                  {/* Matías */}
                  <div className="space-y-4">
                    <div className="w-full rounded-xl overflow-hidden border border-primary/10 bg-muted/50">
  <div className="relative h-56 sm:h-64 md:aspect-square md:h-auto">
    <Image
      src="https://res.cloudinary.com/deb7jg37j/image/upload/v1768012070/copy_971E12E2-0EFF-44CD-93B7-76A65719B7D0_w0aaii.jpg"
      alt="Matías Ledesma"
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      className="object-cover"
      priority={false}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/0 to-black/10" />

    <div className="absolute top-4 left-4 w-12 h-12 bg-primary/20 backdrop-blur rounded-full flex items-center justify-center">
      <Headphones className="h-6 w-6 text-primary" />
    </div>
  </div>
</div>

                    <div className="text-center md:text-left space-y-1">
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <Headphones className="h-4 w-4 text-primary" />
                        <h4 className="text-base sm:text-lg font-semibold">
                          Matías Ledesma - Mezcla y Mastering
                        </h4>
                      </div>


                    </div>
                  </div>
                </div>

                {/* CTA */}
               <div className="pt-1 flex justify-center">
  <Button
    size="lg"
    className="
      w-full sm:w-auto
      text-base
      px-10 py-5
      h-auto
      rounded-full
      bg-primary
      hover:bg-primary/90
      text-primary-foreground
      font-semibold
      tracking-wide
      shadow-md
      group
    "
    onClick={handleWhatsApp}
  >
    SABER MÁS, HAZ CLIC AQUÍ
    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
  </Button>
</div>
              </div>
            </Card>
          </motion.div>

          {/* Bottom note */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mx-auto w-full max-w-3xl"
          >
            <Card className="p-5 sm:p-6 bg-card/50 border-primary/20 text-center">
              <p className="text-base sm:text-lg text-foreground leading-relaxed">
                <span className="text-primary font-semibold">
                  Trabajamos con equipos digitales y analógicos de alta gama
                </span>
                , tu música merece destacar en la industria musical.
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
