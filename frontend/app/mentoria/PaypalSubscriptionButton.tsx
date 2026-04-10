"use client";

import { useEffect, useRef } from "react";
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
};

let paypalSdkPromise: Promise<void> | null = null;

function loadPaypalSdk(clientId: string) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window no disponible"));
  }

  if (!clientId) {
    return Promise.reject(new Error("Falta NEXT_PUBLIC_PAYPAL_CLIENT_ID"));
  }

  if (window.paypal) {
    return Promise.resolve();
  }

  if (paypalSdkPromise) {
    return paypalSdkPromise;
  }

  paypalSdkPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[data-paypal-sdk="subscription"]'
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (window.paypal) {
        resolve();
        return;
      }

      const handleLoad = () => {
        if (window.paypal) {
          resolve();
        } else {
          reject(new Error("PayPal SDK no disponible"));
        }
      };

      const handleError = () => {
        reject(new Error("No se pudo cargar el SDK de PayPal"));
      };

      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      clientId
    )}&vault=true&intent=subscription&locale=es_AR`;
    script.async = true;
    script.setAttribute("data-paypal-sdk", "subscription");

    script.onload = () => {
      if (window.paypal) {
        resolve();
      } else {
        reject(new Error("PayPal SDK no disponible"));
      }
    };

    script.onerror = () => {
      reject(new Error("No se pudo cargar el SDK de PayPal"));
    };

    document.body.appendChild(script);
  }).catch((error) => {
    paypalSdkPromise = null;
    throw error;
  });

  return paypalSdkPromise;
}

export default function PaypalSubscriptionButton({
  planId,
  clientId,
  disabled = false,
  onRequireAuth,
  onError,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderedRef = useRef(false);
  const destroyedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    destroyedRef.current = false;
    renderedRef.current = false;

    const renderButton = async () => {
      try {
        await loadPaypalSdk(clientId);

        if (destroyedRef.current) return;
        if (renderedRef.current) return;
        if (!containerRef.current) return;
        if (!containerRef.current.isConnected) return;
        if (!window.paypal?.Buttons) {
          throw new Error("PayPal SDK no disponible");
        }

        containerRef.current.innerHTML = "";
        renderedRef.current = true;

        await window.paypal
          .Buttons({
            style: {
              shape: "pill",
              color: "silver",
              layout: "vertical",
              label: "subscribe",
            },

            onClick: () => {
              if (disabled) return false;

              if (onRequireAuth) {
                const autorizado = onRequireAuth();
                if (!autorizado) return false;
              }

              return true;
            },

            createSubscription: (_data: any, actions: any) => {
              if (!planId) {
                throw new Error("Falta NEXT_PUBLIC_PAYPAL_PLAN_ID");
              }

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
              console.error("Error de suscripción PayPal:", err);
              onError?.("Ocurrió un error al iniciar la suscripción con PayPal");
            },
          })
          .render(containerRef.current);
      } catch (error) {
        renderedRef.current = false;

        const message =
          error instanceof Error
            ? error.message
            : "Error cargando el botón de PayPal";

        onError?.(message);
      }
    };

    renderButton();

    return () => {
      destroyedRef.current = true;
    };
  }, [clientId, planId, disabled, onRequireAuth, onError, router]);

  return (
    <div className="w-full max-w-[320px]">
      <div
        ref={containerRef}
        className={disabled ? "pointer-events-none opacity-60" : ""}
      />
    </div>
  );
}