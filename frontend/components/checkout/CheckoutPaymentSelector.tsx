"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CreditCard, Wallet, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import MercadoPagoPaymentBrick from "./MercadoPagoPaymentBrick";
import MercadoPagoWalletBrick from "./MercadoPagoWalletBrick";
import PaypalCheckout from "./PaypalCheckout";

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
  const isArgentina =
    normalizedCountry === "arg" ||
    normalizedCountry === "ar" ||
    normalizedCountry === "argentina";

  const [provider, setProvider] = useState<PaymentProvider>(
    isArgentina ? "mercadopago" : "paypal"
  );
  const [mpMethod, setMpMethod] = useState<MercadoPagoMethod>("card");
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [paymentReady, setPaymentReady] = useState(false);

  const lastOrderSignatureRef = useRef<string | null>(null);
  const initialProviderSetRef = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (initialProviderSetRef.current) return;

    setProvider(isArgentina ? "mercadopago" : "paypal");
    initialProviderSetRef.current = true;
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
  const currency = isArgentina ? "ARS" : "USD";

  const formattedAmount = useMemo(() => {
    return new Intl.NumberFormat(currency === "ARS" ? "es-AR" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  }, [amount, currency]);

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
    if (
      lastOrderSignatureRef.current &&
      lastOrderSignatureRef.current !== orderSignature
    ) {
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

    if (provider === "mercadopago" && isArgentina && !mpItems.length) {
      setOrderError("No se pudieron preparar los ítems de Mercado Pago.");
      return null;
    }

    if (provider === "paypal" && !paypalItems.length) {
      setOrderError("No se pudieron preparar los ítems de PayPal.");
      return null;
    }

    if (createdOrder && lastOrderSignatureRef.current === orderSignature) {
      setPaymentReady(true);
      return createdOrder;
    }

    try {
      setIsCreatingOrder(true);
      setOrderError(null);

      const payload = {
        country: normalizedCountry,
        provider: provider === "mercadopago" ? "MERCADOPAGO" : "PAYPAL",
        items: orderPayloadItems,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const order = data?.order || data?.content || data;

      if (!res.ok || !order?.id) {
        throw new Error(data?.message || "No se pudo crear la orden");
      }

      setCreatedOrder(order as CreatedOrder);
      setPaymentReady(true);
      lastOrderSignatureRef.current = orderSignature;

      return order as CreatedOrder;
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
      <div className="mt-20 rounded-2xl border border-red-800 bg-red-950/40 p-4 text-red-200">
        Tenés que iniciar sesión para continuar con el pago.
      </div>
    );
  }

  if (!cart.length) {
    return <div>Tu carrito está vacío.</div>;
  }

  if (!sanitizedCart.length) {
    return (
      <div className="mt-20  rounded-2xl border border-red-800 bg-red-950/40 p-4 text-red-200">
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
      <div className="mt-20  rounded-2xl border border-red-800 bg-red-950/40 p-4 text-red-200">
        No se pudieron preparar los ítems para Mercado Pago.
      </div>
    );
  }

  if (provider === "paypal" && !paypalItems.length) {
    return (
      <div className="mt-20  rounded-2xl border border-red-800 bg-red-950/40 p-4 text-red-200">
        No se pudieron preparar los ítems para PayPal.
      </div>
    );
  }

  return (
    <div className="mt-20  space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-[#090909] p-4 text-white shadow-[0_20px_80px_rgba(0,0,0,0.35)] md:p-6">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
            Método de pago seguro
          </p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">
            Elegí cómo pagar
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {isArgentina && (
            <button
              type="button"
              onClick={() => {
                setProvider("mercadopago");
                setPaymentReady(false);
              }}
              className={`rounded-2xl border p-4 text-left transition ${
                provider === "mercadopago"
                  ? "border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(255,190,0,0.15)]"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      provider === "mercadopago"
                        ? "bg-primary/15 text-primary"
                        : "bg-white/5 text-white/70"
                    }`}
                  >
                    <Wallet className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-base font-bold text-white">
                      Mercado Pago
                    </p>
                    <p className="text-sm text-white/55">Pesos argentinos</p>
                  </div>
                </div>

                {provider === "mercadopago" && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setProvider("paypal");
              setPaymentReady(false);
            }}
            className={`rounded-2xl border p-4 text-left transition ${
              provider === "paypal"
                ? "border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(255,190,0,0.15)]"
                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    provider === "paypal"
                      ? "bg-primary/15 text-primary"
                      : "bg-white/5 text-white/70"
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-base font-bold text-white">PayPal</p>
                  <p className="text-sm text-white/55">Dólares estadounidenses</p>
                </div>
              </div>

              {provider === "paypal" && (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              )}
            </div>
          </button>
        </div>

        {provider === "mercadopago" && isArgentina && (
          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              Cómo querés pagar
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setMpMethod("card");
                  setPaymentReady(false);
                }}
                className={`rounded-2xl border p-4 text-left transition ${
                  mpMethod === "card"
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                }`}
              >
                <p className="font-semibold text-white">Tarjeta</p>
                <p className="mt-1 text-sm text-white/55">
                  Pagás dentro de la web
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMpMethod("wallet");
                  setPaymentReady(false);
                }}
                className={`rounded-2xl border p-4 text-left transition ${
                  mpMethod === "wallet"
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                }`}
              >
                <p className="font-semibold text-white">Mercado Pago directo</p>
                <p className="mt-1 text-sm text-white/55">
                  Vas al checkout de Mercado Pago
                </p>
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/50">Vas a pagar con</p>
              <p className="mt-1 text-lg font-bold text-white">
                {provider === "mercadopago"
                  ? mpMethod === "wallet"
                    ? "Mercado Pago directo"
                    : "Mercado Pago"
                  : "PayPal"}
              </p>
              <p className="mt-1 text-sm text-white/45">
                {currency === "ARS" ? "Pesos argentinos" : "Dólares estadounidenses"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-white/50">Total</p>
              <p className="mt-1 text-3xl font-extrabold text-primary">
                {formattedAmount}
              </p>
            </div>
          </div>

          {!paymentReady && (
            <button
              type="button"
              onClick={handlePreparePayment}
              disabled={isCreatingOrder}
              className="mt-5 inline-flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[0_14px_40px_rgba(255,190,0,0.22)] transition hover:scale-[1.01] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingOrder ? "Preparando orden..." : `Continuar al pago`}
            </button>
          )}

          {!paymentReady && (
            <p className="mt-3 text-center text-xs text-white/40">
              Primero creamos tu orden y después habilitamos el medio de pago.
            </p>
          )}
        </div>

        {orderError && (
          <div className="mt-5 rounded-2xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-200">
            {orderError}
          </div>
        )}

        {createdOrder && paymentReady && (
          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-white/85">
            Orden creada:{" "}
            <span className="font-semibold text-primary">{createdOrder.id}</span>
          </div>
        )}

        <div className="mt-6">
          {provider === "mercadopago" && isArgentina && (
            <div className="space-y-4">
              {!paymentReady || !createdOrder || isCreatingOrder ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">
                  Tocá <span className="font-semibold text-white">“Continuar al pago”</span>{" "}
                  para crear la orden y habilitar Mercado Pago.
                </div>
              ) : mpMethod === "card" ? (
                <MercadoPagoPaymentBrick
                  amount={amount}
                  items={mpItems}
                  payer={payer}
                  orderId={createdOrder.id}
                />
              ) : (
                <MercadoPagoWalletBrick
                  items={mpItems}
                  payer={payer}
                  orderId={createdOrder.id}
                />
              )}
            </div>
          )}

          {provider === "paypal" && (
            <div>
              {!paymentReady || !createdOrder || isCreatingOrder ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">
                  Tocá <span className="font-semibold text-white">“Continuar al pago”</span>{" "}
                  para crear la orden y habilitar PayPal.
                </div>
              ) : (
                <PaypalCheckout orderId={createdOrder.id} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}