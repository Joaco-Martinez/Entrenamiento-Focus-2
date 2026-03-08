"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

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

function MercadoPagoLogo({ size = 38 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center overflow-hidden rounded-full border border-white/10 bg-white/5"
      style={{ width: size, height: size }}
      aria-label="Mercado Pago"
      title="Mercado Pago"
    >
      <img
        src="/payments/mercadopago.svg"
        alt="Mercado Pago"
        className="h-[18px] w-auto"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}

function CardIcon() {
  return (
    <div className="grid h-[38px] w-[38px] place-items-center rounded-full border border-white/10 bg-white/5">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 8.5C3 7.12 4.12 6 5.5 6h13C19.88 6 21 7.12 21 8.5v7C21 16.88 19.88 18 18.5 18h-13C4.12 18 3 16.88 3 15.5v-7Z"
          stroke="rgba(255,255,255,0.82)"
          strokeWidth="1.6"
        />
        <path d="M3.5 10h17" stroke="rgba(255,255,255,0.18)" strokeWidth="1.6" />
        <path
          d="M6.5 14.5h4"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
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
      className="grid h-[34px] w-[34px] place-items-center rounded-full border border-black/10 bg-white shadow-md"
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
    { src: "/payments/visa.png", alt: "Visa", fallback: "VISA" },
    { src: "/payments/mastercard.png", alt: "Mastercard", fallback: "MC" },
    { src: "/payments/amex.png", alt: "American Express", fallback: "AMEX" },
    { src: "/payments/naranja.png", alt: "Naranja", fallback: "NAR" },
    { src: "/payments/maestro.png", alt: "Maestro", fallback: "MAE" },
    { src: "/payments/cabal.png", alt: "Cabal", fallback: "CAB" },
    { src: "/payments/argencard.png", alt: "Argencard", fallback: "ARG" },
    { src: "/payments/rapipago.png", alt: "Rapipago", fallback: "RAPI" },
    { src: "/payments/pagofacil.png", alt: "Pago Fácil", fallback: "PF" },
  ];

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2.5">
      {logos.map((l) => (
        <LogoChip key={l.alt} src={l.src} alt={l.alt} fallback={l.fallback} />
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

  const bricksBuilderRef = useRef<any>(null);
  const paymentCtrlRef = useRef<any>(null);
  const walletCtrlRef = useRef<any>(null);
  const paymentMountRef = useRef<HTMLDivElement | null>(null);
  const walletMountRef = useRef<HTMLDivElement | null>(null);
  const mountSeqRef = useRef(0);

  const isDesktop = useMediaQuery("(min-width: 900px)");

  const styleVars = useMemo(
    () => ({
      textPrimaryColor: "rgba(255,255,255,0.92)",
      textSecondaryColor: "rgba(255,255,255,0.62)",
      formBackgroundColor: "#0B0B0B",
      inputBackgroundColor: "rgba(255,255,255,0.04)",
      baseColor: "#F5C84C",
      baseColorFirstVariant: "#EAB83D",
      baseColorSecondVariant: "#FFD884",
      errorColor: "#FF4D4F",
      successColor: "#22C55E",
      outlinePrimaryColor: "rgba(245,200,76,0.30)",
      outlineSecondaryColor: "rgba(255,255,255,0.10)",
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

    if (existing) {
      existing.addEventListener("load", () => setSdkReady(true));
      if (window.MercadoPago) setSdkReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => console.error("No se pudo cargar el SDK de Mercado Pago.");
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!sdkReady) return;
    if (!publicKey) {
      console.error("Falta NEXT_PUBLIC_MP_PUBLIC_KEY");
      return;
    }
    if (!window.MercadoPago) {
      console.error("MercadoPago SDK no disponible");
      return;
    }

    const mp = new window.MercadoPago(publicKey, { locale: "es-AR" });
    bricksBuilderRef.current = mp.bricks();

    return () => {
      clearPayment();
      clearWallet();
    };
  }, [sdkReady, publicKey]);

  useEffect(() => {
    const builder = bricksBuilderRef.current;
    if (!builder) return;
    if (!preferenceId) return;

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
                  if (resp?.ok && resp?.paymentId && onSuccess) {
                    onSuccess(String(resp.paymentId));
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

    if (selected === "card") mountCard();
    else mountWallet();

    return () => {
      cancelled = true;
    };
  }, [selected, amount, preferenceId, apiUrl, onSuccess, styleVars, items, payerEmail]);

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
      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left text-white transition ${
        active
          ? "border-[#F5C84C]/45 bg-white/[0.06] shadow-[inset_0_0_0_1px_rgba(245,200,76,0.10)]"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div
        className={`h-[18px] w-[18px] rounded-full ${
          active
            ? "border-[6px] border-[#F5C84C] shadow-[0_0_0_3px_rgba(245,200,76,0.12)]"
            : "border-2 border-[#F5C84C]/35"
        }`}
      />
      {icon}
      <div className="min-w-0">
        <div className="font-bold text-white/95">{title}</div>
        <div className="mt-0.5 text-sm text-white/60">{subtitle}</div>
      </div>
    </button>
  );

  return (
    <div className="rounded-[20px] border border-[#F5C84C]/20 bg-gradient-to-b from-[#0B0B0B] to-[#090909] p-[18px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="mb-4 flex items-baseline gap-2.5">
        <div className="text-lg font-extrabold text-white/95">Medios de pago</div>
        <div className="text-sm text-white/55">Elegí cómo querés pagar</div>
      </div>

      {!sdkReady ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
          Cargando Mercado Pago...
        </div>
      ) : (
        <div
          className={`grid items-start gap-3 ${
            isDesktop ? "grid-cols-[360px_1fr]" : "grid-cols-1"
          }`}
        >
          <div className="grid gap-2.5">
            <Option
              active={selected === "mp"}
              title="Mercado Pago"
              subtitle="Tus medios de pago preferidos"
              icon={<MercadoPagoLogo />}
              onClick={() => setSelected("mp")}
            />
            <Option
              active={selected === "card"}
              title="Tarjeta"
              subtitle="Crédito o débito"
              icon={<CardIcon />}
              onClick={() => setSelected("card")}
            />
          </div>

          <div className="rounded-[18px] border border-white/10 bg-white/[0.02] p-3.5">
            {selected === "mp" ? (
              <>
                <div className="mb-1.5 font-extrabold text-white/95">
                  Pagá con Mercado Pago
                </div>
                <div className="text-sm leading-relaxed text-white/65">
                  Usá tus tarjetas guardadas, dinero disponible, cuotas y mucho más.
                </div>

                <SupportedLogosRow />

                <div className="mt-3 rounded-2xl border border-[#F5C84C]/20 bg-black/25 p-3">
                  <div id="walletBrick_container" ref={walletMountRef} className="min-h-[54px]" />
                </div>

                <div className="mt-2.5 text-xs text-white/55">
                  Si no tenés cuenta, también podés pagar igual.
                </div>
              </>
            ) : (
              <div
                id="paymentBrick_container"
                ref={paymentMountRef}
                className="min-h-[220px]"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}