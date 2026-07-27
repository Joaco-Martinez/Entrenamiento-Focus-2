"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import { CartDrawer } from "@/components/cart/Cart"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const router = useRouter()
  const { isAuth, isAdmin, logout } = useAuth()
  const { totalItems } = useCart()

  const navItems = [
    { href: "/", label: "Inicio" },
    { href: "/entrenamiento-focus", label: "Mentoria" },
    { href: "/servicios", label: "Servicios" },
    { href: "/recursos", label: "Productos" },
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

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-primary/10 bg-background/85 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <button
            type="button"
            onClick={() => go("/")}
            className="group text-xl font-bold tracking-tight transition-colors"
          >
            <span className="text-foreground transition-colors group-hover:text-primary">
              ENTRENAMIENTO
            </span>{" "}
            <span className="text-primary transition-colors group-hover:text-white">
              FOCUS
            </span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => go(item.href)}
                className="font-medium text-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative rounded-full border border-white/10 bg-white/[0.03] p-2 text-white/80 transition hover:bg-white/[0.08] hover:text-white"
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
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => go("/login")}>
                  Login
                </Button>

                <Button onClick={() => go("/register")}>Register</Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button onClick={() => go(dashboardHref)}>Mis Compras</Button>

                <Button variant="ghost" onClick={handleLogout}>
                  Cerrar sesión
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/80 transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-95"
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
              className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/80 transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-95"
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
                      Mis Compras
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