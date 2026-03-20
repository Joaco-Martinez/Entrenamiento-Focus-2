"use client";

import { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    MercadoPago: any;
    paymentBrickController?: {
      unmount?: () => Promise<void> | void;
    };
    walletBrickController?: {
      unmount?: () => Promise<void> | void;
    };
  }
}

type CheckoutMethod = "card" | "mercadopago";

type Item = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: "ARS";
};

type Payer = {
  firstName?: string;
  lastName?: string;
  email?: string;
  identification?: {
    type?: string;
    number?: string;
  };
};

type Props = {
  publicKey: string;
  amount: number;
  items: Item[];
  payer?: Payer;
  apiBaseUrl: string;
};

const MP_SCRIPT_ID = "mercadopago-sdk";

export default function MercadoPagoCheckout({
  publicKey,
  amount,
  items,
  payer,
  apiBaseUrl,
}: Props) {
  const [method, setMethod] = useState<CheckoutMethod>("card");
  const [sdkReady, setSdkReady] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);

  const paymentContainerId = useMemo(() => "paymentBrick_container", []);
  const walletContainerId = useMemo(() => "walletBrick_container", []);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (document.getElementById(MP_SCRIPT_ID)) {
      setSdkReady(true);
      return;
    }

    const script = document.createElement("script");
    script.id = MP_SCRIPT_ID;
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => setSdkReady(true);
    document.body.appendChild(script);

    return () => {};
  }, []);

  useEffect(() => {
    if (!sdkReady || !publicKey) return;
    if (!window.MercadoPago) return;

    const mp = new window.MercadoPago(publicKey, {
      locale: "es-AR",
    });

    const bricksBuilder = mp.bricks();

    const clearBricks = async () => {
      try {
        await window.paymentBrickController?.unmount?.();
      } catch {}
      try {
        await window.walletBrickController?.unmount?.();
      } catch {}
    };

    const renderPaymentBrick = async () => {
      await clearBricks();

      window.paymentBrickController = await bricksBuilder.create(
        "payment",
        paymentContainerId,
        {
          initialization: {
            amount,
            payer: {
              firstName: payer?.firstName || "",
              lastName: payer?.lastName || "",
              email: payer?.email || "",
              identification: {
                type: payer?.identification?.type || "DNI",
                number: payer?.identification?.number || "",
              },
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
                entityType: {
                  label: "Tipo de documento",
                  placeholder: "Seleccioná un tipo",
                },
                financialInstitution: {
                  label: "Entidad financiera",
                  placeholder: "Seleccioná un banco",
                },
                selectInstallments: "Seleccioná cuotas",
                selectIssuerBank: "Seleccioná banco emisor",
                formSubmit: "Pagar ahora",
                paymentMethods: {
                  newCreditCardTitle: "Nueva tarjeta de crédito",
                  creditCardTitle: "Tarjeta de crédito",
                  creditCardValueProp: "Pagá con tu tarjeta",
                  newDebitCardTitle: "Nueva tarjeta de débito",
                  debitCardTitle: "Tarjeta de débito",
                  debitCardValueProp: "Pago inmediato y seguro",
                  ticketTitle: "Efectivo",
                  ticketValueProp: "Generá un comprobante y aboná luego",
                },
              },
            },
            paymentMethods: {
              creditCard: "all",
              debitCard: "all",
              bankTransfer: "all",
              ticket: "all",
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
                  const response = await fetch(
                    `${apiBaseUrl}/mercadopago_checkouts/process-payment`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        ...formData,
                        description: items.map((i) => i.title).join(", "),
                        external_reference: `order_${Date.now()}`,
                      }),
                    }
                  );

                  const data = await response.json();

                  if (!response.ok) {
                    reject(data);
                    return;
                  }

                  console.log("Pago creado:", data);
                  resolve();
                } catch (error) {
                  reject(error);
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

    const renderWalletBrick = async () => {
      await clearBricks();
      setLoadingWallet(true);

      try {
        const response = await fetch(
          `${apiBaseUrl}/mercadopago_checkout/create-preference`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items,
              payer,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "No se pudo crear la preferencia");
        }

        window.walletBrickController = await bricksBuilder.create(
          "wallet",
          walletContainerId,
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
        console.error(error);
      } finally {
        setLoadingWallet(false);
      }
    };

    const run = async () => {
      if (method === "card") {
        await renderPaymentBrick();
      } else {
        await renderWalletBrick();
      }
    };

    run();
    initializedRef.current = true;

    return () => {
      clearBricks();
    };
  }, [sdkReady, publicKey, method, amount, apiBaseUrl, items, payer, paymentContainerId, walletContainerId]);

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-white">
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMethod("card")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            method === "card"
              ? "bg-white text-black"
              : "bg-zinc-900 text-zinc-300 border border-zinc-800"
          }`}
        >
          Pagar con tarjeta
        </button>

        <button
          type="button"
          onClick={() => setMethod("mercadopago")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            method === "mercadopago"
              ? "bg-white text-black"
              : "bg-zinc-900 text-zinc-300 border border-zinc-800"
          }`}
        >
          Mercado Pago
        </button>
      </div>

      {!sdkReady && <p>Cargando checkout...</p>}

      <div
        id={paymentContainerId}
        style={{ display: method === "card" ? "block" : "none" }}
      />

      <div
        id={walletContainerId}
        style={{ display: method === "mercadopago" ? "block" : "none" }}
      />

      {method === "mercadopago" && loadingWallet && (
        <p className="mt-3 text-sm text-zinc-400">Preparando Mercado Pago...</p>
      )}
    </div>
  );
}