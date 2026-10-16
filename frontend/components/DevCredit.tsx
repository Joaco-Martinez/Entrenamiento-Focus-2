"use client"

import { usePathname } from "next/navigation"

export default function DevCredit() {
  const pathname = usePathname()

  // El panel de admin tiene su propio layout; el crédito va solo en el sitio público.
  if (pathname?.startsWith("/admin")) return null

  return (
    <div className="w-full border-t border-white/5 bg-[#111110] px-6 py-4 text-center">
      <p className="text-[11px] tracking-[0.08em] text-white/40">
        Desarrollado por{" "}
        <a
          href="https://www.joacodev.com.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#c8a84b]/80 transition hover:text-[#c8a84b]"
        >
          www.joacodev.com.ar
        </a>
      </p>
    </div>
  )
}
