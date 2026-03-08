"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, CreditCard, ShieldCheck, WalletCards } from "lucide-react";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

type MpItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: "ARS";
  description?: string;
};

type Props = {
  amount: number;
  preferenceId: string;
  items: MpItem[];
  payerEmail?: string;
  onSuccess?: (paymentId: string) => void;
};

type Method = "mp" | "card";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);

    setMatches(mql.matches);

    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [query]);

  return matches;
}

function LogoChip({
  src,
  alt,
  fallback,
}: {
  src: string;
  alt: string;
  fallback: string;
}) {
  const [ok, setOk] = useState(true);

  return (
    <div
      title={alt}
      aria-label={alt}
      className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm"
    >
      {ok ? (
        <img
          src={src}
          alt={alt}
          className="h-4 w-auto"
          onError={() => setOk(false)}
        />
      ) : (
        <span className="text-[10px] font-black text-black/75">{fallback}</span>
      )}
    </div>
  );
}

function SupportedLogosRow() {
  const logos = [
    {
      src: "https://res.cloudinary.com/deb7jg37j/image/upload/v1772983458/visa_wjysqu.png",
      alt: "Visa",
      fallback: "VISA",
    },
    {
      src: "https://res.cloudinary.com/deb7jg37j/image/upload/v1772983457/mastercard_s7im9o.png",
      alt: "Mastercard",
      fallback: "MC",
    },
    {
      src: "https://res.cloudinary.com/deb7jg37j/image/upload/v1772983457/amex_gvmtv9.png",
      alt: "American Express",
      fallback: "AMEX",
    },
    {
      src: "https://res.cloudinary.com/deb7jg37j/image/upload/v1772983457/naranja_rlvfoa.png",
      alt: "Naranja",
      fallback: "NAR",
    },
    {
      src: "https://res.cloudinary.com/deb7jg37j/image/upload/v1772983458/maestro_jqfezc.png",
      alt: "Maestro",
      fallback: "MAE",
    },
    {
      src: "https://res.cloudinary.com/deb7jg37j/image/upload/v1772983457/cabal_vlq84u.png",
      alt: "Cabal",
      fallback: "CAB",
    },
    {
      src: "https://res.cloudinary.com/deb7jg37j/image/upload/v1772983457/argencard_viymwx.png",
      alt: "Argencard",
      fallback: "ARG",
    },
  ];

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2.5">
      {logos.map((logo) => (
        <LogoChip
          key={logo.alt}
          src={logo.src}
          alt={logo.alt}
          fallback={logo.fallback}
        />
      ))}
    </div>
  );
}

