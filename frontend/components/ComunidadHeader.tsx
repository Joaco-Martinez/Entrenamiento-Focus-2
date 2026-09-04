import Link from "next/link"

const TABS = [
  { key: "articulos", href: "/articulos", label: "Artículos Focus" },
  { key: "foro", href: "/foro", label: "Participá del foro" },
] as const

export function ComunidadHeader({ active }: { active: "articulos" | "foro" }) {
  return (
    <div className="space-y-6 text-center">
      <h1 className="text-balance text-4xl font-black tracking-tight md:text-5xl">
        Comunidad <span className="text-[#a67c27]">Focus</span>
      </h1>

      <div className="inline-flex items-center gap-1 rounded-full border border-[#a67c27]/25 bg-[#faf6ee] p-1">
        {TABS.map((tab) => {
          const isActive = tab.key === active

          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={
                isActive
                  ? "rounded-full bg-[#a67c27] px-5 py-2 text-sm font-semibold text-[#2a2620] transition"
                  : "rounded-full px-5 py-2 text-sm font-medium text-[#6b6153] transition hover:text-[#2a2620]"
              }
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
