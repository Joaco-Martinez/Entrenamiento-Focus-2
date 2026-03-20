"use client"

import { useEffect, useState } from "react";
import { ordersService, Order } from "@/services/orders.service";
import { useAuth } from "@/context/AuthContext";

/**
 * Página del dashboard donde el usuario puede ver el historial de sus órdenes.
 * Muestra una tabla con la fecha, el identificador, el estado, el monto y la
 * cantidad de ítems de cada orden. Se usa ordersService.myOrders() para
 * consultar al backend. Si el usuario no está logueado se muestra un aviso.
 */
export default function DashboardOrdersPage() {
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await ordersService.myOrders();
      setOrders(res.orders || []);
    } catch (e: any) {
      setError(e?.message || "No se pudieron cargar tus órdenes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) {
    return (
      <div className="p-6">
        Debes iniciar sesión para ver tus órdenes.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold md:text-4xl">Mis órdenes</h1>
        <p className="mt-2 text-white/70">Historial de compras y pagos.</p>
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
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3">Monto</th>
                <th className="py-3 px-3">Ítems</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-6 px-3 text-white/60" colSpan={5}>
                    Cargando...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td className="py-6 px-3 text-white/60" colSpan={5}>
                    No tenés órdenes todavía.
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