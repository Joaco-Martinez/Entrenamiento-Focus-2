"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const links = [
  { label: "Dashboard", href: "/admin" },
  { label: "Productos", href: "/admin/products" },
  { label: "Órdenes", href: "/admin/orders" },
  { label: "Suscripciones", href: "/admin/subscriptions" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email;

  return (
    <aside className="hidden h-full w-[280px] flex-col border-r border-white/5 bg-black/40 backdrop-blur lg:flex">
      <div className="p-6">
        <div className="text-xs font-semibold tracking-[0.25em] text-white/85">
          ENTRENAMIENTO <span className="text-yellow-400">FOCUS</span>
        </div>

        <div className="mt-5 rounded-xl border border-yellow-400/15 bg-white/[0.03] p-4">
          <p className="text-xs text-white/55">Admin</p>

          <p className="mt-1 text-sm font-semibold text-white">{fullName}</p>

          <p className="mt-1 text-xs text-white/45">{user?.email}</p>

          <div className="mt-3 h-[2px] w-10 rounded-full bg-yellow-400/80" />
        </div>

        <nav className="mt-6 space-y-2">
          {links.map((l) => {
            const active = pathname === l.href;

            return (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "flex items-center justify-between rounded-xl px-4 py-3 text-sm transition",
                  active
                    ? "border border-yellow-400/25 bg-yellow-400/10 text-white"
                    : "border border-white/5 bg-white/[0.02] text-white/70 hover:bg-white/[0.04] hover:text-white",
                ].join(" ")}
              >
                <span>{l.label}</span>
                <span className={active ? "text-yellow-300" : "text-white/35"}>
                  →
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6">
        <button
          onClick={logout}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.06]"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}