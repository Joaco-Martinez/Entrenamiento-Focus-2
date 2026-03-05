"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { isAuth, isAdmin, logout } = useAuth()

  const navItems = [
    { href: "/", label: "Inicio" },
    { href: "/servicios", label: "Servicios" },
    { href: "/recursos", label: "Recursos" },
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/10">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <button
            type="button"
            onClick={() => go("/")}
            className="text-xl font-bold text-foreground hover:text-primary transition-colors"
          >
            ENTRENAMIENTO <span className="text-primary">FOCUS</span>
          </button>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => go(item.href)}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {item.label}
              </button>
            ))}

            {/* AUTH BUTTONS DESKTOP */}
            {!isAuth ? (
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => go("/login")}>
                  Login
                </Button>
                <Button onClick={() => go("/register")}>
                  Register
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button onClick={() => go(dashboardHref)}>
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={handleLogout}>
                  Cerrar sesión
                </Button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
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

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => go(item.href)}
                    className="block w-full text-left text-foreground hover:text-primary transition-colors font-medium py-2"
                  >
                    {item.label}
                  </button>
                ))}

                {/* AUTH MOBILE */}
                {!isAuth ? (
                  <>
                    <button
                      onClick={() => go("/login")}
                      className="block w-full text-left py-2 font-medium"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => go("/register")}
                      className="block w-full text-left py-2 font-medium"
                    >
                      Register
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => go(dashboardHref)}
                      className="block w-full text-left py-2 font-medium"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left py-2 font-medium text-red-400"
                    >
                      Cerrar sesión
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
