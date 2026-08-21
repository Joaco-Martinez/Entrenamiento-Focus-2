"use client"

import { useEffect, useState } from "react"

export default function MaintenanceGate({
  children,
}: {
  children: React.ReactNode
}) {
  const [canView, setCanView] = useState<boolean | null>(null)

  useEffect(() => {
    const flag = localStorage.getItem("verPaginaYes")
    setCanView(flag === "true")
  }, [])

  // ⏳ mientras carga
  if (canView === null) {
    return null
  }

  // ✅ SI tiene permiso → muestra web
  if (canView) {
    return <>{children}</>
  }

  // 🚧 mantenimiento
  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-black text-white">
      <div className="text-center max-w-xl">
        <img
          src="/logo.png"
          alt="Focus"
          className="mx-auto mb-6 w-20 opacity-90"
        />

        <h1 className="text-3xl md:text-4xl font-semibold mb-4">
          Estamos en mantenimiento
        </h1>

        <p className="text-gray-400 mb-4">
          Estamos mejorando la plataforma para darte una experiencia mucho más profesional.
        </p>

        <p className="text-gray-400 mb-6">
          Se levantará una vez regularizado el servicio.
        </p>

        <a
          href="https://wa.link/z356e3"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-full bg-[#D4AF37] px-6 py-3 text-black font-medium hover:opacity-90 transition"
        >
          Contactar por WhatsApp
        </a>

        <p className="text-xs text-gray-500 mt-8">
          © {new Date().getFullYear()} Entrenamiento Focus
        </p>
      </div>
    </div>
  )
}
