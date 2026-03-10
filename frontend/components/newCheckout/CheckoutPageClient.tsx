"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import CheckoutCountrySelector from "@/components/checkout/CheckoutCountrySelector";
import CheckoutPaymentSection from "@/components/newCheckout/CheckoutPaymentSection";
import CheckoutSummary from "@/components/newCheckout/CheckoutSummary";
import EmptyCheckoutState from "@/components/checkout/EmptyCheckoutState";
import CheckoutLoading from "@/components/checkout/CheckoutLoading";

export type CheckoutCountry = "arg" | "other";

export default function CheckoutPageClient() {
  const {
    cart,
    totalItems,
    hasHydrated,
    getSubtotalByCountry,
    getCurrencyByCountry,
  } = useCart();

  const { user, country, fullName } = useAuth();

  const [selectedCountry, setSelectedCountry] = useState<CheckoutCountry | null>(null);
  const [preferenceId, setPreferenceId] = useState("");
  const [creatingPreference, setCreatingPreference] = useState(false);

  const resolvedCountry = useMemo<CheckoutCountry | null>(() => {
    const c = (country || user?.country || "").toLowerCase();

    if (c === "arg" || c === "ar" || c === "argentina") return "arg";
    if (c) return "other";

    return selectedCountry;
  }, [country, user?.country, selectedCountry]);

  const checkoutCurrency = resolvedCountry ? getCurrencyByCountry(resolvedCountry) : "USD";
  const subtotal = resolvedCountry ? getSubtotalByCountry(resolvedCountry) : 0;

  useEffect(() => {
    const createPreference = async () => {
      if (!hasHydrated) return;
      if (!cart.length) return;
      if (!resolvedCountry) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      if (resolvedCountry === "other") {
        setPreferenceId("");
        setCreatingPreference(false);

        console.log("Checkout internacional pendiente de PayPal:", {
          currency: "USD",
          items: cart.map((item) => ({
            id: item.id,
            title: item.title,
            quantity: Number(item.quantity),
            unit_price: Number(item.usdPrice ?? 0),
            currency_id: "USD",
            description: item.description || item.title,
          })),
        });

        return;
      }

      try {
        setCreatingPreference(true);
        setPreferenceId("");

        const items = cart.map((item) => {
          const unitPrice = Number(item.arPrice);

          if (!item.id) {
            throw new Error(`Producto inválido sin id: ${item.title}`);
          }

          if (Number.isNaN(unitPrice) || unitPrice <= 0) {
            throw new Error(`Precio ARS inválido para ${item.title}`);
          }

          return {
            id: item.id,
            title: item.title,
            quantity: Number(item.quantity),
            unit_price: unitPrice,
            currency_id: "ARS",
            description: item.description || item.title,
          };
        });

        const res = await fetch(
          `${apiUrl}/mp_checkout/create_preference`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items,
              currency: "ARS",
            }),
          }
        );

        const data = await res.json();

        if (data?.ok && data?.preferenceId) {
          setPreferenceId(String(data.preferenceId));
        } else {
          console.error("Respuesta inválida al crear preference:", data);
          setPreferenceId("");
        }
      } catch (error) {
        console.error("Error creando preference de MP:", error);
        setPreferenceId("");
      } finally {
        setCreatingPreference(false);
      }
    };

    createPreference();
  }, [cart, hasHydrated, resolvedCountry]);

  if (!hasHydrated) return <CheckoutLoading />;
  if (!cart.length) return <EmptyCheckoutState />;

  return (
    <section className="min-h-screen bg-[#050505] px-4 py-10 text-white sm:px-6 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <CheckoutHeader fullName={fullName} totalItems={totalItems} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_340px] xl:items-start">
          <div>
            {!resolvedCountry ? (
              <CheckoutCountrySelector onSelect={setSelectedCountry} />
            ) : (
              <CheckoutPaymentSection
                resolvedCountry={resolvedCountry}
                preferenceId={preferenceId}
                subtotal={subtotal}
                cart={cart}
                userEmail={user?.email}
                creatingPreference={creatingPreference}
                onChangeCountry={() => {
                  setSelectedCountry(null);
                  setPreferenceId("");
                }}
              />
            )}
          </div>

          <CheckoutSummary
            cart={cart}
            subtotal={subtotal}
            currency={checkoutCurrency}
          />
        </div>
      </div>
    </section>
  );
}