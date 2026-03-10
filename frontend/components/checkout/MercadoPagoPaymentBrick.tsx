"use client";

import { useEffect, useMemo, useState } from "react";

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
};

const SCRIPT_ID = "mercadopago-sdk-payment";

export default function MercadoPagoPaymentBrick({
  amount,
  items,
  payer,
}: Props) {
  const [sdkReady, setSdkReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const containerId = useMemo(() => "paymentBrick_container", []);

  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) {
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
                  baseColor: "#FFFFFF",
                  baseColorFirstVariant: "#D4D4D8",
                  baseColorSecondVariant: "#A1A1AA",
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
                  inputFocusedBoxShadow: "0 0 0 3px rgba(255,255,255,0.10)",
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
                cardholderIdentification: {
                  label: "Documento del titular",
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
                selectInstallments: "Seleccioná cuotas",
                selectIssuerBank: "Seleccioná banco emisor",
                formSubmit: "Pagar ahora",
              },
            },
            paymentMethods: {
              creditCard: "all",
              debitCard: "all",
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

                  const payload = {
                    ...formData,
                    items: normalizedItems,
                    amount: Number(amount),
                    description: normalizedItems.map((item) => item.title).join(", "),
                  };

                  console.log("Payload enviado a process-payment:", payload);

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

                  if (!response.ok) {
                    console.error("Error process payment:", data);
                    reject(data);
                    return;
                  }

                  if (
                    data.status !== "approved" &&
                    data.status !== "pending" &&
                    data.status !== "in_process"
                  ) {
                    console.error("Pago rechazado:", data);
                    reject(data);
                    return;
                  }

                  console.log("Pago creado:", data);
                  resolve();
                } catch (error) {
                  console.error(error);
                  reject(error);
                } finally {
                  setSubmitting(false);
                }
              });
            },
            onError: (error: any) => {
              console.error("Error Payment Brick:", error);
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
  }, [sdkReady, amount, payer, items, containerId]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
      <p className="mb-3 text-sm text-zinc-400">
        Pagás con tarjeta dentro de la web.
      </p>

      {submitting && (
        <p className="mb-3 text-sm text-zinc-500">
          Procesando pago...
        </p>
      )}

      <div id={containerId} />
    </div>
  );
}