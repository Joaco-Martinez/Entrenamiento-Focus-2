"use client";

import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    MercadoPago: any;
    statusScreenBrickController?: {
      unmount?: () => Promise<void> | void;
    };
  }
}

type Props = {
  paymentId: string | number;
};

const SCRIPT_ID = "mercadopago-sdk-status-screen";

export default function MercadoPagoStatusScreenBrick({ paymentId }: Props) {
  const [sdkReady, setSdkReady] = useState(false);
  const containerId = useMemo(() => "statusScreenBrick_container", []);

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
    if (!paymentId) return;

    const publicKey = process.env.NEXT_PUBLIC_MP_BRICKS_PUBLIC_KEY;

    if (!publicKey) {
      console.error("Falta NEXT_PUBLIC_MP_BRICKS_PUBLIC_KEY");
      return;
    }

    const mp = new window.MercadoPago(publicKey, {
      locale: "es-AR",
    });

    const bricksBuilder = mp.bricks();

    const renderBrick = async () => {
      try {
        await window.statusScreenBrickController?.unmount?.();
      } catch {}

      const settings = {
        initialization: {
          paymentId: String(paymentId),
        },
        customization: {
          visual: {
            hideStatusDetails: false,
            hideTransactionDate: false,
            style: {
              theme: "dark",
            },
          },
          backUrls: {
            error: `${window.location.origin}/checkout/failure`,
            return: `${window.location.origin}/checkout`,
          },
        },
        callbacks: {
          onReady: () => {
            console.log("Status Screen Brick listo");
          },
          onError: (error: any) => {
            console.error("Error Status Screen Brick:", error);
          },
        },
      };

      window.statusScreenBrickController = await bricksBuilder.create(
        "statusScreen",
        containerId,
        settings
      );
    };

    renderBrick();

    return () => {
      try {
        window.statusScreenBrickController?.unmount?.();
      } catch {}
    };
  }, [sdkReady, paymentId, containerId]);

  return <div id={containerId} />;
}