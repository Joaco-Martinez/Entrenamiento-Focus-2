"use client";

import { useEffect, useState } from "react";
import { ordersService, Order, OrderStatus } from "@/services/orders.service";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/**
 * Página de administración de órdenes. Permite ver todas las órdenes y filtrar
 * por estado. Sólo los administradores pueden acceder a esta página.
 */
export default function AdminOrdersPage() {
  const { isAdmin } = useAuth();

  // "ALL" significa todos los estados
  const [status, setStatus] = useState<string>("ALL");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setError(null);
    setLoading(true);

    try {
      const statusFilter: OrderStatus | undefined =
        status === "ALL" ? undefined : (status as OrderStatus);

      const res = await ordersService.adminOrders(statusFilter);
      setOrders(Array.isArray(res?.orders) ? res.orders : []);
    } catch (e: any) {
      setError(e?.message || "No se pudieron cargar las órdenes.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, isAdmin]);

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "PENDING":
        return "Pendiente";
      case "PAID":
        return "Pagada";
      case "CANCELLED":
        return "Cancelada";
      case "REFUNDED":
        return "Reembolsada";
      case "FAILED":
        return "Fallida";
      case "SHIPPED":
        return "Enviada";
      case "DELIVERED":
        return "Entregada";
      default:
        return status || "Sin estado";
    }
  };

  const getStatusClass = (status?: string) => {
    switch (status) {
      case "PENDING":
        return "rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-200";
      case "PAID":
        return "rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200";
      case "CANCELLED":
        return "rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-xs text-red-200";
      case "REFUNDED":
        return "rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1 text-xs text-blue-200";
      case "FAILED":
        return "rounded-full border border-orange-400/25 bg-orange-400/10 px-3 py-1 text-xs text-orange-200";
      case "SHIPPED":
        return "rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1 text-xs text-sky-200";
      case "DELIVERED":
        return "rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1 text-xs text-violet-200";
      default:
        return "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60";
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold md:text-4xl">
          Órdenes <span className="text-yellow-400">Admin</span>
        </h1>
        <div className="mt-4 h-[3px] w-16 rounded-full bg-yellow-400" />
        <p className="mt-4 text-white/70">
          Listado de pagos y estados. Filtrá por estado para revisar órdenes.
        </p>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
        <label className="text-sm text-white/70">Filtrar por estado:</label>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="min-w-[180px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="PENDING">Pendientes</SelectItem>
            <SelectItem value="PAID">Pagadas</SelectItem>
            <SelectItem value="CANCELLED">Canceladas</SelectItem>
            <SelectItem value="REFUNDED">Reembolsadas</SelectItem>
          </SelectContent>
        </Select>
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
                <th className="px-3 py-3">Fecha</th>
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3">Usuario</th>
                <th className="px-3 py-3">Estado</th>
                <th className="px-3 py-3">Monto</th>
                <th className="px-3 py-3">Ítems</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="px-3 py-6 text-white/60" colSpan={6}>
                    Cargando...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-white/60" colSpan={6}>
                    No hay órdenes para mostrar.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="border-t border-white/5">
                    <td className="px-3 py-4">
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleString("es-AR")
                        : "—"}
                    </td>

                    <td className="px-3 py-4">{o.id}</td>

                    <td className="px-3 py-4">
                      {o.user?.email ?? o.userId ?? "—"}
                    </td>

                    <td className="px-3 py-4">
                      <span className={getStatusClass(o.status)}>
                        {getStatusLabel(o.status)}
                      </span>
                    </td>

                    <td className="px-3 py-4 text-white/80">
                      {o.totalAmount != null ? (
                        <>
                          {o.currency === "USD" ? "US$" : "$"}
                          {o.currency === "USD"
                            ? Number(o.totalAmount).toFixed(2)
                            : Number(o.totalAmount).toLocaleString("es-AR")}
                        </>
                      ) : (
                        <span className="text-white/50">—</span>
                      )}
                    </td>

                    <td className="px-3 py-4">
                      {Array.isArray(o.items) ? o.items.length : 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}