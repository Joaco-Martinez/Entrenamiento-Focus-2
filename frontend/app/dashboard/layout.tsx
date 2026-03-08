import UserGuard from "@/components/user/UserGuard"
import Link from "next/link"

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserGuard>
      <div className="min-h-screen bg-[#0b0b0c] text-white">
        <header className="border-b border-white/10 bg-black/40 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <div>
              <p className="text-sm font-bold">
                Dashboard <span className="text-primary">Focus</span>
              </p>
              <p className="text-xs text-white/60">Tu cuenta, compras y Premium</p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/recursos"
                className="text-sm text-white/70 underline decoration-primary/70 underline-offset-4 hover:text-white"
              >
                Ver recursos
              </Link>
              <Link
                href="/"
                className="text-sm text-white/70 underline decoration-white/30 underline-offset-4 hover:text-white"
              >
                Inicio
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
      </div>
    </UserGuard>
  )
}
