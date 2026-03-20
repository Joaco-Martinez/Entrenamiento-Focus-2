"use client"

import { useEffect, useState } from "react";
import { usersService } from "@/services/users.service";
import { useAuth } from "@/context/AuthContext";

/**
 * Página de administración de suscripciones. Lista los usuarios y el estado de
 * su suscripción (activa o inactiva) y permite cancelar suscripciones
 * activas mediante el endpoint adminCancelSubscription.
 */
export default function AdminSubscriptionsPage() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<{
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    country?: string | null;
    subscription?: any | null;
  }[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const refresh = async () => {
    setError(null);
    setLoading(true);
    try {
      // Primero traemos el listado de usuarios (sin detalles).
      const res = await usersService.adminListUsers();
      const list = res.users || [];
      // Luego obtenemos para cada usuario sus detalles (que incluyen la suscripción).
      const details = await Promise.all(
        list.map((u: any) =>
          usersService
            .adminGetUser(u.id)
            .then((d: any) => d.user)
            .catch(() => null)
        )
      );
      const combined = list.map((u: any, idx: number) => {
        const detail = details[idx] as any;
        return {
          id: u.id,
          email: u.email,
          firstName: u.firstName ?? null,
          lastName: u.lastName ?? null,
          country: u.country ?? null,
          subscription: detail?.subscription ?? null,
        };
      });
      setUsers(combined);
    } catch (e: any) {
      setError(e?.message || "No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelSub = async (userId: string) => {
    const ok = confirm("¿Seguro que querés cancelar la suscripción de este usuario?");
    if (!ok) return;
    setCancellingId(userId);
    try {
      await usersService.adminCancelSubscription(userId);
      await refresh();
      alert("La suscripción fue cancelada.");
    } catch (e: any) {
      setError(e?.message || "No se pudo cancelar la suscripción.");
    } finally {
      setCancellingId(null);
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
          Lista de usuarios y sus suscripciones. Podés cancelar suscripciones activas.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-white/60">
              <tr>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Nombre</th>
                <th className="py-3 px-3">País</th>
                <th className="py-3 px-3">Suscripción</th>
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Inicio</th>
                <th className="py-3 px-3">Fin</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-6 px-3 text-white/60" colSpan={8}>
                    Cargando...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="py-6 px-3 text-white/60" colSpan={8}>
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const sub = u.subscription;
                  const isActive = !!sub && (sub.status === "ACTIVE" || sub.status === "APPROVED");
                  return (
                    <tr key={u.id} className="border-t border-white/5">
                      <td className="py-4 px-3">{u.email}</td>
                      <td className="py-4 px-3">
                        {u.firstName || u.lastName ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() : "—"}
                      </td>
                      <td className="py-4 px-3">{u.country ?? "—"}</td>
                        <td className="py-4 px-3">
                          {isActive ? (
                            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                              Activa
                            </span>
                          ) : (
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                              Inactiva
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-3">{sub?.id ?? "—"}</td>
                        <td className="py-4 px-3">
                          {sub?.startDate ? new Date(sub.startDate).toLocaleString("es-AR") : "—"}
                        </td>
                        <td className="py-4 px-3">
                          {sub?.endDate ? new Date(sub.endDate).toLocaleString("es-AR") : "—"}
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex justify-end">
                            {isActive ? (
                              <button
                                disabled={cancellingId === u.id}
                                onClick={() => cancelSub(u.id)}
                                className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200 hover:bg-red-500/15 disabled:opacity-50"
                              >
                                {cancellingId === u.id ? "Cancelando..." : "Cancelar"}
                              </button>
                            ) : null}
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