"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { paymentsService } from "@/services/payments.service";
import { ordersService, Order } from "@/services/orders.service";

type PurchasedProduct = {
  id: string;
  title: string;
  slug?: string | null;
  coverImageUrl?: string | null;
  orderId?: string;
};

type AccessMap = Record<
  string,
  {
    loading: boolean;
    resourceUrl: string | null;
    error: string | null;
  }
>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function UserDashboardPage() {
  const { user, isPremium } = useAuth();

  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [accessLoading, setAccessLoading] = useState(false);
const router = useRouter();
  const [status, setStatus] = useState<{
    subscriptionId: string | null;
    subscriptionStartDate: string | null;
    subscriptionEndDate: string | null;
    hasActiveSubscription: boolean;
  } | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [accessMap, setAccessMap] = useState<AccessMap>({});
  const [error, setError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const email = user?.email ?? "—";

  const providerHint = useMemo(() => {
    if (!user?.subscriptionId) return null;
    return "(tenés una suscripción registrada)";
  }, [user?.subscriptionId]);

  const purchasedProducts = useMemo(() => {
    const map = new Map<string, PurchasedProduct>();

    for (const order of orders) {
      if (!Array.isArray(order.items)) continue;

      for (const item of order.items) {
        const productId =
          item?.product?.id ??
          item?.productId ??
          null;

        if (!productId) continue;

        if (!map.has(productId)) {
          map.set(productId, {
            id: productId,
            title:
              item?.product?.title ??
              item?.product?.name ??
              item?.title ??
              "Producto sin nombre",
            slug: item?.product?.slug ?? null,
            coverImageUrl: item?.product?.coverImageUrl ?? null,
            orderId: order.id,
          });
        }
      }
    }

    return Array.from(map.values());
  }, [orders]);

  const refreshSubscription = async () => {
    setError(null);
    setLoading(true);

    try {
      const mp = await paymentsService.subscriptionStatus().catch(() => null);
      const pp = await paymentsService.paypalSubscriptionStatus().catch(() => null);

      const best = (pp?.hasActiveSubscription ? pp : mp) ?? mp ?? pp;

      if (best) {
        setStatus({
          subscriptionId: best.subscriptionId,
          subscriptionStartDate: best.subscriptionStartDate,
          subscriptionEndDate: best.subscriptionEndDate,
          hasActiveSubscription: best.hasActiveSubscription,
        });
      } else {
        setStatus(null);
      }
    } catch (e: any) {
      setError(e?.message || "No se pudo cargar el estado de tu suscripción.");
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    setOrdersError(null);
    setOrdersLoading(true);

    try {
      const res = await ordersService.myOrders();
      setOrders(Array.isArray(res?.orders) ? res.orders : []);
    } catch (e: any) {
      setOrdersError(e?.message || "No se pudieron cargar tus productos comprados.");
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchProductAccess = async (productId: string) => {
    setAccessMap((prev) => ({
      ...prev,
      [productId]: {
        loading: true,
        resourceUrl: prev[productId]?.resourceUrl ?? null,
        error: null,
      },
    }));

    try {
      const res = await fetch(`${API_URL}/products/${productId}/access`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "No se pudo obtener el acceso al recurso."
        );
      }

      const resourceUrl =
        data?.content?.resourceUrl ??
        data?.resourceUrl ??
        null;

      setAccessMap((prev) => ({
        ...prev,
        [productId]: {
          loading: false,
          resourceUrl,
          error: resourceUrl ? null : "El recurso no tiene URL disponible.",
        },
      }));
    } catch (e: any) {
      setAccessMap((prev) => ({
        ...prev,
        [productId]: {
          loading: false,
          resourceUrl: null,
          error: e?.message || "No se pudo obtener la URL del recurso.",
        },
      }));
    }
  };

  const fetchAllAccess = async () => {
    if (purchasedProducts.length === 0) return;

    setAccessLoading(true);

    try {
      await Promise.all(
        purchasedProducts.map((product) => fetchProductAccess(product.id))
      );
    } finally {
      setAccessLoading(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([refreshSubscription(), refreshOrders()]);
  };

  const cancel = async () => {
    const ok = confirm("¿Seguro que querés cancelar tu suscripción?");
    if (!ok) return;

    setError(null);
    setLoading(true);

    try {
      await paymentsService.cancelSubscription().catch(async () => {
        await paymentsService.paypalCancelSubscription("User requested cancellation");
      });

      await refreshSubscription();
      alert("Listo: se pidió la cancelación.");
    } catch (e: any) {
      setError(e?.message || "No se pudo cancelar la suscripción.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResource = async (productId: string) => {
    const current = accessMap[productId];

    if (current?.resourceUrl) {
      window.open(current.resourceUrl, "_blank", "noopener,noreferrer");
      return;
    }

    await fetchProductAccess(productId);

    const updated = accessMap[productId];
    if (updated?.resourceUrl) {
      window.open(updated.resourceUrl, "_blank", "noopener,noreferrer");
    }
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (purchasedProducts.length > 0) {
      fetchAllAccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchasedProducts.length]);
  console.log(user)
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold md:text-4xl">Hola 👋</h1>
        <p className="mt-2 text-white/70">Email: {email}</p>
      </div>





<section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div>
      <p className="text-lg font-bold">Suscripción</p>
      <p className="text-sm text-white/60">
        {status?.hasActiveSubscription ? "Activa" : "Inactiva"}
        {status?.subscriptionId ? ` · ID: ${status.subscriptionId}` : ""}
      </p>

      {status?.subscriptionStartDate ? (
        <p className="mt-1 text-xs text-white/50">
          Inicio: {new Date(status.subscriptionStartDate).toLocaleString("es-AR")}
        </p>
      ) : null}

      {status?.subscriptionEndDate ? (
        <p className="mt-1 text-xs text-white/50">
          Fin: {new Date(status.subscriptionEndDate).toLocaleString("es-AR")}
        </p>
      ) : null}
    </div>

    <div className="flex gap-3">
      <button
        onClick={refreshSubscription}
        disabled={loading}
        className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm hover:bg-white/[0.07] disabled:opacity-60"
      >
        {loading ? "Cargando..." : "Actualizar"}
      </button>


      {/* 👇 NUEVO BOTÓN */}
      {status?.hasActiveSubscription && (
        <button
          onClick={() => router.push("/mentoria/pagada")}
          className="rounded-xl border border-green-500/25 bg-green-500/10 px-4 py-2 text-sm text-green-200 hover:bg-green-500/15"
        >
          Ir a la mentoría
        </button>
      )}
    </div>
  </div>

  {error ? (
    <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
      {error}
    </div>
  ) : null}
</section>

      <section className="rounded-2xl border border-white/10 bg-black/30 p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Mis productos comprados</h2>
            <p className="mt-1 text-sm text-white/60">
              Acá ves los productos que compraste y el acceso al recurso.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={refreshOrders}
              disabled={ordersLoading}
              className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm hover:bg-white/[0.07] disabled:opacity-60"
            >
              {ordersLoading ? "Actualizando..." : "Actualizar compras"}
            </button>

            <button
              onClick={fetchAllAccess}
              disabled={accessLoading || purchasedProducts.length === 0}
              className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm hover:bg-white/[0.07] disabled:opacity-60"
            >
              {accessLoading ? "Buscando accesos..." : "Actualizar accesos"}
            </button>
          </div>
        </div>

        {ordersError ? (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {ordersError}
          </div>
        ) : null}

        {ordersLoading ? (
          <p className="text-sm text-white/60">Cargando productos...</p>
        ) : purchasedProducts.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/60">
            Todavía no tenés productos comprados.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {purchasedProducts.map((product) => {
              const access = accessMap[product.id];

              return (
                <div
                  key={product.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                    {product.coverImageUrl ? (
                      <img
                        src={product.coverImageUrl}
                        alt={product.title}
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center text-sm text-white/40">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-white">
                    {product.title}
                  </h3>

                  <p className="mt-2 text-xs text-white/45">
                    ID producto: {product.id}
                  </p>

                  <p className="mt-2 text-xs text-white/55">
                    Estado acceso:{" "}
                    {access?.loading
                      ? "consultando..."
                      : access?.resourceUrl
                      ? "disponible"
                      : access?.error
                      ? "sin acceso"
                      : "pendiente"}
                  </p>

                  {access?.error ? (
                    <p className="mt-2 text-xs text-red-300">
                      {access.error}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={product.slug ? `/recursos/${product.slug}` : `/recursos/${product.id}`}
                      className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm hover:bg-white/[0.07]"
                    >
                      Ver producto
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleOpenResource(product.id)}
                      disabled={access?.loading}
                      className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/15 disabled:opacity-60"
                    >
                      {access?.loading ? "Abriendo..." : "Abrir recurso"}
                    </button>

                    <Link
                      href="/dashboard/orders"
                      className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-200 hover:bg-yellow-500/15"
                    >
                      Ver orden
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <p className="text-sm text-white/50">
       ⚠️ Atención: El acceso a los productos es único y personal.  
Si se detecta uso desde una cuenta o IP no autorizada, el acceso será revocado automáticamente.
      </p>
    </div>
  );
}

function Card({
  title,
  desc,
  href,
  onClick,
}: {
  title: string;
  desc: string;
  href: string;
  onClick?: () => void;
}) {
  const Inner = (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5 transition hover:bg-black/40">
      <p className="text-sm font-semibold text-white/85">{title}</p>
      <p className="mt-2 text-sm text-white/60">{desc}</p>
      <div className="mt-4 h-[2px] w-12 rounded-full bg-primary/80" />
    </div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="text-left">
        {Inner}
      </button>
    );
  }

  return <Link href={href}>{Inner}</Link>;
}