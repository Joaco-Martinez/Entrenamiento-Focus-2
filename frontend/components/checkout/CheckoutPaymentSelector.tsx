"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import MercadoPagoPaymentBrick from "./MercadoPagoPaymentBrick";
import MercadoPagoWalletBrick from "./MercadoPagoWalletBrick";

type PaymentProvider = "mercadopago" | "paypal";
type MercadoPagoMethod = "card" | "wallet";

type CreatedOrder = {
  id: string;
  totalAmount: number;
  currency: "ARS" | "USD";
  status: "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";
};

export default function CheckoutPaymentSelector() {
  const { cart, hasHydrated, getSubtotalByCountry, clearCart } = useCart();
  const { user, country, loading, fullName } = useAuth();

  const normalizedCountry = (country || "arg").toLowerCase();
  const isArgentina = normalizedCountry === "arg" || normalizedCountry === "ar";

  const [provider, setProvider] = useState<PaymentProvider>(
    isArgentina ? "mercadopago" : "paypal"
  );
  const [mpMethod, setMpMethod] = useState<MercadoPagoMethod>("card");
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [paymentReady, setPaymentReady] = useState(false);

  const lastOrderSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;
    setProvider(isArgentina ? "mercadopago" : "paypal");
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

  const orderPayloadItems = useMemo(() => {
    return sanitizedCart.map((item) => ({
      productId: item.id,
      quantity: Number(item.quantity),
    }));
  }, [sanitizedCart]);

  const orderSignature = useMemo(() => {
    return JSON.stringify({
      country: normalizedCountry,
      provider,
      mpMethod,
      items: orderPayloadItems,
    });
  }, [normalizedCountry, provider, mpMethod, orderPayloadItems]);

  useEffect(() => {
    if (invalidCartItems.length > 0) {
      console.error("Hay items inválidos en el carrito:", invalidCartItems);
    }
  }, [invalidCartItems]);

  useEffect(() => {
    // Si cambia el carrito / país / método, invalidamos la orden actual en frontend
    if (lastOrderSignatureRef.current && lastOrderSignatureRef.current !== orderSignature) {
      setCreatedOrder(null);
      setPaymentReady(false);
      setOrderError(null);
    }
  }, [orderSignature]);

  const createPendingOrder = async () => {
    if (!user) {
      setOrderError("Tenés que iniciar sesión para continuar.");
      return null;
    }

    if (!sanitizedCart.length) {
      setOrderError("No hay productos válidos en el carrito.");
      return null;
    }

    // Si ya existe una orden válida para esta firma actual, no la recreamos
    if (
      createdOrder &&
      lastOrderSignatureRef.current === orderSignature
    ) {
      setPaymentReady(true);
      return createdOrder;
    }

    try {
      setIsCreatingOrder(true);
      setOrderError(null);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country: normalizedCountry,
          items: orderPayloadItems,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.order) {
        throw new Error(data?.message || "No se pudo crear la orden");
      }

      setCreatedOrder(data.order);
      setPaymentReady(true);
      lastOrderSignatureRef.current = orderSignature;

      return data.order as CreatedOrder;
    } catch (error) {
      console.error("Error creando la orden:", error);
      setCreatedOrder(null);
      setPaymentReady(false);
      setOrderError(
        error instanceof Error ? error.message : "No se pudo crear la orden"
      );
      return null;
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePreparePayment = async () => {
    await createPendingOrder();
  };

  if (loading || !hasHydrated) {
    return <div>Cargando checkout...</div>;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-red-800 bg-red-950/40 p-4 text-red-200">
        Tenés que iniciar sesión para continuar con el pago.
      </div>
    );
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
              onClick={() => {
                setProvider("mercadopago");
                setPaymentReady(false);
              }}
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
            onClick={() => {
              setProvider("paypal");
              setPaymentReady(false);
            }}
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
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMpMethod("card");
                setPaymentReady(false);
              }}
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
              onClick={() => {
                setMpMethod("wallet");
                setPaymentReady(false);
              }}
              className={`rounded-xl px-4 py-2 text-sm ${
                mpMethod === "wallet"
                  ? "bg-white text-black"
                  : "border border-zinc-700 bg-zinc-900 text-zinc-300"
              }`}
            >
              Mercado Pago directo
            </button>
          </div>
        )}

        {!paymentReady && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handlePreparePayment}
              disabled={isCreatingOrder}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingOrder ? "Preparando orden..." : "Continuar al pago"}
            </button>
          </div>
        )}

        {orderError && (
          <div className="mb-4 rounded-xl border border-red-800 bg-red-950/40 p-3 text-sm text-red-200">
            {orderError}
          </div>
        )}

        {createdOrder && paymentReady && (
          <div className="mb-4 rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-300">
            Orden creada: <span className="font-semibold">{createdOrder.id}</span>
          </div>
        )}

        {provider === "mercadopago" && isArgentina && (
          <div className="space-y-4">
            {!paymentReady || !createdOrder || isCreatingOrder ? (
              <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-sm text-zinc-300">
                Tocá <span className="font-semibold">“Continuar al pago”</span> para crear la orden y habilitar Mercado Pago.
              </div>
            ) : (
              <>
                {mpMethod === "card" && (
                  <div>
                    <p className="mb-3 text-sm text-zinc-400">
                      Pagás con tarjeta dentro de la web.
                    </p>

                    <MercadoPagoPaymentBrick
                      amount={amount}
                      items={mpItems}
                      payer={payer}
                      orderId={createdOrder.id}
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
                      orderId={createdOrder.id}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {provider === "paypal" && (
          <div>
            <p className="mb-3 text-sm text-zinc-400">
              Checkout internacional en USD.
            </p>

            {!paymentReady || !createdOrder || isCreatingOrder ? (
              <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-sm text-zinc-300">
                Tocá <span className="font-semibold">“Continuar al pago”</span> para crear la orden y habilitar PayPal.
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-sm text-zinc-300">
                Orden lista para PayPal: {createdOrder.id}
                {/* <PaypalCheckout items={paypalItems} payer={payer} orderId={createdOrder.id} /> */}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}