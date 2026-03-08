import AdminGuard from "@/components/admin/AdminGuard"
import AdminSidebar from "@/components/admin/AdminSidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#0B0B0B] text-white">
        {/* glow */}
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-[120px]" />
          <div className="absolute bottom-[-120px] right-[-120px] h-[420px] w-[420px] rounded-full bg-yellow-400/5 blur-[120px]" />
        </div>

        <div className="relative z-10 grid min-h-screen md:grid-cols-[280px_1fr]">
          <div className="hidden md:block">
            <AdminSidebar />
          </div>

          <div className="flex min-h-screen flex-col">
            {/* header */}
            <header className="border-b border-white/5 bg-black/30 backdrop-blur">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
                <div>
                  <p className="text-sm font-bold">
                    Panel <span className="text-yellow-400">Admin</span>
                  </p>
                  <p className="text-xs text-white/55">Gestión de productos, órdenes y suscripciones</p>
                </div>

                <a
                  href="/"
                  className="text-sm text-white/70 underline decoration-yellow-400/70 underline-offset-4 hover:text-white"
                >
                  Volver al sitio
                </a>
              </div>
            </header>

            {/* content */}
            <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
