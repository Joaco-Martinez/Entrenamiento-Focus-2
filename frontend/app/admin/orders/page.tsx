"use client"

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
 * por estado (pendientes, pagadas, canceladas, reembolsadas). Sólo los
 * administradores pueden acceder a esta página. Utiliza ordersService.adminOrders().
 */
export default function AdminOrdersPage() {
  const { isAdmin } = useAuth();

  // Valor del filtro. Cadena vacía significa todos los estados.
  const [status, setStatus] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setError(null);
    setLoading(true);
    try {
      // Convertimos a OrderStatus o undefined según el valor del filtro.
      const statusFilter: OrderStatus | undefined = (status as OrderStatus) || undefined;
      const res = await ordersService.adminOrders(statusFilter);
      setOrders(res.orders || []);
    } catch (e: any) {
      setError(e?.message || "No se pudieron cargar las órdenes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

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

      {/* Filtro por estado */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
        <label className="text-sm text-white/70">Filtrar por estado:</label>
        <Select value={status} onValueChange={(v) => setStatus(v)}>
          <SelectTrigger className="min-w-[180px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="" value="">
              Todos
            </SelectItem>
            <SelectItem key="PENDING" value="PENDING">
              Pendientes
            </SelectItem>
            <SelectItem key="PAID" value="PAID">
              Pagadas
            </SelectItem>
            <SelectItem key="CANCELLED" value="CANCELLED">
              Canceladas
            </SelectItem>
            <SelectItem key="REFUNDED" value="REFUNDED">
              Reembolsadas
            </SelectItem>
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
                <th className="py-3 px-3">Fecha</th>
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Usuario</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3">Monto</th>
                <th className="py-3 px-3">Ítems</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-6 px-3 text-white/60" colSpan={6}>
                    Cargando...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td className="py-6 px-3 text-white/60" colSpan={6}>
                    No hay órdenes para mostrar.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="border-t border-white/5">
                    <td className="py-4 px-3">
                      {new Date(o.createdAt).toLocaleString("es-AR")}
                    </td>
                    <td className="py-4 px-3">{o.id}</td>
                    <td className="py-4 px-3">
                      {o.user?.email ?? o.userId ?? "—"}
                    </td>
                    <td className="py-4 px-3">
                      <span
                        className={
                          o.status === "PENDING"
                            ? "rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-200"
                            : o.status === "PAID"
                            ? "rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200"
                            : o.status === "CANCELLED"
                            ? "rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-xs text-red-200"
                            : "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
                        }
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-white/80">
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
                    <td className="py-4 px-3">{o.items.length}</td>
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