"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function UserGuard({ children }: { children: React.ReactNode }) {
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

    // admin → su panel
    if (isAdmin) {
      router.replace("/admin")
      return
    }
  }, [loading, isAuth, isAdmin, router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0b0b0c] text-white">
        <p className="text-white/70">Cargando...</p>
      </div>
    )
  }

  if (!isAuth || isAdmin) return null

  return <>{children}</>
}
