"use client"

import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from "react"

export type NavTheme = "light" | "dark"

type NavThemeContextValue = {
  theme: NavTheme
  setTheme: (theme: NavTheme) => void
}

const NavThemeContext = createContext<NavThemeContextValue | null>(null)

export function NavThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<NavTheme>("dark")

  return (
    <NavThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </NavThemeContext.Provider>
  )
}

function useNavThemeContext() {
  const ctx = useContext(NavThemeContext)
  if (!ctx) {
    throw new Error("useNavThemeContext debe usarse dentro de NavThemeProvider")
  }
  return ctx
}

/** Lee el tema actual de la barra de navegación. Lo usa el propio Navbar. */
export function useNavThemeValue() {
  return useNavThemeContext().theme
}

/**
 * Declara el tema que necesita la barra mientras esta página está montada.
 * Cada página con fondo claro debe llamarlo una vez con "light"; al
 * desmontarse vuelve a "dark" (el default para el resto del sitio).
 */
export function useNavTheme(theme: NavTheme) {
  const { setTheme } = useNavThemeContext()

  useLayoutEffect(() => {
    setTheme(theme)
    return () => setTheme("dark")
  }, [theme, setTheme])
}
