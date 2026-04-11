"use client";

import { useEffect, useMemo, useState } from "react";
import { usersService } from "@/services/users.service";
import { useAuth } from "@/context/AuthContext";

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

  return parsed.toLocaleString("es-AR");
}

function getFullName(user: AdminUser) {
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return fullName || "—";
}

function getSubscriptionBadge(subscription?: UserSubscription | null) {
  if (!subscription) {
    return {
      label: "Sin suscripción",
      className:
        "border border-white/10 bg-white/5 text-white/60",
    };
  }

  switch (subscription.status) {
    case "ACTIVE":
      return {
        label: "Activa",
        className:
          "border border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
      };
    case "PAST_DUE":
      return {
        label: "Pago pendiente",
        className:
          "border border-amber-400/25 bg-amber-400/10 text-amber-200",
      };
    case "SUSPENDED":
      return {
        label: "Suspendida",
        className:
          "border border-orange-400/25 bg-orange-400/10 text-orange-200",
      };
    case "CANCELLED":
      return {
        label: "Cancelada",
        className:
          "border border-red-400/25 bg-red-400/10 text-red-200",
      };
    case "EXPIRED":
      return {
        label: "Expirada",
        className:
          "border border-zinc-400/25 bg-zinc-400/10 text-zinc-200",
      };
    default:
      return {
        label: subscription.status,
        className:
          "border border-white/10 bg-white/5 text-white/70",
      };
  }
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
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
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
        (u.subscription?.product?.title || "").toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  const unlinkSubscription = async (userId: string, email: string) => {
    const ok = window.confirm(
      `¿Seguro que querés desvincular la suscripción de ${email}?\n\nEsto solo la elimina de tu sistema. No cancela realmente la suscripción en Mercado Pago o PayPal.`
    );

    if (!ok) return;

    setUnlinkingId(userId);
    setError(null);

    try {
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold md:text-4xl">
          Suscripciones <span className="text-yellow-400">Admin</span>
        </h1>
        <div className="mt-4 h-[3px] w-16 rounded-full bg-yellow-400" />
        <p className="mt-4 text-white/70">
          Acá podés ver qué usuarios tienen suscripción vinculada y desvincularla manualmente del sistema.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Buscar por email, nombre, país o producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-yellow-400/40 md:max-w-md"
          />

          <button
            onClick={() => loadUsers(undefined, true)}
            disabled={refreshing}
            className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-sm font-medium text-yellow-200 transition hover:bg-yellow-400/15 disabled:opacity-50"
          >
            {refreshing ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-sm">
            <thead className="text-left text-white/60">
              <tr>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Nombre</th>
                <th className="px-3 py-3">País</th>
                <th className="px-3 py-3">Estado</th>
                <th className="px-3 py-3">Proveedor</th>
                <th className="px-3 py-3">Producto</th>
                <th className="px-3 py-3">Payer Email</th>
                <th className="px-3 py-3">Inicio</th>
                <th className="px-3 py-3">Fin</th>
                <th className="px-3 py-3">Provider Status</th>
                <th className="px-3 py-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="px-3 py-6 text-white/60" colSpan={11}>
                    Cargando usuarios...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-white/60" colSpan={11}>
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const sub = user.subscription;
                  const badge = getSubscriptionBadge(sub);
                  const canUnlink = !!sub;

                  return (
                    <tr key={user.id} className="border-t border-white/5">
                      <td className="px-3 py-4 align-top">{user.email}</td>

                      <td className="px-3 py-4 align-top">{getFullName(user)}</td>

                      <td className="px-3 py-4 align-top">{user.country ?? "—"}</td>

                      <td className="px-3 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="px-3 py-4 align-top">
                        {sub?.provider ? (
                          <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80">
                            {sub.provider}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-3 py-4 align-top">
                        {sub?.product?.title ?? "—"}
                      </td>

                      <td className="px-3 py-4 align-top">
                        {sub?.payerEmail ?? "—"}
                      </td>

                      <td className="px-3 py-4 align-top">
                        {formatDate(sub?.currentPeriodStart)}
                      </td>

                      <td className="px-3 py-4 align-top">
                        {formatDate(sub?.currentPeriodEnd)}
                      </td>

                      <td className="px-3 py-4 align-top">
                        {sub?.providerStatus ?? "—"}
                      </td>

                      <td className="px-3 py-4 align-top">
                        <div className="flex justify-end">
                          {canUnlink ? (
                            <button
                              disabled={unlinkingId === user.id}
                              onClick={() => unlinkSubscription(user.id, user.email)}
                              className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {unlinkingId === user.id
                                ? "Desvinculando..."
                                : "Desvincular"}
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
      </div>
    </div>
  );
}