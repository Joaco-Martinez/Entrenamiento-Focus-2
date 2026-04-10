"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { paymentsService } from "@/services/payments.service";
import { CheckCircle2, MessageCircle, BellRing, Video } from "lucide-react";

type SubscriptionState = {
  subscriptionId: string | null;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  hasActiveSubscription: boolean;
} | null;

export default function SuscripcionExitPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<SubscriptionState>(null);

  useEffect(() => {
    let mounted = true;

    const checkSubscription = async () => {
      try {
        const mp = await paymentsService.subscriptionStatus().catch(() => null);
        const pp = await paymentsService
          .paypalSubscriptionStatus()
          .catch(() => null);

        const best = (pp?.hasActiveSubscription ? pp : mp) ?? mp ?? pp;

        if (!mounted) return;

        if (best) {
          setStatus({
            subscriptionId: best.subscriptionId ?? null,
            subscriptionStartDate: best.subscriptionStartDate ?? null,
            subscriptionEndDate: best.subscriptionEndDate ?? null,
            hasActiveSubscription: !!best.hasActiveSubscription,
          });
        } else {
          setStatus(null);
        }
      } catch {
        if (!mounted) return;
        setStatus(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    checkSubscription();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!loading && !status?.hasActiveSubscription) {
      router.replace("/");
    }
  }, [loading, status, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Cargando...
      </div>
    );
  }

  if (!status?.hasActiveSubscription) return null;

  return (
    <main className="mt-5 min-h-screen bg-black text-white flex items-center justify-center px-6 py-12">
      <section className="w-full max-w-3xl rounded-3xl border border-[#D4AF37]/20 bg-gradient-to-b from-[#111111] to-[#050505] shadow-[0_0_40px_rgba(212,175,55,0.12)] overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-[#D4AF37] via-[#f4d97c] to-[#D4AF37]" />

        <div className="px-8 py-12 md:px-12 md:py-14">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
            <CheckCircle2 className="h-10 w-10 text-[#D4AF37]" />
          </div>

          <div className="text-center">
            <p className="mb-3 inline-flex rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-1 text-sm font-medium text-[#f4d97c]">
              Suscripción activada con éxito ⚡
            </p>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              Bienvenido a{" "}
              <span className="text-[#D4AF37]">Entrenamiento Focus</span>
            </h1>

            <p className="mt-5 text-base md:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
              Ya sos parte de la membresía. Ahora unite a nuestro{" "}
              <span className="text-[#D4AF37] font-semibold">
                grupo privado de WhatsApp
              </span>{" "}
              para recibir toda la información importante.
            </p>

            {status.subscriptionId ? (
              <p className="mt-4 text-sm text-white/45">
                ID de suscripción: {status.subscriptionId}
              </p>
            ) : null}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <MessageCircle className="mb-3 h-6 w-6 text-[#D4AF37]" />
              <h2 className="font-semibold text-lg">Link de clases</h2>
              <p className="mt-2 text-sm text-white/65">
                Te enviamos el acceso para conectarte a las clases en vivo.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <BellRing className="mb-3 h-6 w-6 text-[#D4AF37]" />
              <h2 className="font-semibold text-lg">Anuncios importantes</h2>
              <p className="mt-2 text-sm text-white/65">
                Vas a recibir avisos importantes y novedades de la mentoría.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <Video className="mb-3 h-6 w-6 text-[#D4AF37]" />
              <h2 className="font-semibold text-lg">Recordatorios</h2>
              <p className="mt-2 text-sm text-white/65">
                Recordatorios antes de cada clase para que no te pierdas nada.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-6 text-center">
            <p className="text-sm uppercase tracking-[0.25em] text-[#f4d97c]/80">
              Acceso
            </p>

            <h3 className="mt-2 text-2xl md:text-3xl font-bold">
              Unite al grupo privado de WhatsApp
            </h3>

            <p className="mt-3 text-white/70 max-w-xl mx-auto">
              Tocá el botón de abajo para entrar ahora mismo al grupo y recibir
              toda la info de las clases.
            </p>

            <a
              href="https://chat.whatsapp.com/CTae35DPruJ72E8EhrI0dh"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#D4AF37] px-8 py-4 text-base font-bold text-black transition hover:scale-[1.02] hover:bg-[#f4d97c]"
            >
              Unirme al grupo de WhatsApp
            </a>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/panel"
              className="text-sm text-white/50 underline-offset-4 hover:text-white/80 hover:underline"
            >
              Ir a mi panel
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}