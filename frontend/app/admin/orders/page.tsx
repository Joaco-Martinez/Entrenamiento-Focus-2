"use client";

import { useEffect, useMemo, useState } from "react";
import { ordersService, Order, OrderStatus } from "@/services/orders.service";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingCart,
  RefreshCw,
  Layers3,
  BadgeCheck,
  AlertTriangle,
  Search,
  ChevronRight,
  Package2,
  LockOpen,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

function formatMoney(amount?: number | null, currency?: string | null) {
  if (amount == null) return "—";

  if (currency === "USD") {
    return `US$${Number(amount).toFixed(2)}`;
  }

  return `$${Number(amount).toLocaleString("es-AR")}`;
}

function formatDate(date?: string | null) {
  if (!date) return "—";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getStatusLabel(status?: string) {
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
}

function getStatusClass(status?: string) {
  switch (status) {
    case "PENDING":
      return "border border-yellow-400/25 bg-yellow-400/10 text-yellow-200";
    case "PAID":
      return "border border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
    case "CANCELLED":
      return "border border-red-500/25 bg-red-500/10 text-red-200";
    case "REFUNDED":
      return "border border-blue-400/25 bg-blue-400/10 text-blue-200";
    case "FAILED":
      return "border border-orange-400/25 bg-orange-400/10 text-orange-200";
    case "SHIPPED":
      return "border border-sky-400/25 bg-sky-400/10 text-sky-200";
    case "DELIVERED":
      return "border border-violet-400/25 bg-violet-400/10 text-violet-200";
    default:
      return "border border-white/10 bg-white/5 text-white/60";
  }
}

function getOrderUserId(order: Order) {
  return (order as any)?.userId || (order as any)?.user?.id || "";
}

function getOrderEmail(order: Order) {
  return (order as any)?.user?.email || "";
}

function getOrderItems(order: Order) {
  return Array.isArray((order as any)?.items) ? ((order as any).items as any[]) : [];
}

function getGrantableItems(order: Order) {
  return getOrderItems(order).filter((item: any) => {
    const product = item?.product;

    if (!item?.productId && !product?.id) return false;

    if (product && product.isSubscription === true) {
      return false;
    }

    return true;
  });
}

function getProductIdFromItem(item: any) {
  return item?.productId || item?.product?.id || "";
}

function getProductNameFromItem(item: any) {
  return item?.product?.title || item?.product?.name || item?.productId || "Producto";
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
    <div className="rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-300">
        {icon}
      </div>

      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black leading-none text-white">
        {value}
      </p>
    </div>
  );
}

