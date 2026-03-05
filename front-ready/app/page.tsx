import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { LearningSection } from "@/components/learning-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { FinalCTASection } from "@/components/final-cta-section"

export default function Page() {
  return (
    <main className="min-h-screen">
      <div className="pt-16">
        {/* <HeroSection /> */}
        <AboutSection />
        {/* <LearningSection /> */}
        <TestimonialsSection />
        {/* <FinalCTASection /> */}
      </div>
    </main>
  )
}
