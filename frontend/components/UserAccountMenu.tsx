"use client"

import { useEffect, useRef, useState } from "react"
import { UserAvatar } from "@/components/UserAvatar"

/**
 * Menú desplegable del avatar en el navbar. Sin dependencias nuevas: sigue
 * el mismo patrón liviano de ActionsMenu (popover propio con cierre por
 * click afuera), sumando cierre por Escape y un header de cuenta.
 */
export function UserAccountMenu({
  name,
  email,
  avatarUrl,
  onViewProfile,
  onLogout,
}: {
  name: string | null
  email: string
  avatarUrl?: string | null
  onViewProfile: () => void
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  const avatarName = name || email

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Cuenta"
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-full transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <UserAvatar name={avatarName} avatarUrl={avatarUrl} size={36} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            {name && <p className="truncate text-sm font-medium">{name}</p>}
            <p className="truncate text-xs text-popover-foreground/55">{email}</p>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onViewProfile()
            }}
            className="block w-full px-4 py-2.5 text-left text-sm font-medium transition hover:bg-white/[0.04]"
          >
            Ver perfil
          </button>

          <div className="border-t border-border" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
            className="block w-full px-4 py-2.5 text-left text-sm font-medium text-red-400/80 transition hover:bg-red-500/10 hover:text-red-400"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
