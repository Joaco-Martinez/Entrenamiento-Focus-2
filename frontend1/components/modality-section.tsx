"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, Video, Database, CreditCard, X } from "lucide-react"

const modalityItems = [
  {
    icon: Calendar,
    title: "4 clases al mes",
    description: "Una clase por semana en vivo por Zoom",
  },
  {
    icon: Clock,
    title: "Lunes 20:00 hs",
    description: "Horario Argentina (GMT-3)",
  },
  {
    icon: Video,
    title: "Clases grabadas",
    description: "Acceso ilimitado a todas las grabaciones",
  },
  {
    icon: Database,
    title: "Plataforma privada",
    description: "Contenido exclusivo y material adicional",
  },
  {
    icon: CreditCard,
    title: "Suscripción mensual",
    description: "Pago mes a mes, sin compromisos largos",
  },
  {
    icon: X,
    title: "Cancelable cuando quieras",
    description: "Sin permanencia mínima ni penalizaciones",
  },
]

export function ModalitySection() {
  return (
    <section className="py-24 px-4 bg-muted/20">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-16"
        >
          {/* Section title */}
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-balance">
              Modalidad de la <span className="text-primary">mentoría</span>
            </h2>
            <p className="text-xl text-muted-foreground">Simple, flexible y profesional</p>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </div>

          {/* Modality grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modalityItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="p-6 h-full bg-card border-primary/20 hover:border-primary/40 transition-all duration-300">
                  <div className="space-y-4 text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
