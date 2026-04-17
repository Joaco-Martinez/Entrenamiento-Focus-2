"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, ShoppingCart } from "lucide-react"
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
  className="group text-xl font-bold transition-colors"
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
                <Button variant="ghost" onClick={() => go("/login")}>Login</Button>
                <Button onClick={() => go("/register")}>Register</Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button onClick={() => go(dashboardHref)}>Mis Compras</Button>
                <Button variant="ghost" onClick={handleLogout}>Cerrar sesión</Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative rounded-full border border-white/10 bg-white/[0.03] p-2 text-white/80"
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                  {totalItems}
                </span>
              ) : null}
            </button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-primary/10 md:hidden"
            >
              <div className="space-y-4 px-4 py-4">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => go(item.href)}
                    className="block w-full py-2 text-left font-medium text-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </button>
                ))}

                {!isAuth ? (
                  <>
                    <button onClick={() => go("/login")} className="block w-full py-2 text-left font-medium">Login</button>
                    <button onClick={() => go("/register")} className="block w-full py-2 text-left font-medium">Register</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => go(dashboardHref)} className="block w-full py-2 text-left font-medium">Mis Compras</button>
                    <button onClick={handleLogout} className="block w-full py-2 text-left font-medium text-red-400">Cerrar sesión</button>
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
