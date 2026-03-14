"use client"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"



export function AboutSection() {
const Router = useRouter()

  return (
    <section className="py-24 px-4 bg-muted/20 flex items-center justify-center overflow-hidden">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-16"
        >
          {/* Section title */}
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-balance">
               Lo que no encontrás en <span className="text-primary">mil tutoriales</span>,
              <br />
               lo aprendés con <span className="text-primary">2 mentores. En Vivo</span>
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Texto */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="space-y-6"
            >
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Somos{" "}
                <span className="text-foreground font-semibold">
                  Franco Cano y Matias Ledesma
                </span>
                , productores y técnicos de mezcla y mastering con años de experiencia en proyectos reales.
              </p>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                No vendemos promesas imposibles. Te enseñamos lo que realmente nos permite vivir de la profesión, y lo que usamos todos los días en el trabajo: desde la producción hasta el mastering final.
              </p>
              <p className="text-lg md:text-xl text-foreground font-medium">
                Traemos invitados especiales para sumar puntos de vista nuevos y profundizar temas puntuales.
              </p>
            </motion.div>

            {/* Video */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <Card className="bg-card/50 border-primary/20 p-4 sm:p-6 md:p-8 backdrop-blur-sm">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-primary/10">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/KVo3fP_bkNY"
                    title="Video de proyectos y trabajos reales"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>


              </Card>
            </motion.div>
          </div>

          {/* Botones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Button
              size="lg"
              className="text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold group"
              onClick={() => {
                Router.push("/mentoria")
              }}
            >
              Quiero entrar
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
