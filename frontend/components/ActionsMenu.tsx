"use client"

import { useEffect, useRef, useState } from "react"
import { MoreVertical } from "lucide-react"

export type ActionsMenuItem = {
  label: string
  onClick: () => void
  destructive?: boolean
}

export function ActionsMenu({ items }: { items: ActionsMenuItem[] }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  if (items.length === 0) return null

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Más acciones"
        aria-expanded={open}
        className="rounded-full p-1 text-[#6b6153] transition hover:bg-[#2a2620]/5 hover:text-[#2a2620]"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-xl border border-[#2a2620]/10 bg-[#faf6ee] shadow-lg"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                item.onClick()
              }}
              className={`block w-full px-4 py-2.5 text-left text-[13px] font-medium transition ${
                item.destructive
                  ? "text-red-700 hover:bg-red-700/10"
                  : "text-[#2a2620] hover:bg-[#2a2620]/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