export default function PaymentWithMpCard({
  amount,
  preferenceId,
  items,
  payerEmail,
  onSuccess,
}: Props) {
  const publicKey = process.env.NEXT_PUBLIC_MP_BRICKS_PUBLIC_KEY as string;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const [selected, setSelected] = useState<Method>("card");
  const [sdkReady, setSdkReady] = useState(false);
  const [builderReady, setBuilderReady] = useState(false);

  const bricksBuilderRef = useRef<any>(null);
  const paymentCtrlRef = useRef<any>(null);
  const walletCtrlRef = useRef<any>(null);
  const paymentMountRef = useRef<HTMLDivElement | null>(null);
  const walletMountRef = useRef<HTMLDivElement | null>(null);
  const mountSeqRef = useRef(0);

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const styleVars = useMemo(
    () => ({
      textPrimaryColor: "rgba(255,255,255,0.94)",
      textSecondaryColor: "rgba(255,255,255,0.64)",
      formBackgroundColor: "#0F0F10",
      inputBackgroundColor: "rgba(255,255,255,0.04)",
      baseColor: "#F5C84C",
      baseColorFirstVariant: "#EAB83D",
      baseColorSecondVariant: "#FFD884",
      errorColor: "#FF4D4F",
      successColor: "#22C55E",
      outlinePrimaryColor: "rgba(245,200,76,0.22)",
      outlineSecondaryColor: "rgba(255,255,255,0.08)",
      buttonTextColor: "#0B0B0B",
      borderRadiusSmall: "10px",
      borderRadiusMedium: "14px",
      borderRadiusLarge: "18px",
      borderRadiusFull: "999px",
      formPadding: "18px",
    }),
    []
  );

  const clearPayment = () => {
    try {
      paymentCtrlRef.current?.unmount?.();
    } catch {}
    paymentCtrlRef.current = null;
    if (paymentMountRef.current) paymentMountRef.current.innerHTML = "";
  };

  const clearWallet = () => {
    try {
      walletCtrlRef.current?.unmount?.();
    } catch {}
    walletCtrlRef.current = null;
    if (walletMountRef.current) walletMountRef.current.innerHTML = "";
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.MercadoPago) {
      setSdkReady(true);
      return;
    }

    const existing = document.querySelector(
      'script[src="https://sdk.mercadopago.com/js/v2"]'
    ) as HTMLScriptElement | null;

    const handleLoad = () => setSdkReady(true);

    if (existing) {
      if (window.MercadoPago) {
        setSdkReady(true);
      } else {
        existing.addEventListener("load", handleLoad);
      }

      return () => {
        existing.removeEventListener("load", handleLoad);
      };
    }

    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () =>
      console.error("No se pudo cargar el SDK de Mercado Pago.");
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!sdkReady) return;
    if (!publicKey) {
      console.error("Falta NEXT_PUBLIC_MP_BRICKS_PUBLIC_KEY");
      return;
    }
    if (!window.MercadoPago) {
      console.error("MercadoPago SDK no disponible");
      return;
    }

    const mp = new window.MercadoPago(publicKey, { locale: "es-AR" });
    bricksBuilderRef.current = mp.bricks();
    setBuilderReady(true);

    return () => {
      setBuilderReady(false);
      clearPayment();
      clearWallet();
    };
  }, [sdkReady, publicKey]);

  useEffect(() => {
    if (!builderReady) return;
    if (!preferenceId) return;

    const builder = bricksBuilderRef.current;
    if (!builder) return;

    const seq = ++mountSeqRef.current;
    let cancelled = false;

    const mountCard = async () => {
      clearWallet();

      if (!paymentMountRef.current) return;
      if (cancelled || seq !== mountSeqRef.current) return;

      clearPayment();

      try {
        const ctrl = await builder.create("payment", "paymentBrick_container", {
          initialization: {
            amount,
            preferenceId,
          },
          customization: {
            visual: {
              style: {
                theme: "dark",
                customVariables: styleVars,
              },
            },
            paymentMethods: {
              creditCard: "all",
              debitCard: "all",
              maxInstallments: 1,
            },
          },
          callbacks: {
            onReady: () => console.log("✅ Payment Brick listo"),
            onSubmit: ({ formData }: any) => {
              const description =
                items.length === 1
                  ? items[0].title
                  : `Compra de ${items.length} productos`;

              return fetch(`${apiUrl}/mp_checkout/process_payment`, {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  ...formData,
                  transaction_amount: amount,
                  description,
                  payer: {
                    email:
                      formData?.payer?.email ||
                      payerEmail ||
                      "test_user_123456@testuser.com",
                  },
                  preference_id: preferenceId,
                }),
              })
                .then((r) => r.json())
                .then((resp) => {
                  const resolvedPaymentId =
                    resp?.paymentDbId ||
                    resp?.paymentId ||
                    resp?.mpPaymentId;

                  if (resp?.ok && resolvedPaymentId && onSuccess) {
                    onSuccess(String(resolvedPaymentId));
                  }

                  return resp;
                });
            },
            onError: (e: any) => console.error("❌ Payment Brick error:", e),
          },
        });

        if (cancelled || seq !== mountSeqRef.current) {
          try {
            ctrl?.unmount?.();
          } catch {}
          return;
        }

        paymentCtrlRef.current = ctrl;
      } catch (e) {
        if (!cancelled) console.error("❌ mountCard error:", e);
      }
    };

    const mountWallet = async () => {
      clearPayment();

      if (!walletMountRef.current) return;
      if (cancelled || seq !== mountSeqRef.current) return;

      clearWallet();

      try {
        const ctrl = await builder.create("wallet", "walletBrick_container", {
          initialization: {
            preferenceId,
            redirectMode: "self",
          },
          customization: {
            theme: "dark" as any,
          },
          callbacks: {
            onReady: () => console.log("✅ Wallet Brick listo"),
            onSubmit: () => Promise.resolve(),
            onError: (e: any) => console.error("❌ Wallet Brick error:", e),
          },
        });

        if (cancelled || seq !== mountSeqRef.current) {
          try {
            ctrl?.unmount?.();
          } catch {}
          return;
        }

        walletCtrlRef.current = ctrl;
      } catch (e) {
        if (!cancelled) console.error("❌ mountWallet error:", e);
      }
    };

    if (selected === "card") {
      mountCard();
    } else {
      mountWallet();
    }

    return () => {
      cancelled = true;
    };
  }, [
    builderReady,
    selected,
    amount,
    preferenceId,
    apiUrl,
    onSuccess,
    styleVars,
    items,
    payerEmail,
  ]);

  const Option = ({
    active,
    title,
    subtitle,
    icon,
    onClick,
  }: {
    active: boolean;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl px-4 py-4 text-left transition ${
        active
          ? "bg-[#F5C84C]/10 text-white ring-1 ring-[#F5C84C]/25"
          : "bg-white/[0.03] text-white hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
            active
              ? "bg-[#F5C84C]/15 text-[#F5C84C]"
              : "bg-white/[0.06] text-zinc-200"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{title}</span>
            {active ? <BadgeCheck className="h-4 w-4 text-[#F5C84C]" /> : null}
          </div>
          <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#F5C84C]/70">
            Medios de pago
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Elegí cómo querés pagar
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Checkout con Mercado Pago o pago directo con tarjeta.
          </p>
        </div>

        <div className="self-start rounded-2xl bg-[#F5C84C]/10 px-4 py-3 lg:self-auto">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#F5C84C]/70">
            Total a pagar
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#F5C84C]">
            {new Intl.NumberFormat("es-AR", {
              style: "currency",
              currency: "ARS",
              maximumFractionDigits: 2,
            }).format(amount)}
          </p>
        </div>
      </div>

      {(!sdkReady || !builderReady) ? (
        <div className="rounded-2xl bg-white/[0.03] p-6 text-sm text-zinc-300">
          Cargando Mercado Pago...
        </div>
      ) : (
        <div
          className={`grid gap-5 ${
            isDesktop ? "grid-cols-[280px_minmax(0,1fr)]" : "grid-cols-1"
          }`}
        >
          <div className="space-y-3">
            <Option
              active={selected === "mp"}
              title="Mercado Pago"
              subtitle="Tus medios guardados, saldo y pago rápido"
              icon={<WalletCards className="h-5 w-5" />}
              onClick={() => setSelected("mp")}
            />

            <Option
              active={selected === "card"}
              title="Tarjeta"
              subtitle="Crédito o débito dentro del checkout"
              icon={<CreditCard className="h-5 w-5" />}
              onClick={() => setSelected("card")}
            />

            <div className="rounded-2xl bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <ShieldCheck className="h-4 w-4 text-[#F5C84C]" />
                Pago protegido
              </div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Tu compra se procesa con Mercado Pago y queda asociada a tu cuenta.
              </p>
            </div>
          </div>

          <div className="rounded-[24px] bg-[#0f0f10] p-4 sm:p-5">
            {selected === "mp" ? (
              <>
                <div className="max-w-xl">
                  <h4 className="text-xl font-semibold text-white">
                    Pagá con Mercado Pago
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    Ingresá con tu cuenta o usá otros medios disponibles.
                  </p>
                </div>

                <SupportedLogosRow />

                <div className="mt-5">
                  <div
                    id="walletBrick_container"
                    ref={walletMountRef}
                    className="min-h-[56px]"
                  />
                </div>

                <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                  También podés continuar aunque no tengas una cuenta creada en Mercado Pago.
                </p>
              </>
            ) : (
              <>
                <div className="max-w-xl">
                  <h4 className="text-xl font-semibold text-white">
                    Pagá con tarjeta
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    Completá los datos de tu tarjeta y finalizá la compra sin salir del checkout.
                  </p>
                </div>

                <div className="mt-5">
                  <div
                    id="paymentBrick_container"
                    ref={paymentMountRef}
                    className="mp-card-brick min-h-[260px]"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .mp-card-brick [class*="installment"],
        .mp-card-brick [class*="Installment"],
        .mp-card-brick [class*="quota"],
        .mp-card-brick [class*="Quota"],
        .mp-card-brick [class*="cuota"],
        .mp-card-brick [class*="Cuota"],
        .mp-card-brick [class*="tag"],
        .mp-card-brick [class*="Tag"],
        .mp-card-brick [class*="badge"],
        .mp-card-brick [class*="Badge"] {
          display: none !important;
        }
      `}</style>
    </div>
  );
}