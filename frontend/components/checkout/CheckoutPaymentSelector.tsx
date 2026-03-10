"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import MercadoPagoPaymentBrick from "./MercadoPagoPaymentBrick";
import MercadoPagoWalletBrick from "./MercadoPagoWalletBrick";
// import PaypalCheckout from "./PaypalCheckout";

type PaymentProvider = "mercadopago" | "paypal";
type MercadoPagoMethod = "card" | "wallet";

export default function CheckoutPaymentSelector() {
  const { cart, hasHydrated, getSubtotalByCountry, clearCart } = useCart();
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

  const sanitizedCart = useMemo(() => {
    return cart.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        item.id.trim() !== "" &&
        typeof item.title === "string" &&
        item.title.trim() !== "" &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0
    );
  }, [cart]);

  const invalidCartItems = useMemo(() => {
    return cart.filter(
      (item) =>
        !item ||
        typeof item.id !== "string" ||
        item.id.trim() === "" ||
        typeof item.title !== "string" ||
        item.title.trim() === "" ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0
    );
  }, [cart]);

  const amount = getSubtotalByCountry(isArgentina ? "arg" : "other");

  const mpItems = useMemo(() => {
    if (!isArgentina) return [];

    return sanitizedCart
      .map((item) => ({
        id: item.id,
        title: item.title,
        quantity: Number(item.quantity),
        unit_price: Number(item.arPrice),
        currency_id: "ARS" as const,
        description: item.description || "",
      }))
      .filter(
        (item) =>
          item.id.trim() !== "" &&
          item.title.trim() !== "" &&
          Number.isFinite(item.quantity) &&
          item.quantity > 0 &&
          Number.isFinite(item.unit_price) &&
          item.unit_price > 0
      );
  }, [sanitizedCart, isArgentina]);

  const paypalItems = useMemo(() => {
    return sanitizedCart
      .map((item) => ({
        id: item.id,
        title: item.title,
        quantity: Number(item.quantity),
        unit_price: Number(item.usdPrice),
        currency_id: "USD" as const,
        description: item.description || "",
      }))
      .filter(
        (item) =>
          item.id.trim() !== "" &&
          item.title.trim() !== "" &&
          Number.isFinite(item.quantity) &&
          item.quantity > 0 &&
          Number.isFinite(item.unit_price) &&
          item.unit_price > 0
      );
  }, [sanitizedCart]);

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

  useEffect(() => {
    if (invalidCartItems.length > 0) {
      console.error("Hay items inválidos en el carrito:", invalidCartItems);
    }
  }, [invalidCartItems]);

  if (loading || !hasHydrated) {
    return <div>Cargando checkout...</div>;
  }

  if (!cart.length) {
    return <div>Tu carrito está vacío.</div>;
  }

  if (!sanitizedCart.length) {
    return (
      <div className="rounded-2xl border border-red-800 bg-red-950/40 p-4 text-red-200">
        Hay productos inválidos en el carrito. Vacialo y volvé a agregarlos.
        <div className="mt-3">
          <button
            type="button"
            onClick={clearCart}
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Vaciar carrito
          </button>
        </div>
      </div>
    );
  }

  if (provider === "mercadopago" && isArgentina && !mpItems.length) {
    return (
      <div className="rounded-2xl border border-red-800 bg-red-950/40 p-4 text-red-200">
        No se pudieron preparar los ítems para Mercado Pago.
      </div>
    );
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

                <MercadoPagoWalletBrick items={mpItems} payer={payer} />
              </div>
            )}
          </div>
        )}

        {provider === "paypal" && (
          <div>
            <p className="mb-3 text-sm text-zinc-400">
              Checkout internacional en USD.
            </p>

            {/* <PaypalCheckout items={paypalItems} payer={payer} /> */}
          </div>
        )}
      </div>
    </div>
  );
}