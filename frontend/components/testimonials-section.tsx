"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "",
    text: "La data que dan en entrenamiento focus no la encontré en ningún lado. Me ordenó la cabeza y me ahorró meses de prueba y error. Gracias!",
    rating: 5,
  },
  {
    name: "",
    text: "Aprendí a crear nuevas redes de contactos! Antes no sabía que existía esta información, unos cracks ",
    rating: 5,
  },
  {
    name: "",
    text: "Pude avanzar muchísimo en poco tiempo y mejorar un montón mis hábitos, muy contenta",
    rating: 5,
  },
  {
    name: "",
    text: " Empecé a tener mis primeros ingresos gracias a ustedes, ahora si estoy en el camino",
    rating: 5,
  },
  {
    name: "",
    text: "Me siento muy acompañado cada vez que tengo dudas, me ahorraron mucho tiempo y errores!! Son lo más!",
    rating: 5,
  },
  {
    name: "",
    text: "Todo lo que aportan dentro de la mentoría no tiene comparación con el precio, les agradezco un montón!!",
    rating: 5,
  },
  {
    name: "",
    text: "La organización , los atajos en mi caso Ableton me hicieron obtener más rapidez, y los gadgets de max4live no tenia idea y me simplificaron mucho",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 bg-muted/20">
      <div className="container max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-16"
        >
          {/* Section title */}
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold text-balance">
              Lo que dicen nuestros <span className="text-primary">alumnos</span>
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </div>

          {/* Testimonials grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="p-6 h-full bg-card border-primary/20 hover:border-primary/40 transition-all duration-300">
                  <div className="space-y-4">
                    {/* Stars */}
                    <div className="flex gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>

                    {/* Testimonial text */}
                    <p className="text-foreground leading-relaxed">"{testimonial.text}"</p>

                    {/* Name */}
                    {/* <p className="text-sm font-semibold text-primary">— {testimonial.name}</p> */}
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
