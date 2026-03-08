"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import { motion } from "framer-motion"

export function HeroSection() {
  const handleWhatsApp = (message: string) => {
    const url = `https://wa.me/5491112345678?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20 pointer-events-none" />

      <div className="container max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          {/* Small badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 border border-primary/20 rounded-full text-sm text-muted-foreground"
          >
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span>Mentoría privada</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance"
          >
               Aprendé de 2 mentores todo lo que <span className="text-primary">no encontrás en YouTube</span>
            <br />
            y sin vueltas
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed"
          >
            Para productores e ingenieros de mezcla y mastering que buscan contenido avanzado.
          </motion.p>

          {/* Reinforcement text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg text-foreground/80 max-w-2xl mx-auto"
          >
            Experiencia aplicada en proyectos reales de distintos géneros musicales actuales.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
          >
            <Button
              size="lg"
              className="text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold group"
              onClick={() => handleWhatsApp("Hola! Quiero sumarme a la mentoría ENTRENAMIENTO FOCUS")}
            >
              Quiero entrar
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 h-auto border-2 border-primary/30 hover:bg-primary/10 hover:border-primary group bg-transparent"
              onClick={() => {
                document.getElementById("learning")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              <Play className="mr-2 h-5 w-5" />
              Ver qué voy a aprender
            </Button>
          </motion.div>

          {/* Accent line */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="w-24 h-1 bg-primary mx-auto mt-12 rounded-full"
          />
        </motion.div>
      </div>
    </section>
  )
}
