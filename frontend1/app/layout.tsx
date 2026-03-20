import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { AuthProvider } from "@/context/AuthContext"
import { CartProvider } from "@/context/CartContext"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ENTRENAMIENTO FOCUS - Mentoría de Producción Musical Profesional",
  description:
    "Mentoría privada para productores musicales que quieren destacar en la industria real. Producción, mezcla y mastering a nivel profesional.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            {children}
            <Analytics />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
