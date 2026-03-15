"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    paypal?: any;
  }
}

type Props = {
  planId: string;
  clientId: string;
  disabled?: boolean;
  onRequireAuth?: () => boolean;
  onError?: (message: string) => void;
  onLoadingChange?: (loading: boolean) => void;
};

export default function PaypalSubscriptionButton({
  planId,
  clientId,
  disabled = false,
  onRequireAuth,
  onError,
  onLoadingChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [buttonsRendered, setButtonsRendered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!clientId) {
      onError?.("Falta configurar NEXT_PUBLIC_PAYPAL_CLIENT_ID");
      return;
    }

    const existingScript = document.querySelector(
      'script[data-paypal-sdk="subscription"]'
    ) as HTMLScriptElement | null;

    const handleLoad = () => setSdkReady(true);

    if (existingScript) {
      if (window.paypal) {
        setSdkReady(true);
      } else {
        existingScript.addEventListener("load", handleLoad);
      }

      return () => {
        existingScript.removeEventListener("load", handleLoad);
      };
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.async = true;
    script.setAttribute("data-paypal-sdk", "subscription");
    script.onload = handleLoad;
    script.onerror = () => {
      onError?.("No se pudo cargar el SDK de PayPal");
      onLoadingChange?.(false);
    };

    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [clientId, onError, onLoadingChange]);

  useEffect(() => {
    if (!sdkReady || !containerRef.current || buttonsRendered) return;
    if (!window.paypal?.Buttons) return;

    containerRef.current.innerHTML = "";
    onLoadingChange?.(true);

    window.paypal
      .Buttons({
        style: {
          shape: "pill",
          color: "silver",
          layout: "vertical",
          label: "subscribe",
        },

        onClick: () => {
          if (disabled) {
            return false;
          }

          if (onRequireAuth) {
            const allowed = onRequireAuth();
            if (!allowed) return false;
          }

          return true;
        },

        createSubscription: (_data: any, actions: any) => {
          return actions.subscription.create({
            plan_id: planId,
          });
        },

        onApprove: async (data: any) => {
          try {
            const subscriptionId = data?.subscriptionID;

            if (!subscriptionId) {
              throw new Error("PayPal no devolvió subscriptionID");
            }

            router.push(
              `/mentoria/success?provider=paypal&subscription_id=${subscriptionId}`
            );
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "No se pudo confirmar la suscripción con PayPal";

            onError?.(message);
          }
        },

        onError: (err: any) => {
          console.error("PayPal subscription error:", err);
          onError?.("Ocurrió un error al iniciar la suscripción con PayPal");
        },
      })
      .render(containerRef.current)
      .then(() => {
        setButtonsRendered(true);
      })
      .catch((err: any) => {
        console.error("PayPal render error:", err);
        onError?.("No se pudo renderizar el botón de PayPal");
      })
      .finally(() => {
        onLoadingChange?.(false);
      });
  }, [
    sdkReady,
    buttonsRendered,
    planId,
    disabled,
    onRequireAuth,
    onError,
    onLoadingChange,
    router,
  ]);

  return (
    <div className="w-full max-w-[320px]">
      <div
        ref={containerRef}
        className={disabled ? "pointer-events-none opacity-60" : ""}
      />
    </div>
  );
}
