"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import { CartDrawer } from "@/components/cart/Cart"
import { UserAvatar } from "@/components/UserAvatar"
import { UserAccountMenu } from "@/components/UserAccountMenu"
import { useNavThemeValue } from "@/context/NavThemeContext"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const router = useRouter()
  const theme = useNavThemeValue()
  const isLight = theme === "light"
  const { isAuth, isAdmin, logout, user, fullName } = useAuth()
  const { totalItems } = useCart()

  // Colores de la barra según el fondo de cada página (declarado con useNavTheme).
  const text = isLight ? "text-[#2a2620]" : "text-foreground"
  const textMuted = isLight ? "text-[#2a2620]/75" : "text-white/80"
  const accent = isLight ? "text-[#a67c27]" : "text-primary"
  const hoverAccent = isLight ? "hover:text-[#a67c27]" : "hover:text-primary"
  const hoverInvert = isLight ? "group-hover:text-[#2a2620]" : "group-hover:text-white"
  const iconBorder = isLight ? "border-[#2a2620]/15" : "border-white/10"
  const iconBg = isLight ? "bg-[#2a2620]/[0.04]" : "bg-white/[0.03]"
  const iconBgHover = isLight ? "hover:bg-[#2a2620]/[0.08]" : "hover:bg-white/[0.08]"
  const iconHoverText = isLight ? "hover:text-[#2a2620]" : "hover:text-white"

  const accountName = fullName || user?.email || "Usuario"

  const navItems = [
    { href: "/", label: "Inicio" },
    { href: "/articulos", label: "Artículos" },
    { href: "/servicios", label: "Servicios" },
    { href: "/recursos", label: "Productos" },
    { href: "/clases", label: "Clases" },
  ]

  const go = (href: string) => {
    setIsOpen(false)
    router.push(href)
  }

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    router.push("/")
  }

  const dashboardHref = isAdmin ? "/admin" : "/dashboard"
  const dashboardLabel = isAdmin ? "Panel admin" : "Mis Compras"

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 bg-transparent">
        <div className="flex h-16 w-full items-center justify-between px-6 sm:px-10 lg:px-16">
          <button
            type="button"
            onClick={() => go("/")}
            className="group -ml-1 text-xl font-bold tracking-tight transition-colors"
          >
            <span className={cn(text, "transition-colors", hoverAccent)}>
              ENTRENAMIENTO
            </span>{" "}
            <span className={cn(accent, "transition-colors", hoverInvert)}>
              FOCUS
            </span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => go(item.href)}
                className={cn("font-medium transition-colors", text, hoverAccent)}
              >
                {item.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className={cn(
                "relative rounded-full border p-2 transition",
                iconBorder,
                iconBg,
                textMuted,
                iconBgHover,
                iconHoverText
              )}
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="h-5 w-5" />

              {totalItems > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                  {totalItems}
                </span>
              ) : null}
            </button>

            {!isAuth ? (
              <div className={cn("flex items-center gap-3", text)}>
                <Button variant="ghost" onClick={() => go("/login")}>
                  Login
                </Button>

                <Button onClick={() => go("/register")}>Register</Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button onClick={() => go(dashboardHref)}>{dashboardLabel}</Button>

                <UserAccountMenu
                  name={fullName}
                  email={user?.email ?? ""}
                  avatarUrl={user?.avatarUrl}
                  onViewProfile={() => go("/mi-cuenta")}
                  onLogout={handleLogout}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full border transition active:scale-95",
                iconBorder,
                iconBg,
                textMuted,
                "hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              )}
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="h-5 w-5" />

              {totalItems > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                  {totalItems}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => setIsOpen((v) => !v)}
              aria-label="Toggle menu"
              className={cn(
                "group relative flex h-10 w-10 items-center justify-center rounded-full border transition active:scale-95",
                iconBorder,
                iconBg,
                textMuted,
                "hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              )}
            >
              <span className="relative flex h-5 w-5 flex-col items-center justify-center gap-[5px]">
                <span
                  className={`h-[2px] rounded-full bg-current transition-all duration-300 ${
                    isOpen ? "w-5 translate-y-[7px] rotate-45" : "w-5"
                  }`}
                />

                <span
                  className={`h-[2px] rounded-full bg-current transition-all duration-300 ${
                    isOpen ? "w-0 opacity-0" : "w-4"
                  }`}
                />

                <span
                  className={`h-[2px] rounded-full bg-current transition-all duration-300 ${
                    isOpen ? "w-5 -translate-y-[7px] -rotate-45" : "w-5"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-primary/10 bg-background/95 backdrop-blur-md md:hidden"
            >
              <div className="space-y-2 px-4 py-4">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => go(item.href)}
                    className="block w-full rounded-xl px-3 py-3 text-left font-medium text-foreground transition-colors hover:bg-white/[0.04] hover:text-primary"
                  >
                    {item.label}
                  </button>
                ))}

                <div className="my-3 h-px bg-white/10" />

                {!isAuth ? (
                  <>
                    <button
                      type="button"
                      onClick={() => go("/login")}
                      className="block w-full rounded-xl px-3 py-3 text-left font-medium text-foreground transition-colors hover:bg-white/[0.04] hover:text-primary"
                    >
                      Login
                    </button>

                    <button
                      type="button"
                      onClick={() => go("/register")}
                      className="block w-full rounded-xl bg-primary px-3 py-3 text-left font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      Register
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => go(dashboardHref)}
                      className="block w-full rounded-xl bg-primary px-3 py-3 text-left font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      {dashboardLabel}
                    </button>

                    <div className="mt-2 flex items-center gap-3 rounded-xl border-t border-white/10 px-3 pb-1 pt-4">
                      <UserAvatar name={accountName} avatarUrl={user?.avatarUrl} size={36} />
                      <div className="min-w-0">
                        {fullName && (
                          <p className="truncate text-sm font-medium text-foreground">{fullName}</p>
                        )}
                        <p className="truncate text-xs text-white/50">{user?.email}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => go("/mi-cuenta")}
                      className="block w-full rounded-xl px-3 py-3 text-left font-medium text-foreground transition-colors hover:bg-white/[0.04] hover:text-primary"
                    >
                      Ver perfil
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full rounded-xl px-3 py-3 text-left font-medium text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      Cerrar sesión
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}