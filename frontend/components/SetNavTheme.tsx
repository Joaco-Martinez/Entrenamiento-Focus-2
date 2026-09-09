"use client"

import { useNavTheme, type NavTheme } from "@/context/NavThemeContext"

/**
 * Marcador para declarar el tema de la barra desde un Server Component:
 * se renderiza como hijo y no pinta nada.
 */
export function SetNavTheme({ theme }: { theme: NavTheme }) {
  useNavTheme(theme)
  return null
}
