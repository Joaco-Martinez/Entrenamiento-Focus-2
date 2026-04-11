"use client";

import { useEffect, useMemo, useState } from "react";
import { usersService } from "@/services/users.service";
import { useAuth } from "@/context/AuthContext";
import {
  BadgeCheck,
  AlertTriangle,
  Ban,
  Clock3,
  RefreshCw,
  Search,
  User2,
  CreditCard,
  CalendarDays,
  Mail,
  ShieldAlert,
  Link2Off,
  Layers3,
  ChevronRight,
} from "lucide-react";

type SubscriptionProduct = {
  id: string;
  title: string;
  coverImageUrl?: string | null;
};

type UserSubscription = {
  id: string;
  provider: "MERCADOPAGO" | "PAYPAL";
  status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE" | "SUSPENDED";
  providerStatus?: string | null;
  externalId?: string | null;
  payerEmail?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  cancelledAt?: string | null;
  createdAt?: string;
  product?: SubscriptionProduct | null;
};

type AdminUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  country?: string | null;
  role?: string;
  createdAt?: string;
  subscription?: UserSubscription | null;
};

function formatDate(date?: string | null) {
  if (!date) return "—";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getFullName(user: AdminUser) {
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return fullName || "Sin nombre";
}

function getInitials(user: AdminUser) {
  const fullName = getFullName(user);
  const parts = fullName.split(" ").filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return initials || "U";
}

function getSubscriptionBadge(subscription?: UserSubscription | null) {
  if (!subscription) {
    return {
      label: "Sin suscripción",
      className: "border border-white/10 bg-white/5 text-white/60",
      icon: <Clock3 className="h-3.5 w-3.5" />,
    };
  }

  switch (subscription.status) {
    case "ACTIVE":
      return {
        label: "Activa",
        className:
          "border border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
        icon: <BadgeCheck className="h-3.5 w-3.5" />,
      };

    case "PAST_DUE":
      return {
        label: "Pago pendiente",
        className:
          "border border-amber-400/25 bg-amber-400/10 text-amber-200",
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
      };

    case "SUSPENDED":
      return {
        label: "Suspendida",
        className:
          "border border-orange-400/25 bg-orange-400/10 text-orange-200",
        icon: <ShieldAlert className="h-3.5 w-3.5" />,
      };

    case "CANCELLED":
      return {
        label: "Cancelada",
        className: "border border-red-400/25 bg-red-400/10 text-red-200",
        icon: <Ban className="h-3.5 w-3.5" />,
      };

    case "EXPIRED":
      return {
        label: "Expirada",
        className: "border border-zinc-400/25 bg-zinc-400/10 text-zinc-200",
        icon: <Clock3 className="h-3.5 w-3.5" />,
      };

    default:
      return {
        label: subscription.status,
        className: "border border-white/10 bg-white/5 text-white/70",
        icon: <Clock3 className="h-3.5 w-3.5" />,
      };
  }
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-300">
        {icon}
      </div>

      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black leading-none text-white">{value}</p>
    </div>
  );
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
      <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-white/40">
        {icon}
        <span>{label}</span>
      </div>
      <div className="break-words text-sm text-white/85">{value}</div>
    </div>
  );
}

