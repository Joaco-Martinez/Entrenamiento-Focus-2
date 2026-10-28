"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// En mantenimiento el panel y el login siguen abiertos: desde ahí se paga el servicio web
const ALWAYS_OPEN = ["/admin", "/login", "/forgot-password"]

export default function MaintenanceGate({
  children,
  suspended = false,
}: {
  children: React.ReactNode
  // true = por falta de pago del servicio web (no por MAINTENANCE_MODE)
  suspended?: boolean
}) {
  const pathname = usePathname()
  const open = ALWAYS_OPEN.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  const [canView, setCanView] = useState<boolean | null>(null)

  useEffect(() => {
    const flag = localStorage.getItem("verPaginaYes")
    setCanView(flag === "true")
  }, [])

  if (open) return <>{children}</>

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

        {suspended && (
          <p className="text-sm text-gray-400 mt-8">
            ¿Sos el responsable del sitio?{" "}
            <Link
              href="/login?redirect=/admin/servicio-web"
              className="font-medium text-[#D4AF37] underline underline-offset-4"
            >
              Ingresá al panel para regularizar el pago
            </Link>
          </p>
        )}

        <p className="text-xs text-gray-500 mt-8">
          © {new Date().getFullYear()} Entrenamiento Focus
        </p>
      </div>
    </div>
  )
}
