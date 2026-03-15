"use client";

import { useState } from "react";

type Props = {
  checkoutUrl: string;
  user: {
    email: string;
  };
  disabled?: boolean;
  onRequireAuth?: () => boolean;
  onError?: (message: string) => void;
};


export default function MercadoPagoSubscriptionButton({
  checkoutUrl,
  disabled,
  onRequireAuth,
  onError,
    user,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function subscribe() {

  const res = await fetch(
    "/api/payments/mercadopago/subscriptions/create",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email
      }),
    }
  );

  const data = await res.json();

  window.location.href = data.init_point;
}

  const handleClick = () => {
    try {
      if (onRequireAuth) {
        const isAuth = onRequireAuth();
        if (!isAuth) return;
      }

      setLoading(true);

      window.location.href = checkoutUrl;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo iniciar la suscripción";

      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className="inline-flex min-w-[260px] items-center justify-center rounded-2xl border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading
        ? "Redirigiendo a Mercado Pago..."
        : "Suscribirme con Mercado Pago"}
    </button>
  );
}