export default function AdminSubscriptionsPage() {
  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadUsers = async (query?: string, silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const res = await usersService.adminListUsers(query?.trim() || undefined);
      setUsers(res?.users || []);
    } catch (e: any) {
      setError(e?.message || "No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadUsers();
  }, [isAdmin]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const fullName = getFullName(u).toLowerCase();

      return (
        u.email.toLowerCase().includes(q) ||
        fullName.includes(q) ||
        (u.country || "").toLowerCase().includes(q) ||
        (u.subscription?.payerEmail || "").toLowerCase().includes(q) ||
        (u.subscription?.product?.title || "").toLowerCase().includes(q) ||
        (u.subscription?.provider || "").toLowerCase().includes(q) ||
        (u.subscription?.providerStatus || "").toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.subscription?.status === "ACTIVE").length;
    const withSubscription = users.filter((u) => !!u.subscription).length;
    const pending = users.filter((u) => u.subscription?.status === "PAST_DUE").length;

    return { total, active, withSubscription, pending };
  }, [users]);

  const unlinkSubscription = async (userId: string, email: string) => {
    const ok = window.confirm(
      `¿Seguro que querés desvincular la suscripción de ${email}?\n\nEsto solo la elimina de tu sistema. No cancela la suscripción real en Mercado Pago o PayPal.`
    );

    if (!ok) return;

    try {
      setUnlinkingId(userId);
      setError(null);

      await usersService.adminUnlinkSubscription(userId);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                subscription: null,
              }
            : u
        )
      );

      window.alert("La suscripción fue desvinculada correctamente.");
    } catch (e: any) {
      setError(e?.message || "No se pudo desvincular la suscripción.");
    } finally {
      setUnlinkingId(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-80px] top-0 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute right-[-80px] top-24 h-80 w-80 rounded-full bg-yellow-300/5 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-[1500px] space-y-6 px-4 pb-8 md:px-6 xl:px-8">
        <header className="overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.12),transparent_30%),linear-gradient(135deg,#111111,#060606_55%,#000000)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-200">
                <Layers3 className="h-3.5 w-3.5" />
                Panel administrativo
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl 2xl:text-[52px]">
                Suscripciones <span className="text-yellow-400">Admin</span>
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/65 md:text-base">
                Controlá el estado de cada usuario, el proveedor, el período actual y
                el producto vinculado. También podés desvincular manualmente una
                suscripción del sistema cuando haga falta.
              </p>
            </div>

            <button
              onClick={() => loadUsers(undefined, true)}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-400/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <StatCard
            label="Usuarios"
            value={stats.total}
            icon={<User2 className="h-5 w-5" />}
          />
          <StatCard
            label="Con suscripción"
            value={stats.withSubscription}
            icon={<CreditCard className="h-5 w-5" />}
          />
          <StatCard
            label="Activas"
            value={stats.active}
            icon={<BadgeCheck className="h-5 w-5" />}
          />
          <StatCard
            label="Pago pendiente"
            value={stats.pending}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
        </section>

        {error && (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="rounded-3xl border border-white/10 bg-black/35 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-sm md:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                placeholder="Buscar por email, nombre, país, producto, provider status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/35 focus:bg-white/[0.06]"
              />
            </div>

            <div className="text-sm text-white/45">
              Mostrando <span className="font-semibold text-white">{filteredUsers.length}</span> de{" "}
              <span className="font-semibold text-white">{users.length}</span> usuarios
            </div>
          </div>
        </section>

        <section className="space-y-4 2xl:hidden">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
              Cargando usuarios...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/40">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">No hay resultados</h3>
              <p className="mt-2 text-sm text-white/55">
                No encontramos usuarios que coincidan con tu búsqueda.
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const sub = user.subscription;
              const badge = getSubscriptionBadge(sub);
              const canUnlink = !!sub;
              const isBusy = unlinkingId === user.id;

              return (
                <article
                  key={user.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
                >
                  <div className="border-b border-white/8 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10 text-sm font-bold text-yellow-200">
                        {getInitials(user)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-bold text-white">
                            {getFullName(user)}
                          </h3>

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium ${badge.className}`}
                          >
                            {badge.icon}
                            {badge.label}
                          </span>
                        </div>

                        <p className="mt-1 break-all text-sm text-white/60">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                    <DetailItem
                      label="País"
                      value={user.country ?? "—"}
                      icon={<User2 className="h-3.5 w-3.5" />}
                    />
                    <DetailItem
                      label="Proveedor"
                      value={sub?.provider ?? "—"}
                      icon={<CreditCard className="h-3.5 w-3.5" />}
                    />
                    <DetailItem
                      label="Producto"
                      value={sub?.product?.title ?? "—"}
                      icon={<Layers3 className="h-3.5 w-3.5" />}
                    />
                    <DetailItem
                      label="Payer Email"
                      value={sub?.payerEmail ?? "—"}
                      icon={<Mail className="h-3.5 w-3.5" />}
                    />
                    <DetailItem
                      label="Inicio"
                      value={formatDate(sub?.currentPeriodStart)}
                      icon={<CalendarDays className="h-3.5 w-3.5" />}
                    />
                    <DetailItem
                      label="Fin"
                      value={formatDate(sub?.currentPeriodEnd)}
                      icon={<CalendarDays className="h-3.5 w-3.5" />}
                    />
                    <DetailItem
                      label="Provider Status"
                      value={sub?.providerStatus ?? "—"}
                      icon={<ShieldAlert className="h-3.5 w-3.5" />}
                    />
                    <DetailItem
                      label="External ID"
                      value={sub?.externalId ?? "—"}
                      icon={<CreditCard className="h-3.5 w-3.5" />}
                    />
                  </div>

                  <div className="border-t border-white/8 p-4">
                    {canUnlink ? (
                      <button
                        disabled={isBusy}
                        onClick={() => unlinkSubscription(user.id, user.email)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Link2Off className="h-4 w-4" />
                        {isBusy ? "Desvinculando..." : "Desvincular suscripción"}
                      </button>
                    ) : (
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-center text-sm text-white/40">
                        Este usuario no tiene suscripción vinculada.
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </section>

        <section className="hidden 2xl:block">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/35 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-white/[0.03] text-left text-white/50">
                <tr>
                  <th className="w-[24%] px-5 py-4 font-medium">Usuario</th>
                  <th className="w-[12%] px-5 py-4 font-medium">Estado</th>
                  <th className="w-[12%] px-5 py-4 font-medium">Proveedor</th>
                  <th className="w-[18%] px-5 py-4 font-medium">Producto</th>
                  <th className="w-[18%] px-5 py-4 font-medium">Período</th>
                  <th className="w-[10%] px-5 py-4 font-medium">País</th>
                  <th className="w-[6%] px-5 py-4 font-medium text-right">Acción</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-white/60">
                      Cargando usuarios...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-white/60">
                      No hay usuarios para mostrar.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const sub = user.subscription;
                    const badge = getSubscriptionBadge(sub);
                    const canUnlink = !!sub;
                    const isBusy = unlinkingId === user.id;

                    return (
                      <tr
                        key={user.id}
                        className="border-t border-white/6 align-top transition hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10 text-xs font-bold text-yellow-200">
                              {getInitials(user)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-white">
                                {getFullName(user)}
                              </p>
                              <p className="truncate text-white/55">{user.email}</p>

                              {sub?.payerEmail && (
                                <p className="mt-1 truncate text-xs text-white/35">
                                  {sub.payerEmail}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
                          >
                            {badge.icon}
                            {badge.label}
                          </span>

                          {sub?.providerStatus && (
                            <p className="mt-2 text-xs text-white/40">{sub.providerStatus}</p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-white/80">
                          {sub?.provider ? (
                            <div className="space-y-1">
                              <span className="inline-flex rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/85">
                                {sub.provider}
                              </span>
                              {sub.externalId && (
                                <p className="truncate text-xs text-white/35">
                                  ID: {sub.externalId}
                                </p>
                              )}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="px-5 py-4 text-white/80">
                          <p className="truncate">{sub?.product?.title ?? "—"}</p>
                        </td>

                        <td className="px-5 py-4 text-white/80">
                          <div className="space-y-1">
                            <p className="text-white">
                              {formatDate(sub?.currentPeriodStart)}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-white/35">
                              <ChevronRight className="h-3 w-3" />
                              <span>{formatDate(sub?.currentPeriodEnd)}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-white/80">
                          {user.country ?? "—"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            {canUnlink ? (
                              <button
                                disabled={isBusy}
                                onClick={() => unlinkSubscription(user.id, user.email)}
                                className="inline-flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Link2Off className="h-3.5 w-3.5" />
                                {isBusy ? "..." : "Desvincular"}
                              </button>
                            ) : (
                              <span className="text-xs text-white/35">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}