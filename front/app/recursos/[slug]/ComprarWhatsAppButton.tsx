"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function ComprarWhatsAppButton({
  message,
  label = "Plantilla de ingresos",
}: {
  message: string
  label?: string
}) {
  const handleWhatsApp = () => {
    const url = `https://wa.me/5491112345678?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  return (
<Button
  size="lg"
  onClick={handleWhatsApp}
  className="
    h-auto
    px-8 py-6
    text-base md:text-lg
    font-semibold
    rounded-full
    bg-[#1a1b1f]
    text-white
    hover:bg-[#23242a]
    border border-white/10
    transition
  "
>
  {label}
</Button>
  )
}
