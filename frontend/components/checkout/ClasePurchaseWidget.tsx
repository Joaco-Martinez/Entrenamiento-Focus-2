"use client";

import { useMemo, useState } from "react";
import { CreditCard, Wallet, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ordersService } from "@/services/orders.service";
import { VideoClass } from "@/services/classes.service";
import MercadoPagoWalletBrick from "./MercadoPagoWalletBrick";
import PaypalCheckout from "./PaypalCheckout";

type Provider = "mercadopago" | "paypal";

export default function ClasePurchaseWidget({ clase }: { clase: VideoClass }) {
  const { user, country, fullName } = useAuth();

  const normalizedCountry = (country || "arg").toLowerCase();
  const isArgentina =
    normalizedCountry === "arg" ||
    normalizedCountry === "ar" ||
    normalizedCountry === "argentina";

  const [provider, setProvider] = useState<Provider>(
    isArgentina && clase.arPrice > 0 ? "mercadopago" : "paypal"
  );
  const [order, setOrder] = useState<{ id: string } | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUseMp = isArgentina && clase.arPrice > 0;
  const canUsePaypal = clase.usdPrice > 0;

  const payer = useMemo(
    () => ({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      fullName: fullName || "",
    }),
    [user, fullName]
  );

  const mpItems = useMemo(
    () => [
      {
        id: clase.id,
        title: clase.title,
        quantity: 1,
        unit_price: Number(clase.arPrice),
        currency_id: "ARS" as const,
        description: clase.description || "",
      },
    ],
    [clase]
  );

  const startOrder = async (nextProvider: Provider) => {
    setProvider(nextProvider);
    setError(null);

    if (order) return;

    try {
      setCreating(true);

      const data = await ordersService.create({
        country: normalizedCountry,
        provider: nextProvider === "mercadopago" ? "MERCADOPAGO" : "PAYPAL",
        items: [{ classId: clase.id, quantity: 1 }],
      });

      const createdOrder = (data as any)?.order || data;
      if (!createdOrder?.id) throw new Error("No se pudo crear la orden");

      setOrder(createdOrder);
    } catch (err: any) {
      setError(err?.message || "No se pudo iniciar la compra.");
    } finally {
      setCreating(false);
    }
  };

  if (!canUseMp && !canUsePaypal) {
    return (
      <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        Esta clase todavía no tiene un precio configurado. Probá más tarde.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {canUseMp && (
          <button
            type="button"
            onClick={() => startOrder("mercadopago")}
            disabled={creating}
            className={`rounded-2xl border p-4 text-left transition disabled:opacity-60 ${
              provider === "mercadopago"
                ? "border-primary bg-primary/10"
                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-bold">Mercado Pago</p>
                  <p className="text-xs text-muted-foreground">Pesos argentinos</p>
                </div>
              </div>
              {provider === "mercadopago" && order && (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              )}
            </div>
          </button>
        )}

        {canUsePaypal && (
          <button
            type="button"
            onClick={() => startOrder("paypal")}
            disabled={creating}
            className={`rounded-2xl border p-4 text-left transition disabled:opacity-60 ${
              provider === "paypal"
                ? "border-primary bg-primary/10"
                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-bold">PayPal</p>
                  <p className="text-xs text-muted-foreground">Dólares</p>
                </div>
              </div>
              {provider === "paypal" && order && (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              )}
            </div>
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {!order && (
        <button
          type="button"
          onClick={() => startOrder(provider)}
          disabled={creating}
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {creating ? "Preparando..." : "Continuar"}
        </button>
      )}

      {order && provider === "mercadopago" && (
        <MercadoPagoWalletBrick items={mpItems} payer={payer} orderId={order.id} />
      )}

      {order && provider === "paypal" && (
        <PaypalCheckout orderId={order.id} amountUsd={Number(clase.usdPrice)} />
      )}
    </div>
  );
}