export default function AdminOrdersPage() {
  const { isAdmin } = useAuth();

  const [status, setStatus] = useState<string>("ALL");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refresh = async (silent = false) => {
    setError(null);

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    refresh();
  }, [status, isAdmin]);

  const stats = useMemo(() => {
    const total = orders.length;
    const paid = orders.filter((o) => o.status === "PAID").length;
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const totalItems = orders.reduce(
      (acc, o) => acc + getOrderItems(o).length,
      0
    );

    return { total, paid, pending, totalItems };
  }, [orders]);

  const handleMarkPaid = async (order: Order) => {
    const orderId = order.id;

    if (!orderId) return;

    const ok = window.confirm(
      "¿Seguro que querés marcar esta orden como pagada y otorgar acceso?"
    );

    if (!ok) return;

    setError(null);
    setSuccessMessage(null);
    setActionLoading(`mark-paid-${orderId}`);

    try {
      await ordersService.adminMarkPaid(orderId, {
        externalId: `manual-admin-${orderId}`,
        raw: {
          source: "admin-panel",
          action: "mark-paid",
        },
      });

      setSuccessMessage("Orden marcada como pagada y acceso otorgado.");
      await refresh(true);
    } catch (e: any) {
      setError(e?.message || "No se pudo marcar la orden como pagada.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleGrantAccess = async (order: Order) => {
    const orderId = order.id;
    const userId = getOrderUserId(order);
    const email = getOrderEmail(order);
    const items = getGrantableItems(order);

    if (!orderId) return;

    if (!userId && !email) {
      setError("La orden no tiene usuario válido para otorgar acceso.");
      return;
    }

    if (items.length === 0) {
      setError("Esta orden no tiene productos válidos para otorgar acceso.");
      return;
    }

    const ok = window.confirm(
      `¿Querés otorgar acceso manual a ${items.length} producto/s de esta orden?`
    );

    if (!ok) return;

    setError(null);
    setSuccessMessage(null);
    setActionLoading(`grant-access-${orderId}`);

    try {
      const uniqueProductIds = Array.from(
        new Set(items.map(getProductIdFromItem).filter(Boolean))
      );

      for (const productId of uniqueProductIds) {
        await ordersService.adminGrantAccess({
          userId: userId || undefined,
          email: !userId ? email : undefined,
          productId,
          orderId,
        });
      }

      setSuccessMessage("Acceso otorgado correctamente.");
      await refresh(true);
    } catch (e: any) {
      setError(e?.message || "No se pudo otorgar el acceso.");
    } finally {
      setActionLoading(null);
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
                Órdenes <span className="text-yellow-400">Admin</span>
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/65 md:text-base">
                Revisá pagos, estados, usuarios y montos. También podés marcar
                órdenes como pagadas y otorgar acceso manual a productos.
              </p>
            </div>

            <button
              onClick={() => refresh(true)}
              disabled={refreshing || !!actionLoading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-400/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <StatCard
            label="Órdenes"
            value={stats.total}
            icon={<ShoppingCart className="h-5 w-5" />}
          />
          <StatCard
            label="Pagadas"
            value={stats.paid}
            icon={<BadgeCheck className="h-5 w-5" />}
          />
          <StatCard
            label="Pendientes"
            value={stats.pending}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <StatCard
            label="Ítems"
            value={stats.totalItems}
            icon={<Package2 className="h-5 w-5" />}
          />
        </section>

        {successMessage && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <section className="rounded-3xl border border-white/10 bg-black/35 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-sm md:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span className="text-sm text-white/60">Filtrar por estado:</span>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="min-w-[210px] rounded-2xl border-white/10 bg-white/[0.04] text-white">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="PENDING">Pendientes</SelectItem>
                  <SelectItem value="PAID">Pagadas</SelectItem>
                  <SelectItem value="CANCELLED">Canceladas</SelectItem>
                  <SelectItem value="REFUNDED">Reembolsadas</SelectItem>
                  <SelectItem value="FAILED">Fallidas</SelectItem>
                  <SelectItem value="SHIPPED">Enviadas</SelectItem>
                  <SelectItem value="DELIVERED">Entregadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-white/45">
              Mostrando{" "}
              <span className="font-semibold text-white">{orders.length}</span>{" "}
              órdenes
            </div>
          </div>
        </section>

        {/* mobile / tablet */}
        <section className="space-y-4 xl:hidden">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
              Cargando órdenes...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/40">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">No hay órdenes</h3>
              <p className="mt-2 text-sm text-white/55">
                No encontramos órdenes para este filtro.
              </p>
            </div>
          ) : (
            orders.map((o) => {
              const grantableItems = getGrantableItems(o);
              const markPaidLoading = actionLoading === `mark-paid-${o.id}`;
              const grantLoading = actionLoading === `grant-access-${o.id}`;
              const disabled = !!actionLoading;

              return (
                <article
                  key={o.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
                >
                  <div className="border-b border-white/8 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                          o.status
                        )}`}
                      >
                        {getStatusLabel(o.status)}
                      </span>
                    </div>

                    <p className="mt-3 break-all text-sm font-semibold text-white">
                      {o.id}
                    </p>
                    <p className="mt-1 text-sm text-white/55">
                      {formatDate(o.createdAt)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                        Usuario
                      </p>
                      <p className="mt-1 break-all text-sm text-white/85">
                        {o.user?.email ?? o.userId ?? "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                        Monto
                      </p>
                      <p className="mt-1 text-sm text-white/85">
                        {formatMoney(o.totalAmount, o.currency)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3 sm:col-span-2">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                        Ítems
                      </p>

                      <div className="mt-2 space-y-1">
                        {getOrderItems(o).length === 0 ? (
                          <p className="text-sm text-white/65">Sin ítems</p>
                        ) : (
                          getOrderItems(o).map((item: any, index: number) => (
                            <p
                              key={`${getProductIdFromItem(item)}-${index}`}
                              className="break-all text-sm text-white/80"
                            >
                              {getProductNameFromItem(item)}
                            </p>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:col-span-2">
                      {o.status === "PENDING" && (
                        <button
                          onClick={() => handleMarkPaid(o)}
                          disabled={disabled}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {markPaidLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <BadgeCheck className="h-4 w-4" />
                          )}
                          Marcar pagada + acceso
                        </button>
                      )}

                      <button
                        onClick={() => handleGrantAccess(o)}
                        disabled={disabled || grantableItems.length === 0}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {grantLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LockOpen className="h-4 w-4" />
                        )}
                        Dar acceso
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {/* desktop */}
        <section className="hidden xl:block">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/35 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-white/[0.03] text-left text-white/50">
                <tr>
                  <th className="w-[13%] px-5 py-4 font-medium">Fecha</th>
                  <th className="w-[22%] px-5 py-4 font-medium">ID</th>
                  <th className="w-[18%] px-5 py-4 font-medium">Usuario</th>
                  <th className="w-[12%] px-5 py-4 font-medium">Estado</th>
                  <th className="w-[10%] px-5 py-4 font-medium">Monto</th>
                  <th className="w-[10%] px-5 py-4 font-medium">Ítems</th>
                  <th className="w-[15%] px-5 py-4 font-medium">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-white/60">
                      Cargando órdenes...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-white/60">
                      No hay órdenes para mostrar.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const items = getOrderItems(o);
                    const grantableItems = getGrantableItems(o);
                    const markPaidLoading = actionLoading === `mark-paid-${o.id}`;
                    const grantLoading = actionLoading === `grant-access-${o.id}`;
                    const disabled = !!actionLoading;

                    return (
                      <tr
                        key={o.id}
                        className="border-t border-white/6 align-top transition hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4 text-white/80">
                          {formatDate(o.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <p className="truncate text-white">{o.id}</p>
                            <div className="flex items-center gap-1 text-xs text-white/35">
                              <ChevronRight className="h-3 w-3" />
                              <span>{o.currency || "—"}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-white/80">
                          <p className="truncate">
                            {o.user?.email ?? o.userId ?? "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                              o.status
                            )}`}
                          >
                            {getStatusLabel(o.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-white/80">
                          {formatMoney(o.totalAmount, o.currency)}
                        </td>

                        <td className="px-5 py-4 text-white/80">
                          <div className="space-y-1">
                            <p>{items.length}</p>

                            {items.slice(0, 2).map((item: any, index: number) => (
                              <p
                                key={`${getProductIdFromItem(item)}-${index}`}
                                className="truncate text-xs text-white/40"
                              >
                                {getProductNameFromItem(item)}
                              </p>
                            ))}

                            {items.length > 2 && (
                              <p className="text-xs text-white/35">
                                +{items.length - 2} más
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-2">
                            {o.status === "PENDING" && (
                              <button
                                onClick={() => handleMarkPaid(o)}
                                disabled={disabled}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {markPaidLoading ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <BadgeCheck className="h-3.5 w-3.5" />
                                )}
                                Marcar pagada
                              </button>
                            )}

                            <button
                              onClick={() => handleGrantAccess(o)}
                              disabled={disabled || grantableItems.length === 0}
                              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 text-xs font-semibold text-yellow-200 transition hover:bg-yellow-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {grantLoading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <LockOpen className="h-3.5 w-3.5" />
                              )}
                              Dar acceso
                            </button>
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
