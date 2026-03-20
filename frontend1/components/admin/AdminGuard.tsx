"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { loading, isAuth, isAdmin } = useAuth()

  useEffect(() => {
    if (loading) return

    // no logueado → login con redirect
    if (!isAuth) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    // logueado pero no admin → fuera
    if (!isAdmin) {
      router.replace("/")
      return
    }
  }, [loading, isAuth, isAdmin, router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] grid place-items-center text-white">
        <p className="text-white/70">Cargando...</p>
      </div>
    )
  }

  // mientras redirige, no mostramos nada
  if (!isAuth || !isAdmin) return null

  return <>{children}</>
}
