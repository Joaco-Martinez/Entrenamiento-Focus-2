"use client";

import { useState } from "react";
import { apiFetch } from "../../lib/api";

type Props = {
  checkoutUrl: string;
  productId: string;
  planId: string;
  disabled?: boolean;
  onRequireAuth?: () => boolean;
  onError?: (msg: string) => void;
};

export default function MercadoPagoSubscriptionButton({
  checkoutUrl,
  productId,
  planId,
  disabled = false,
  onRequireAuth,
  onError,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      if (disabled || loading) return;

      if (onRequireAuth) {
        const ok = onRequireAuth();
        if (!ok) return;
      }

      setLoading(true);

      await apiFetch("/mp-link-subscriptions/intent", {
        method: "POST",
        body: JSON.stringify({
          productId,
          checkoutUrl,
          planId,
        }),
      });

      window.location.href = checkoutUrl;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo iniciar la suscripción con Mercado Pago";

      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className="inline-flex h-12 w-[270px] items-center justify-center gap-2 rounded-[30px] border border-[#1f1f1f] bg-[#1f1f1f] px-0 py-2 text-[15px] font-semibold text-white transition hover:bg-[#151515] disabled:opacity-60"
      >
        <img
          src="https://res.cloudinary.com/deb7jg37j/image/upload/v1773600142/mercadopago-white_g42ckf.png"
          alt="Mercado Pago"
          className="h-8 w-auto"
        />
      </button>

      <span className="mt-2 text-[11px] font-medium text-white/70">
        {loading ? "Redirigiendo..." : "Pagá de forma segura"}
      </span>
    </div>
  );
}