import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import WhatsAppButton from "@/components/WhatsAppButton"
import { Navbar } from "@/components/navbar"
import { AuthProvider } from "@/context/AuthContext"
import { CartProvider } from "@/context/CartContext"
import MaintenanceGate from "@/components/MaintenanceGate"
import Footer from "@/components/footer"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true"

export const metadata: Metadata = {
  title: "ENTRENAMIENTO FOCUS - Mentoría de Producción Musical Profesional",
  description:
    "Mentoría privada para productores musicales que quieren destacar en la industria real. Producción, mezcla y mastering a nivel profesional.",

  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  creator: "Joaquín Martinez",
  authors: [{ name: "Joaquín Martinez" }],

  openGraph: {
    title: "ENTRENAMIENTO FOCUS",
    description:
      "Mentoría privada para productores musicales que quieren destacar en la industria real.",
    url: "https://www.entrenamientofocus.com.ar",
    siteName: "Focus",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "es_AR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "ENTRENAMIENTO FOCUS",
    description: "Mentoría privada para productores musicales.",
    images: ["/logo.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const appContent = (
    <>
      <Navbar />
      {children}
      <Analytics />
      <WhatsAppButton />
    </>
  )

  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            {isMaintenanceMode ? (
              <MaintenanceGate>{appContent}</MaintenanceGate>
            ) : (
              appContent
            )}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
