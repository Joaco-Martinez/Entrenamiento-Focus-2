"use client";

import { useEffect, useMemo, useState } from "react";
import MercadoPagoStatusScreenBrick from "./MercadoPagoStatusScreenBrick";

declare global {
  interface Window {
    MercadoPago: any;
    paymentBrickController?: {
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
  amount: number;
  items: MpItem[];
  payer: Payer;
  orderId: string;
};

const SCRIPT_ID = "mercadopago-sdk-payment";

export default function MercadoPagoPaymentBrick({
  amount,
  items,
  payer,
  orderId,
}: Props) {
  const [sdkReady, setSdkReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentId, setPaymentId] = useState<string | number | null>(null);
  const [paymentMessage, setPaymentMessage] = useState("");
  const containerId = useMemo(() => "paymentBrick_container", []);

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
    if (!amount || amount <= 0) return;
    if (!Array.isArray(items) || items.length === 0) return;
    if (!orderId) return;
    if (paymentId) return;

    const publicKey = process.env.NEXT_PUBLIC_MP_BRICKS_PUBLIC_KEY;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!publicKey || !apiUrl) {
      console.error("Faltan NEXT_PUBLIC_MP_BRICKS_PUBLIC_KEY o NEXT_PUBLIC_API_URL");
      return;
    }

    const normalizedItems = items.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        item.id.trim() !== "" &&
        typeof item.title === "string" &&
        item.title.trim() !== "" &&
        Number.isFinite(Number(item.quantity)) &&
        Number(item.quantity) > 0 &&
        Number.isFinite(Number(item.unit_price)) &&
        Number(item.unit_price) > 0
    );

    if (!normalizedItems.length) {
      console.error("No hay items válidos para Mercado Pago");
      return;
    }

    const mp = new window.MercadoPago(publicKey, {
      locale: "es-AR",
    });

    const bricksBuilder = mp.bricks();

    const renderBrick = async () => {
      try {
        await window.paymentBrickController?.unmount?.();
      } catch {}

      window.paymentBrickController = await bricksBuilder.create(
        "payment",
        containerId,
        {
          initialization: {
            amount: Number(amount),
            payer: {
              firstName: payer.firstName || "",
              lastName: payer.lastName || "",
              email: payer.email || "",
            },
          },
          customization: {
            visual: {
              style: {
                theme: "dark",
                customVariables: {
                  textPrimaryColor: "#F5F5F7",
                  textSecondaryColor: "#A1A1AA",
                  inputBackgroundColor: "#111111",
                  formBackgroundColor: "#0A0A0A",
                  baseColor: "#EAB308",
                  baseColorFirstVariant: "#FACC15",
                  baseColorSecondVariant: "#CA8A04",
                  errorColor: "#EF4444",
                  successColor: "#22C55E",
                  outlinePrimaryColor: "#27272A",
                  outlineSecondaryColor: "#3F3F46",
                  buttonTextColor: "#0A0A0A",
                  fontSizeExtraSmall: "12px",
                  fontSizeSmall: "14px",
                  fontSizeMedium: "16px",
                  fontSizeLarge: "20px",
                  fontSizeExtraLarge: "28px",
                  fontWeightNormal: "400",
                  fontWeightSemiBold: "600",
                  formInputsTextTransform: "none",
                  inputVerticalPadding: "14px",
                  inputHorizontalPadding: "16px",
                  inputFocusedBoxShadow: "0 0 0 3px rgba(234,179,8,0.18)",
                  inputErrorFocusedBoxShadow: "0 0 0 3px rgba(239,68,68,0.20)",
                  inputBorderWidth: "1px",
                  inputFocusedBorderWidth: "1px",
                  borderRadiusSmall: "10px",
                  borderRadiusMedium: "14px",
                  borderRadiusLarge: "20px",
                  borderRadiusFull: "999px",
                  formPadding: "24px",
                },
              },
              texts: {
                formTitle: "Completá tu pago",
                emailSectionTitle: "Tu correo electrónico",
                installmentsSectionTitle: "Elegí cómo pagar",
                cardholderName: {
                  label: "Nombre del titular",
                  placeholder: "Como figura en la tarjeta",
                },
                email: {
                  label: "Correo electrónico",
                  placeholder: "tuemail@ejemplo.com",
                },
                cardNumber: {
                  label: "Número de tarjeta",
                  placeholder: "0000 0000 0000 0000",
                },
                expirationDate: {
                  label: "Vencimiento",
                  placeholder: "MM/AA",
                },
                securityCode: {
                  label: "Código de seguridad",
                  placeholder: "123",
                },
                formSubmit: "Pagar ahora",
              },
            },
            paymentMethods: {
              creditCard: "all",
              debitCard: "all",
              prepaidCard: "all",
              maxInstallments: 1,
            },
          },
          callbacks: {
            onReady: () => {
              console.log("Payment Brick listo");
            },
            onSubmit: ({ formData }: { formData: any }) => {
              return new Promise<void>(async (resolve, reject) => {
                try {
                  setSubmitting(true);
                  setPaymentMessage("");

                  const payload = {
                    ...formData,
                    orderId,
                    items: normalizedItems,
                    amount: Number(amount),
                    description: normalizedItems.map((item) => item.title).join(", "),
                  };

                  const response = await fetch(
                    `${apiUrl}/mercadopago_checkout/process-payment`,
                    {
                      method: "POST",
                      credentials: "include",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(payload),
                    }
                  );

                  const data = await response.json();

                  if (data?.paymentId) {
                    setPaymentId(data.paymentId);
                  }

                  if (!response.ok) {
                    setPaymentMessage(
                      data?.statusDetail ||
                        data?.message ||
                        "No se pudo procesar el pago."
                    );
                    reject(data);
                    return;
                  }

                  setPaymentMessage(data?.message || "");
                  resolve();
                } catch (error) {
                  console.error(error);
                  setPaymentMessage("Ocurrió un error al procesar el pago.");
                  reject(error);
                } finally {
                  setSubmitting(false);
                }
              });
            },
            onError: (error: any) => {
              console.error("Error Payment Brick:", error);
              setPaymentMessage(
                error?.message || "Hubo un error en el formulario de pago."
              );
            },
          },
        }
      );
    };

    renderBrick();

    return () => {
      try {
        window.paymentBrickController?.unmount?.();
      } catch {}
    };
  }, [sdkReady, amount, payer, items, containerId, paymentId, orderId]);

if (paymentId) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <MercadoPagoStatusScreenBrick paymentId={paymentId} />
    </div>
  );
}

return (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
    <p className="mb-3 text-sm text-white/60">
      Pagás con tarjeta dentro de la web.
    </p>

    {submitting && (
      <p className="mb-3 text-sm text-white/45">Procesando pago...</p>
    )}

    {paymentMessage && !paymentId && (
      <div className="mb-3 rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
        {paymentMessage}
      </div>
    )}

    <div id={containerId} />
  </div>
);
}