"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import MercadoPagoPaymentBrick from "./MercadoPagoPaymentBrick";
import MercadoPagoWalletBrick from "./MercadoPagoWalletBrick";
import PaypalCheckout from "./PaypalCheckout";
type PaymentProvider = "mercadopago" | "paypal";
type MercadoPagoMethod = "card" | "wallet";

export default function CheckoutPaymentSelector() {
  const { cart, hasHydrated, getSubtotalByCountry } = useCart();
  const { user, country, loading, fullName } = useAuth();

  const normalizedCountry = (country || "arg").toLowerCase();
  const isArgentina = normalizedCountry === "arg";

  const [provider, setProvider] = useState<PaymentProvider>(
    isArgentina ? "mercadopago" : "paypal"
  );

  const [mpMethod, setMpMethod] = useState<MercadoPagoMethod>("card");

  useEffect(() => {
    if (loading) return;

    if (isArgentina) {
      setProvider("mercadopago");
    } else {
      setProvider("paypal");
    }
  }, [isArgentina, loading]);

  const amount = getSubtotalByCountry(isArgentina ? "arg" : "other");

  const mpItems = useMemo(() => {
    if (!isArgentina) return [];

    return cart.map((item) => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      unit_price: item.arPrice,
      currency_id: "ARS" as const,
      description: item.description || "",
    }));
  }, [cart, isArgentina]);

  const paypalItems = useMemo(() => {
    return cart.map((item) => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      unit_price: item.usdPrice,
      currency_id: "USD" as const,
      description: item.description || "",
    }));
  }, [cart]);

  const payer = useMemo(() => {
    return {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      identification: {
        type: "DNI",
        number: "",
      },
      fullName: fullName || "",
    };
  }, [user, fullName]);

  if (loading || !hasHydrated) {
    return <div>Cargando checkout...</div>;
  }

  if (!cart.length) {
    return <div>Tu carrito está vacío.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-800 bg-black p-4 text-white">
        <h2 className="mb-4 text-lg font-semibold">Elegí cómo pagar</h2>

        <div className="mb-4 flex gap-2">
          {isArgentina && (
            <button
              type="button"
              onClick={() => setProvider("mercadopago")}
              className={`rounded-xl px-4 py-2 text-sm ${
                provider === "mercadopago"
                  ? "bg-white text-black"
                  : "border border-zinc-700 bg-zinc-900 text-zinc-300"
              }`}
            >
              Mercado Pago
            </button>
          )}

          <button
            type="button"
            onClick={() => setProvider("paypal")}
            className={`rounded-xl px-4 py-2 text-sm ${
              provider === "paypal"
                ? "bg-white text-black"
                : "border border-zinc-700 bg-zinc-900 text-zinc-300"
            }`}
          >
            PayPal
          </button>
        </div>

        {provider === "mercadopago" && isArgentina && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMpMethod("card")}
                className={`rounded-xl px-4 py-2 text-sm ${
                  mpMethod === "card"
                    ? "bg-white text-black"
                    : "border border-zinc-700 bg-zinc-900 text-zinc-300"
                }`}
              >
                Tarjeta
              </button>

              <button
                type="button"
                onClick={() => setMpMethod("wallet")}
                className={`rounded-xl px-4 py-2 text-sm ${
                  mpMethod === "wallet"
                    ? "bg-white text-black"
                    : "border border-zinc-700 bg-zinc-900 text-zinc-300"
                }`}
              >
                Mercado Pago directo
              </button>
            </div>

            {mpMethod === "card" && (
              <div>
                <p className="mb-3 text-sm text-zinc-400">
                  Pagás con tarjeta dentro de la web.
                </p>

                <MercadoPagoPaymentBrick
                  amount={amount}
                  items={mpItems}
                  payer={payer}
                />
              </div>
            )}

            {mpMethod === "wallet" && (
              <div>
                <p className="mb-3 text-sm text-zinc-400">
                  Vas al checkout de Mercado Pago.
                </p>

                <MercadoPagoWalletBrick
                  items={mpItems}
                  payer={payer}
                />
              </div>
            )}
          </div>
        )}

        {provider === "paypal" && (
          <div>
            <p className="mb-3 text-sm text-zinc-400">
              Checkout internacional en USD.
            </p>

            {/* <PaypalCheckout
              items={paypalItems}
              payer={payer}
            /> */}
          </div>
        )}
      </div>
    </div>
  );
}