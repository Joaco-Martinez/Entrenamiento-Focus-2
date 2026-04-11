"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PaypalSubscriptionButton from "./PaypalSubscriptionButton";
import MercadoPagoSubscriptionButton from "./MercadoPagoSubscriptionButton";
import MouseGlowBackground from "@/components/mouse-glow-background";

type ProviderType = "paypal" | "mercadopago" | null;

export default function MentoriaPage() {
  const router = useRouter();
  const { user, loading: authLoading, country } = useAuth();

  const [error, setError] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>(null);
  const [pendingProvider, setPendingProvider] = useState<ProviderType>(null);
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);

  const pillars = [
    "Producción musical",
    "Mezcla y Mastering",
    "Marketing y networking",
    "Feedback personalizado y soporte cercano",
  ];

  const benefits = [
    "Clases en vivo para hacer preguntas en tiempo real",
    "4 clases por mes, todos los lunes a las 20:00",
    "Cada clase dura 1 hora",
    "Todas las clases quedan grabadas en la plataforma",
    "Soporte directo por WhatsApp durante la semana",
    "Posibilidad de enviar canciones para recibir feedback",
  ];

  const cards = [
    {
      title: "Sin secretos",
      text: "Enseñamos todo lo que no podemos mostrar en reels o tutoriales cortos. Acá profundizamos de verdad.",
    },
    {
      title: "En vivo",
      text: "Podés hacer preguntas en cada clase y resolver dudas reales con acompañamiento directo.",
    },
    {
      title: "Crecimiento profesional",
      text: "No trabajamos solo lo técnico: también vemos marketing, contactos, ingresos, hábitos y desarrollo profesional.",
    },
  ];

  const MP_PLAN_ID = process.env.NEXT_PUBLIC_MP_PLAN_ID || "";
  const PRODUCT_ID_MENTORIA =
    process.env.NEXT_PUBLIC_PRODUCT_ID_MENTORIA || "";
  const PAYPAL_PLAN_ID = process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID || "";
  const PAYPAL_CLIENT_ID =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  const MERCADOPAGO_PLAN_CHECKOUT = useMemo(() => {
    if (!MP_PLAN_ID) return "";
    return `https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=${MP_PLAN_ID}`;
  }, [MP_PLAN_ID]);

  const normalizedCountry = String(country ?? user?.country ?? "")
    .trim()
    .toLowerCase();

  const isArgentina =
    normalizedCountry === "ar" ||
    normalizedCountry === "AR" ||
    normalizedCountry === "arg" ||
    normalizedCountry === "argentina" ||
    normalizedCountry.startsWith("ar-");

  const goToLogin = () => {
    router.push("/login?redirect=/mentoria");
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
    <div className="relative min-h-screen overflow-hidden text-white">
      <MouseGlowBackground />

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_45%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-1 text-sm font-medium text-[#f4d97c]">
                Mentoría privada
              </span>

              <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                Entrenamiento Focus
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 md:text-lg">
                Una mentoría privada donde vas a aprender de dos mentores sobre
                producción, mezcla y mastering. Acá enseñamos todo lo que no
                podemos enseñar en reels o tutoriales. Profundizamos de verdad y
                compartimos conocimientos reales, sin guardarnos secretos.
              </p>

              <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
                Nuestro objetivo es que puedas destacar dentro de la industria,
                con clases en vivo, acompañamiento cercano y una formación que va
                mucho más allá de lo técnico.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#cupos"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
                >
                  Quiero sumarme
                </a>
                <a
                  href="#modalidad"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                >
                  Ver modalidad
                </a>
              </div>
            </div>

            <div>
              <div className="rounded-[28px] border border-white/10 bg-white/1 p-6 shadow-2xl backdrop-blur">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-[#D4AF37]">
                    Qué trabajamos
                  </p>
                  <div className="mt-6 grid gap-3">
                    {pillars.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
                        <p className="text-sm text-white/85 md:text-base">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-12">
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/70">
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="modalidad"
        className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-12"
      >
        <hr className="my-6 border-t border-white/10" />
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#D4AF37]">
            Modalidad
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Simple, clara y pensada para que avances de verdad.
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {benefits.map((item) => (
            <div
              key={item}
              className="rounded-[24px] border border-white/10 bg-[#101015] p-6"
            >
              <p className="text-base leading-7 text-white/80">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-base leading-8 text-white/75">
            Esta mentoría es ideal si ya tenés una base sólida y necesitás
            conocimiento nuevo desde un nivel intermedio a avanzado. Es una
            suscripción mensual y podés cancelar cuando quieras.
          </p>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#D4AF37]">
                Más que clases técnicas
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                Trabajamos lo que realmente te hace crecer.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">
                Además de producción, mezcla y mastering, también vemos marketing
                para que puedas crear nuevas redes de contacto e ingresos,
                desarrollo profesional, sistemas de organización, hábitos,
                invitados especiales y herramientas concretas para crecer dentro
                de la industria.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#D4AF37]/20 bg-[#D4AF37]/8 p-8">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#f4d97c]">
                Acompañamiento
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-white">
                Soporte real durante toda la semana.
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/75">
                Vas a tener soporte directo por WhatsApp para resolver dudas y
                también la posibilidad de enviar canciones para recibir feedback,
                sentirte acompañado y avanzar con una guía cercana.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="cupos" className="pb-20 pt-10">
        <div className="mx-auto max-w-5xl px-6 md:px-10 lg:px-12">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#16161d] to-[#0d0d11] p-8 text-center shadow-2xl md:p-12">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#D4AF37]">
              Cupos limitados
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              Sumate a Entrenamiento Focus
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/70">
              Accedé a las clases en vivo, grabaciones, feedback y soporte
              durante la semana.
            </p>

            <div className="mx-auto mt-8 max-w-md rounded-[28px] border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-6 md:p-8">
              <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37]">
                Suscripción mensual
              </p>

              <div className="mt-4 flex flex-col items-center">
                <div className="flex items-end gap-2">
                  <span className="text-lg font-medium text-[#f4d97c] md:text-xl">
                    USD
                  </span>
                  <span className="text-5xl font-bold leading-none text-white md:text-6xl">
                    15
                  </span>
                </div>

                <p className="mt-3 text-sm font-medium text-white/60 md:text-base">
                  o
                </p>

                <p className="mt-1 text-xl font-semibold text-white/80 md:text-2xl">
                  ARS 19.500
                </p>
              </div>

              <p className="mt-5 text-sm leading-6 text-white/65">
                Se renueva automáticamente cada mes. Podés cancelar cuando
                quieras.
              </p>
            </div>

            {error && (
              <p className="mt-6 text-sm font-medium text-red-400">{error}</p>
            )}

            <div className="mt-8 flex flex-col items-center justify-center gap-6">
              {!authLoading && !user ? (
                <>
                  <p className="text-sm font-medium text-[#f4d97c]">
                    Iniciá sesión para suscribirte
                  </p>

                  <button
                    type="button"
                    onClick={goToLogin}
                    className="inline-flex min-w-[260px] items-center justify-center rounded-2xl bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
                  >
                    Iniciar sesión
                  </button>
                </>
              ) : (
                <>
                  <div className="grid w-full max-w-3xl gap-4 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleSelectProvider("paypal")}
                      className={`rounded-[24px] border p-5 text-left transition ${
                        selectedProvider === "paypal"
                          ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_25px_rgba(212,175,55,0.15)]"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                      }`}
                    >
                      <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37]">
                        Método de pago
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-white">
                        PayPal
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-white/65">
                        Ideal para usuarios fuera de Argentina. Suscripción
                        mensual automática.
                      </p>
                    </button>

                    {isArgentina && (
                      <button
                        type="button"
                        onClick={() => handleSelectProvider("mercadopago")}
                        className={`rounded-[24px] border p-5 text-left transition ${
                          selectedProvider === "mercadopago"
                            ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_25px_rgba(212,175,55,0.15)]"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                        }`}
                      >
                        <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37]">
                          Método de pago
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-white">
                          Mercado Pago
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-white/65">
                          Disponible para Argentina. Suscripción mensual
                          automática.
                        </p>
                      </button>
                    )}
                  </div>

                  <div className="w-full max-w-3xl">
                    {selectedProvider && (
                      <div className="rounded-[28px] border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-6 md:p-8">
                        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[#D4AF37]">
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
                  </div>
                </>
              )}

              <a
                href="https://wa.me/5493518736207?text=Hola%2C+quiero+consultar+por+la+mentor%C3%ADa+Entrenamiento+Focus"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Consultar por WhatsApp
              </a>
            </div>

            <p className="mt-4 text-lg text-[#f4d97c]/80">
              Importante: el correo de tu cuenta de Entrenamiento Focus tiene que
              coincidir con el correo de PayPal o Mercado Pago.
            </p>

            <p className="mt-5 text-xs text-white/45">
              {!user
                ? "Para suscribirte, primero tenés que iniciar sesión."
                : isArgentina
                ? "Si estás en Argentina, podés suscribirte con PayPal o Mercado Pago."
                : "Si estás fuera de Argentina, la suscripción se realiza con PayPal."}
            </p>
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
              ¿Corroboraste que el correo de tu cuenta de Entrenamiento Focus sea
              el mismo que el de la cuenta con la que vas a pagar?
            </p>

            <p className="mt-3 text-sm leading-7 text-white/60">
              Esto es importante para que podamos identificar correctamente tu
              suscripción y darte acceso sin problemas.
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
    </div>
  );
}