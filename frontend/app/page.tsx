import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { LearningSection } from "@/components/learning-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { FinalCTASection } from "@/components/final-cta-section"
import  MouseGlowBackground  from "@/components/mouse-glow-background"

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden  text-white">

      {/* Fondo interactivo */}
      <MouseGlowBackground />

      {/* Contenido */}
      <div className="relative z-10 pt-16">
        {/* <HeroSection /> */}
        <AboutSection />
        {/* <LearningSection /> */}
        <TestimonialsSection />
        {/* <FinalCTASection /> */}
      </div>

    </main>
  )
}