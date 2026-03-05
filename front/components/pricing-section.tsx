"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, ArrowRight, AlertCircle } from "lucide-react"

const features = [
  "4 clases en vivo por mes",
  "Acceso a todas las grabaciones",
  "Soporte por WhatsApp",
  "Feedback personalizado",
  "Material exclusivo",
  "Comunidad privada",
  "Invitados especiales",
  "Sin permanencia mínima",
]

export function PricingSection() {
  const handleWhatsApp = () => {
    const message = "Hola! Quiero entrar a ENTRENAMIENTO FOCUS ahora"
    const url = `https://wa.me/5491112345678?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  return (
    <section className="py-24 px-4 bg-background">
      <div className="container max-w-5xl">
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
              Inversión en tu <span className="text-primary">carrera</span>
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </div>

          {/* Pricing card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="p-8 md:p-12 bg-card/80 border-2 border-primary/30 backdrop-blur-sm relative overflow-hidden">
              {/* Accent corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full" />

              <div className="relative space-y-8">
                {/* Price display */}
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/20 border border-destructive/40 rounded-full mb-4">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-semibold text-destructive">🚨 Últimos lugares disponibles 🚨</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl md:text-7xl font-bold text-primary">AR$ 19.500</span>
                      <span className="text-2xl text-muted-foreground">/mes</span>
                    </div>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-3xl md:text-5xl font-bold text-primary/80">USD 15</span>
                      <span className="text-xl text-muted-foreground">/mes</span>
                    </div>
                  </div>

                  <p className="text-lg text-muted-foreground">Suscripción mensual • Cancelable cuando quieras</p>
                </div>

                {/* Features list */}
                <div className="grid sm:grid-cols-2 gap-4 py-8">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="text-center pt-4">
                  <Button
                    size="lg"
                    className="text-xl px-12 py-8 h-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold group shadow-lg shadow-primary/20"
                    onClick={handleWhatsApp}
                  >
                    Quiero entrar ahora
                    <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">Te responderemos en minutos por WhatsApp</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
