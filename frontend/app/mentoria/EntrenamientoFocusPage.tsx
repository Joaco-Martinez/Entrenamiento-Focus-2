"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PaypalSubscriptionButton from "./PaypalSubscriptionButton";
import MercadoPagoSubscriptionButton from "./MercadoPagoSubscriptionButton";
import { Music, Zap, MessageCircle, Calendar } from "lucide-react";

type ProviderType = "paypal" | "mercadopago" | null;

export default function EntrenamientoFocusPage() {
  const router = useRouter();
  const { user, loading: authLoading, country } = useAuth();

  const [error, setError] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>(null);
  const [pendingProvider, setPendingProvider] = useState<ProviderType>(null);
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);

  const benefits = [
    {
      icon: Music,
      title: "Mezcla y Mastering",
      text: "Clases sobre proyectos reales, de manera ordenada y profundizada. Algo distinto a lo que vemos en redes sociales.",
      highlight: ["reales"],
    },
    {
      icon: Zap,
      title: "Visión y Criterio",
      text: "Aprenderás a tomar decisiones más rápido, sin dudar en el proceso.",
      highlight: ["más rápido"],
    },
    {
      icon: MessageCircle,
      title: "Feedback y Conexiones",
      text: "Soporte directo con el mentor para resolver dudas y recibir feedback de canciones.",
      highlight: ["Conexiones"],
    },
  ];

  const extras = [
    {
      image:
        "https://res.cloudinary.com/deb7jg37j/image/upload/v1776441791/Cuadrado_5_inryct.png",
      title: "Traemos invitados especiales",
      text: "aportando distintos puntos de vista y conocimientos.",
    },
    {
      image:
        "https://res.cloudinary.com/deb7jg37j/image/upload/v1776441781/Cuadrado_4_foutob.png",
      title: "Recibirás material para practicar",
      text: "todo lo visto en clases.",
    },
    {
      image:
        "https://res.cloudinary.com/deb7jg37j/image/upload/v1776441793/Cuadrado_06_uycw7g.png",
      title: "Clases de desarrollo personal y marketing",
      text: "para no descuidar esa área tan importante.",
    },
  ];

  const bullets = [
    {
      start: "4 clases al mes",
      rest: " por Zoom — ",
      accent: "Lunes 20:00",
      end: " (Argentina)",
    },
    {
      start: "Todas las clases",
      rest: " quedan grabadas en la plataforma para que las veas cuando quieras desde cualquier dispositivo.",
      accent: "",
      end: "",
    },
    {
      start: "50%",
      rest: " de descuento en todos los",
      accent: " productos",
      end: " de la web.",
    },
  ];

  const MP_PLAN_ID = process.env.NEXT_PUBLIC_MP_PLAN_ID || "";
  const PRODUCT_ID_MENTORIA =
    process.env.NEXT_PUBLIC_PRODUCT_ID_MENTORIA || "";
  const PAYPAL_PLAN_ID = process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID || "";
  const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  const MERCADOPAGO_PLAN_CHECKOUT = useMemo(() => {
    if (!MP_PLAN_ID) return "";
    return `https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=${MP_PLAN_ID}`;
  }, [MP_PLAN_ID]);

  const normalizedCountry = String(country ?? user?.country ?? "")
    .trim()
    .toLowerCase();

  const isArgentina =
    normalizedCountry === "ar" ||
    normalizedCountry === "arg" ||
    normalizedCountry === "argentina" ||
    normalizedCountry.startsWith("ar-");

  const goToLogin = () => {
    router.push("/login?redirect=/entrenamiento-focus");
  };

  const ensureAuth = () => {
    if (authLoading) return false;

    if (!user) {
      goToLogin();
      return false;
    }

    return true;
  };

  const handleSelectProvider = (provider: Exclude<ProviderType, null>) => {
    setError("");

    if (!ensureAuth()) return;

    if (provider === "paypal") {
      if (!PAYPAL_CLIENT_ID) {
        setError("Falta configurar NEXT_PUBLIC_PAYPAL_CLIENT_ID");
        return;
      }

      if (!PAYPAL_PLAN_ID) {
        setError("Falta configurar NEXT_PUBLIC_PAYPAL_PLAN_ID");
        return;
      }
    }

    if (provider === "mercadopago") {
      if (!MP_PLAN_ID) {
        setError("Falta configurar NEXT_PUBLIC_MP_PLAN_ID");
        return;
      }

      if (!PRODUCT_ID_MENTORIA) {
        setError("Falta configurar NEXT_PUBLIC_PRODUCT_ID_MENTORIA");
        return;
      }
    }

    setPendingProvider(provider);
    setShowEmailConfirmModal(true);
  };

  const confirmProviderSelection = () => {
    if (!pendingProvider) return;

    setSelectedProvider(pendingProvider);
    setPendingProvider(null);
    setShowEmailConfirmModal(false);
  };

  const closeModal = () => {
    setPendingProvider(null);
    setShowEmailConfirmModal(false);
  };

  return (
    <main className="min-h-screen bg-black text-white">
<section className="relative overflow-hidden border-b border-[#22180d]">
  <div className="absolute inset-0">
    <div className="heroImage absolute inset-0" />

    <div className="absolute inset-0 hidden sm:block bg-[linear-gradient(90deg,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.85)_35%,rgba(0,0,0,0.55)_65%,rgba(0,0,0,0.28)_100%)]" />

    <div className="absolute inset-0 sm:hidden bg-[linear-gradient(90deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.80)_42%,rgba(0,0,0,0.45)_72%,rgba(0,0,0,0.18)_100%)]" />

    <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black via-black/90 to-transparent sm:hidden" />
  </div>

  <div className="relative mx-auto flex min-h-[calc(100dvh-64px)] max-w-[1180px] items-start px-6 pb-14 pt-24 sm:items-center sm:px-10 sm:py-16 lg:px-12">
    <div className="max-w-[520px] pt-2 sm:pt-6 md:pt-0">
      <h1 className="text-[38px] font-light leading-[1.02] tracking-[-0.03em] sm:text-[56px] lg:text-[68px]">
        <span className="block">Entrenamiento</span>
        <span className="block">Profesional en</span>
        <span className="block text-primary">Mezcla &amp; Mastering</span>
      </h1>

      <p className="mt-8 text-[22px] leading-[1.45] text-white/80 sm:text-[28px]">
        No es un curso grabado.
        <br />
        <span className="font-medium text-primary">
          Es un entrenamiento constante,
        </span>
        <br />
        para definir tu criterio profesional.
      </p>

      <a
        href="#precio"
        className="mt-10 inline-flex rounded-full bg-primary px-8 py-4 text-[18px] font-semibold text-black transition hover:scale-[1.02] hover:bg-[#efbb77] sm:text-[22px]"
      >
        Entrar al entrenamiento
      </a>

      <p className="mt-10 text-[15px] uppercase tracking-[0.08em] text-white/65 sm:text-[18px]">
        Liderado por{" "}
        <span className="font-semibold text-primary">Matias Ledesma</span>
      </p>
    </div>
  </div>

  <style jsx>{`
    .heroImage {
      background-image: url("https://res.cloudinary.com/deb7jg37j/image/upload/v1776440143/Imagen_principal_c1vw7k.png");
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center 15%;
    }

    @media (max-width: 640px) {
      .heroImage {
        background-size: auto 122%;
        background-position: 72% 0%;
      }
    }

    @media (max-width: 430px) {
      .heroImage {
        background-size: auto 128%;
        background-position: 74% 0%;
      }
    }
  `}</style>
</section>

      <section className="mx-auto max-w-[1180px] px-6 py-16 md:px-10 lg:px-12 lg:py-24">
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          <div className="h-px max-w-[260px] flex-1 bg-[#aa7b2a]" />

          <div className="text-center">
            <h2 className="text-[34px] font-light sm:text-[54px]">
              Qué vas a conseguir
            </h2>

            <p className="mt-3 text-[18px] text-white/75 sm:text-[28px]">
              Tres beneficios{" "}
              <span className="font-semibold text-primary">
                claros, sin vueltas.
              </span>
            </p>
          </div>

          <div className="h-px max-w-[260px] flex-1 bg-[#aa7b2a]" />
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3 lg:gap-7">
          {benefits.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-[28px] border border-[#D4AF37]/20 bg-[#D4AF37]/7 px-6 py-7 text-center transition-all duration-300"
              >
                <div className="mb-4 flex justify-center">
                  <Icon className="h-7 w-7 text-primary" strokeWidth={1.9} />
                </div>

                <h3 className="text-[20px] font-light leading-tight tracking-[-0.02em] text-white sm:text-[24px]">
                  {item.title}
                </h3>

                <p className="mt-3 text-[15px] leading-[1.7] text-white/72 sm:text-[17px]">
                  {item.text.split(item.highlight[0]).map((part, index, arr) => (
                    <span key={index}>
                      {part}
                      {index < arr.length - 1 && (
                        <span className="font-medium text-primary">
                          {item.highlight[0]}
                        </span>
                      )}
                    </span>
                  ))}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 lg:px-12 lg:py-28">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[13px] uppercase tracking-[0.3em] text-primary">
                Además
              </p>

              <h2 className="mt-4 text-[38px] font-light leading-[1.02] tracking-[-0.04em] sm:text-[58px]">
                La formación no termina
                <span className="block text-primary">en lo técnico.</span>
              </h2>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="group overflow-hidden rounded-[34px] border border-white/10 bg-black">
              <div className="relative h-[520px] overflow-hidden">
                <img
                  src={extras[0].image}
                  alt={extras[0].title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

                <div className="absolute bottom-0 left-0 max-w-[620px] p-7 sm:p-9">
                  <p className="text-[26px] font-medium leading-[1.2] text-primary sm:text-[34px]">
                    {extras[0].title}
                  </p>

                  <p className="mt-3 text-[18px] leading-[1.7] text-white/78 sm:text-[20px]">
                    {extras[0].text}
                  </p>
                </div>
              </div>
            </article>

            <div className="grid gap-5">
              {extras.slice(1).map((item, index) => (
                <article
                  key={item.title}
                  className="group overflow-hidden rounded-[34px] border border-white/10 bg-black"
                >
                  <div className="relative h-[248px] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className={`h-full w-full transition duration-700 ${
                        index === 1
                          ? "scale-[1.5] object-contain bg-black group-hover:scale-[1.54]"
                          : "object-cover group-hover:scale-[1.04]"
                      }`}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent" />

                    <div className="absolute bottom-0 left-0 p-6 sm:p-7">
                      <p className="max-w-[420px] text-[22px] font-medium leading-[1.25] text-[#D4AF37]">
                        {item.title}
                      </p>

                      <p className="mt-2 max-w-[420px] text-[16px] leading-[1.7] text-white/76">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 py-14 md:px-10 lg:px-12 lg:py-20">
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <div className="h-px max-w-[220px] flex-1 bg-primary" />

          <h2 className="text-center text-[28px] font-light tracking-[0.12em] text-primary sm:text-[42px]">
            MODALIDAD
          </h2>

          <div className="h-px max-w-[220px] flex-1 bg-primary" />
        </div>

        <div className="mx-auto mt-12 max-w-[880px] space-y-8 sm:space-y-10">
          {bullets.map((bullet, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-[28px] border border-[#D4AF37]/20 px-6 py-7 sm:gap-5"
            >
              <div className="pt-[2px] text-[20px] text-primary sm:text-[24px]">
                ✓
              </div>

              <p className="text-[18px] leading-[1.6] text-white/85 sm:text-[22px]">
                <span className="font-medium text-white">{bullet.start}</span>
                {bullet.rest}
                {bullet.accent && (
                  <span className="text-primary">{bullet.accent}</span>
                )}
                {bullet.end}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="precio"
        className="mx-auto max-w-[1200px] px-6 pb-20 md:px-10 lg:px-12 lg:pb-28"
      >
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[#050505]">
          <div className="grid lg:grid-cols-2">
            <div className="border-b border-white/10 p-8 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
              <p className="text-[11px] uppercase tracking-[0.28em] text-primary">
                Te espero adentro
              </p>

              <h2 className="mt-4 text-[36px] font-light leading-[1.05] tracking-[-0.03em] sm:text-[48px] lg:text-[56px]">
                <span className="block text-white">Sumate a</span>
                <span className="block text-primary">
                  Entrenamiento Focus
                </span>
              </h2>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleSelectProvider("paypal")}
                  className={`group relative cursor-pointer overflow-hidden rounded-[24px] border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] active:scale-[0.98] ${
                    selectedProvider === "paypal"
                      ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_25px_rgba(212,175,55,0.2)]"
                      : "border-[#D4AF37]/20 bg-[#D4AF37]/[0.05] hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/10 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                  }`}
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>

                  <div className="relative z-10">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]">
                      Pago internacional
                    </p>

                    <div className="mt-3 flex items-end justify-between">
                      <div className="flex items-end gap-1">
                        <span className="text-[14px] text-white/50">USD</span>
                        <span className="text-[36px] font-light text-white">
                          15
                        </span>
                      </div>

                      <span className="text-[20px] text-white/60 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white">
                        →
                      </span>
                    </div>

                    <p className="mt-2 text-[13px] text-white/60 transition-colors duration-300 group-hover:text-white/80">
                      PayPal
                    </p>
                  </div>
                </button>

                {isArgentina && (
                  <button
                    type="button"
                    onClick={() => handleSelectProvider("mercadopago")}
                    className={`group relative cursor-pointer overflow-hidden rounded-[24px] border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] active:scale-[0.98] ${
                      selectedProvider === "mercadopago"
                        ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_25px_rgba(212,175,55,0.2)]"
                        : "border-white/10 bg-white/[0.02] hover:border-[#D4AF37]/40 hover:bg-white/[0.04] hover:shadow-[0_0_20px_rgba(212,175,55,0.12)]"
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>

                    <div className="relative z-10">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]">
                        Pago Argentina
                      </p>

                      <div className="mt-3 flex items-end justify-between">
                        <div className="flex items-end gap-1">
                          <span className="text-[14px] text-white/50">
                            ARS
                          </span>
                          <span className="text-[36px] font-light text-white">
                            19.500
                          </span>
                        </div>

                        <span className="text-[20px] text-white/60 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white">
                          →
                        </span>
                      </div>

                      <p className="mt-2 text-[13px] text-white/60 transition-colors duration-300 group-hover:text-white/80">
                        MercadoPago
                      </p>
                    </div>
                  </button>
                )}
              </div>

              {error && (
                <p className="mt-5 text-sm font-medium text-red-400">
                  {error}
                </p>
              )}

              {selectedProvider && (
                <div className="mt-6 rounded-[24px] border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-5 sm:p-6">
                  <p className="mb-4 text-[11px] uppercase tracking-[0.2em] text-[#D4AF37]">
                    Completar suscripción
                  </p>

                  <div className="flex justify-center">
                    {selectedProvider === "paypal" && (
                      <PaypalSubscriptionButton
                        planId={PAYPAL_PLAN_ID}
                        clientId={PAYPAL_CLIENT_ID}
                        disabled={authLoading}
                        onRequireAuth={ensureAuth}
                        onError={(message) => setError(message)}
                      />
                    )}

                    {selectedProvider === "mercadopago" && isArgentina && (
                      <MercadoPagoSubscriptionButton
                        disabled={authLoading}
                        onRequireAuth={ensureAuth}
                        onError={(message) => setError(message)}
                        checkoutUrl={MERCADOPAGO_PLAN_CHECKOUT}
                        productId={PRODUCT_ID_MENTORIA}
                        planId={MP_PLAN_ID}
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="mt-8 space-y-3">
                <p className="max-w-[520px] text-[13px] leading-[1.7] text-white/50">
                  <span className="text-[#D4AF37]">Importante:</span> el correo
                  de tu cuenta debe coincidir con el de PayPal o Mercado Pago.
                </p>

                {!authLoading && !user && (
                  <button
                    type="button"
                    onClick={goToLogin}
                    className="inline-flex rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/5"
                  >
                    Iniciar sesión para suscribirme
                  </button>
                )}

                <p className="text-xs text-white/40">
                  {!user
                    ? "Para suscribirte, primero tenés que iniciar sesión."
                    : isArgentina
                    ? "Si estás en Argentina, podés suscribirte con PayPal o Mercado Pago."
                    : "Si estás fuera de Argentina, la suscripción se realiza con PayPal."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center p-10 lg:p-12">
              <div className="max-w-[260px] text-center">
                <div className="mb-6 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/[0.04]">
                    <Calendar
                      className="h-6 w-6 text-[#D4AF37]"
                      strokeWidth={1.6}
                    />
                  </div>
                </div>

                <p className="text-[18px] leading-[1.7] text-white/75 sm:text-[20px]">
                  El pago se renueva automáticamente cada mes. Podés cancelar
                  cuando quieras.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showEmailConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#111111] p-6 shadow-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#D4AF37]">
              Confirmación
            </p>

            <h3 className="mt-3 text-2xl font-semibold text-white">
              Antes de continuar
            </h3>

            <p className="mt-4 text-sm leading-7 text-white/75">
              Asegúrate de que el mail de tu cuenta Focus sea el mismo que usas
              en PayPal o Mercado Pago para no tener demoras en la activación.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Todavía no
              </button>

              <button
                type="button"
                onClick={confirmProviderSelection}
                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
              >
                Sí, continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}