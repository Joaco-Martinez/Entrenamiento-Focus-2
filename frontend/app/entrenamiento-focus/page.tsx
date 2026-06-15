import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { LearningSection } from "@/components/learning-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { FinalCTASection } from "@/components/final-cta-section"
import  MouseGlowBackground  from "@/components/mouse-glow-background"
import EntrenamientoFocusPage from "../mentoria/EntrenamientoFocusPage"
export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden  text-white">

      {/* Fondo interactivo */}<div className="mt-16">

      <EntrenamientoFocusPage />
      </div>
    </main>
  )
}