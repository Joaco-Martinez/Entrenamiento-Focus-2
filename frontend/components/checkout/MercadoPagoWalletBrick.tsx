"use client";

import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    MercadoPago: any;
    walletBrickController?: {
      unmount?: () => Promise<void> | void;
    };
  }
}

type MpItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: "ARS";
  description?: string;
  picture_url?: string;
};

type Payer = {
  firstName?: string;
  lastName?: string;
  email?: string;
  fullName?: string;
};

type Props = {
  items: MpItem[];
  payer: Payer;
  orderId: string;
};

const SCRIPT_ID = "mercadopago-sdk-wallet";

export default function MercadoPagoWalletBrick({
  items,
  payer,
  orderId,
}: Props) {
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerId = useMemo(() => "walletBrick_container", []);

  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) {
      setSdkReady(true);
      return;
    }

    const existingSdk = document.querySelector(
      'script[src="https://sdk.mercadopago.com/js/v2"]'
    );

    if (existingSdk) {
      setSdkReady(true);
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => setSdkReady(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!sdkReady) return;
    if (!window.MercadoPago) return;
    if (!items.length) return;
    if (!orderId) return;

    const publicKey = process.env.NEXT_PUBLIC_MP_BRICKS_PUBLIC_KEY;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!publicKey || !apiUrl) {
      console.error(
        "Faltan NEXT_PUBLIC_MP_BRICKS_PUBLIC_KEY o NEXT_PUBLIC_API_URL"
      );
      return;
    }

    const mp = new window.MercadoPago(publicKey, {
      locale: "es-AR",
    });

    const bricksBuilder = mp.bricks();

    const renderWalletBrick = async () => {
      setLoading(true);

      try {
        await window.walletBrickController?.unmount?.();

        const response = await fetch(
          `${apiUrl}/mercadopago_checkout/create-preference`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId,
              items,
              payer,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data?.preferenceId) {
          console.error("Error create preference:", data);
          return;
        }

        window.walletBrickController = await bricksBuilder.create(
          "wallet",
          containerId,
          {
            initialization: {
              preferenceId: data.preferenceId,
            },
            customization: {
              texts: {
                valueProp: "Pagar con Mercado Pago",
              },
            },
            callbacks: {
              onReady: () => {
                console.log("Wallet Brick listo");
              },
              onError: (error: any) => {
                console.error("Error Wallet Brick:", error);
              },
            },
          }
        );
      } catch (error) {
        console.error("Error renderizando Wallet Brick:", error);
      } finally {
        setLoading(false);
      }
    };

    renderWalletBrick();

    return () => {
      try {
        window.walletBrickController?.unmount?.();
      } catch {}
    };
  }, [sdkReady, items, payer, containerId, orderId]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-3 text-sm text-white/60">
        Vas al checkout de Mercado Pago.
      </p>

      {loading && (
        <p className="mb-3 text-sm text-white/45">
          Preparando Mercado Pago...
        </p>
      )}

      <div id={containerId} />
    </div>
  );
}