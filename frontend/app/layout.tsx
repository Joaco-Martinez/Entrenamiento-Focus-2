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

export const metadata: Metadata = {
  title: "ENTRENAMIENTO FOCUS - Mentoría de Producción Musical Profesional",
  description:
    "Mentoría privada para productores musicales que quieren destacar en la industria real. Producción, mezcla y mastering a nivel profesional.",

  // 👇 LOGO (favicon + google)
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  // 👇 TU FIRMA (opcional pero pro)
  creator: "Joaquín Martinez",
  authors: [{ name: "Joaquín Martinez" }],

  // 👇 REDES / WHATSAPP / LINK PREVIEW
  openGraph: {
    title: "ENTRENAMIENTO FOCUS",
    description:
      "Mentoría privada para productores musicales que quieren destacar en la industria real.",
    url: "www.entrenamientofocus.com.ar", // ⚠️ CAMBIAR
    siteName: "Focus",
    images: [
      {
        url: "/logo.png", // ideal después cambiar por og-image
        width: 1200,
        height: 630,
      },
    ],
    locale: "es_AR",
    type: "website",
  },

  // 👇 TWITTER (por si pinta)
  twitter: {
    card: "summary_large_image",
    title: "ENTRENAMIENTO FOCUS",
    description:
      "Mentoría privada para productores musicales.",
    images: ["/logo.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <AuthProvider>
          <CartProvider>
             {/* <MaintenanceGate> */}
            <Navbar />
            {children}
            <Analytics />
             {/* </MaintenanceGate> */}
             <WhatsAppButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}