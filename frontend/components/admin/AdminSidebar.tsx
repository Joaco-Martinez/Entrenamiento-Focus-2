"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Newspaper,
} from "lucide-react";

const links = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Productos", href: "/admin/products", icon: Package },
  { label: "Artículos", href: "/admin/articles", icon: Newspaper },
  { label: "Órdenes", href: "/admin/orders", icon: ShoppingCart },
  { label: "Suscripciones", href: "/admin/subscriptions", icon: CreditCard },
];

function SidebarInner({
  pathname,
  fullName,
  email,
  onLogout,
  onNavigate,
}: {
  pathname: string;
  fullName?: string | null;
  email?: string | null;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.08),transparent_30%),linear-gradient(180deg,#0B0B0B_0%,#050505_100%)] text-white">
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10 shadow-[0_0_30px_rgba(250,204,21,0.12)]">
            <ShieldCheck className="h-5 w-5 text-yellow-300" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/40">
              Panel Admin
            </p>
            <h2 className="truncate text-sm font-semibold text-white">
              ENTRENAMIENTO <span className="text-yellow-400">FOCUS</span>
            </h2>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/25 to-yellow-300/10 text-sm font-bold text-yellow-200 ring-1 ring-yellow-400/20">
              {fullName?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                Administrador
              </p>
              <p className="truncate text-sm font-semibold text-white">
                {fullName || "Usuario"}
              </p>
              <p className="truncate text-xs text-white/50">
                {email || "Sin email"}
              </p>
            </div>
          </div>

          <div className="mt-4 h-px w-full bg-gradient-to-r from-yellow-400/70 via-yellow-400/10 to-transparent" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <nav className="space-y-2">
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={[
                  "group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3.5 transition-all duration-200",
                  active
                    ? "border-yellow-400/30 bg-gradient-to-r from-yellow-400/14 via-yellow-400/8 to-transparent text-white shadow-[0_8px_30px_rgba(250,204,21,0.10)]"
                    : "border-white/8 bg-white/[0.03] text-white/70 hover:border-white/15 hover:bg-white/[0.06] hover:text-white",
                ].join(" ")}
              >
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-yellow-400" />
                )}

                <div
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-xl transition",
                    active
                      ? "bg-yellow-400/15 text-yellow-300 ring-1 ring-yellow-400/20"
                      : "bg-white/[0.04] text-white/60 group-hover:bg-white/[0.07] group-hover:text-white",
                  ].join(" ")}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>

                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium">
                    {link.label}
                  </span>

                  <ChevronRight
                    className={[
                      "h-4 w-4 shrink-0 transition",
                      active
                        ? "text-yellow-300"
                        : "text-white/30 group-hover:translate-x-0.5 group-hover:text-white/55",
                    ].join(" ")}
                  />
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4">
        <button
          onClick={onLogout}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm font-semibold text-white/80 transition-all duration-200 hover:border-red-400/25 hover:bg-red-500/10 hover:text-white"
        >
          <LogOut className="h-4 w-4 transition group-hover:-translate-x-0.5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email;

  return (
    <>
      {/* Topbar mobile */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-black/80 px-4 py-4 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
            Admin Panel
          </p>
          <p className="text-sm font-semibold text-white">
            ENTRENAMIENTO <span className="text-yellow-400">FOCUS</span>
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-sm font-bold text-yellow-200">
          {fullName?.charAt(0)?.toUpperCase() || "A"}
        </div>
      </div>

      {/* Desktop */}
      <aside className="hidden h-screen w-[310px] shrink-0 border-r border-white/10 bg-black/70 backdrop-blur-2xl lg:flex">
        <div className="w-full">
          <SidebarInner
            pathname={pathname}
            fullName={fullName}
            email={user?.email}
            onLogout={logout}
          />
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={[
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        <div
          onClick={() => setOpen(false)}
          className={[
            "absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        <div
          className={[
            "absolute left-0 top-0 h-full w-[88%] max-w-[340px] border-r border-white/10 shadow-2xl transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="absolute right-4 top-4 z-10">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/[0.08]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <SidebarInner
            pathname={pathname}
            fullName={fullName}
            email={user?.email}
            onLogout={() => {
              setOpen(false);
              logout();
            }}
            onNavigate={() => setOpen(false)}
          />
        </div>
      </div>
    </>
  );
}