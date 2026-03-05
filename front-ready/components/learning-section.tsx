"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Sliders, Headphones, Wand2, DollarSign, Users, Target, Star, MessageSquare, FileCheck } from "lucide-react"

const learningItems = [
  {
    icon: Sliders,
    title: "Producción musical avanzada",
    description:
      "Técnicas profesionales de composición, arreglos y sound design que realmente se usan en la industria.",
  },
  {
    icon: Headphones,
    title: "Mezcla profesional",
    description: "Equilibrio, ecualización, compresión y efectos. Aprende a mezclar como los grandes estudios.",
  },
  {
    icon: Wand2,
    title: "Mastering aplicable",
    description: "El toque final que hace que tu música suene competitiva en todas las plataformas.",
  },
  {
    icon: DollarSign,
    title: "Marketing para generar ingresos",
    description: "Estrategias reales para monetizar tu música y conseguir clientes como productor.",
  },
  {
    icon: Users,
    title: "Networking y contactos",
    description: "Cómo conectar con artistas, sellos y otros profesionales de la industria musical.",
  },
  {
    icon: Target,
    title: "Desarrollo profesional",
    description: "Hábitos, organización y mentalidad para trabajar como un profesional.",
  },
  {
    icon: Star,
    title: "Invitados especiales",
    description: "Productores, ingenieros y artistas exitosos compartiendo su experiencia.",
  },
  {
    icon: MessageSquare,
    title: "Soporte directo por WhatsApp",
    description: "Contacto directo con nosotros para resolver dudas entre clases.",
  },
  {
    icon: FileCheck,
    title: "Feedback sobre trabajos reales",
    description: "Revisión personalizada de tus producciones, mezclas y masters.",
  },
]

export function LearningSection() {
  return (
    <section id="learning" className="py-24 px-4 bg-background">
      <div className="container max-w-7xl mx-auto">
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
              En esta mentoría <span className="text-primary">aprenderás</span>
            </h2>
            <p className="text-xl md:text-2xl text-primary font-semibold">
              No aprendés lo que ya está en YouTube.
              <br />
              Aprendés lo que realmente se usa.
            </p>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </div>

          {/* Learning grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="p-6 h-full bg-card/50 border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Bottom accent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center pt-8"
          >
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Todo lo que necesitás para pasar de productor amateur a profesional que trabaja en la industria.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
