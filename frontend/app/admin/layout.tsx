import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#060606] text-white">
        {/* background glow */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-180px] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-[140px]" />
          <div className="absolute right-[-160px] top-[30%] h-[360px] w-[360px] rounded-full bg-yellow-400/5 blur-[130px]" />
          <div className="absolute bottom-[-140px] left-[-120px] h-[320px] w-[320px] rounded-full bg-white/[0.04] blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_35%)]" />
        </div>

        <div className="relative z-10 lg:flex">
          <AdminSidebar />

          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 border-b border-white/10 bg-black/35 backdrop-blur-2xl">
              <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/40">
                    <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                    <span>Administración</span>
                  </div>

                  <h1 className="mt-1 truncate text-base font-semibold text-white sm:text-lg">
                    Panel de control{" "}
                    <span className="text-yellow-400">Focus</span>
                  </h1>

                  <p className="mt-1 hidden text-sm text-white/55 sm:block">
                    Gestión de productos, órdenes y suscripciones.
                  </p>
                </div>

                <Link
                  href="/"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/[0.07] hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver al sitio
                </Link>
              </div>
            </header>

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}