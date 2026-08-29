"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, ShoppingCart, PlayCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { classesService, VideoClass } from "@/services/classes.service";
import ClasePurchaseWidget from "@/components/checkout/ClasePurchaseWidget";

function formatUsd(value?: number | null) {
  if (!value) return null;
  return `US$${value.toLocaleString("en-US")}`;
}

function formatArsEquivalent(value?: number | null) {
  if (!value) return null;
  return `≈ $${value.toLocaleString("es-AR")} ARS con Mercado Pago`;
}

function formatDuration(seconds?: number | null) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function LoginRequiredModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm leading-relaxed text-white/85">
          Para comprar esta clase necesitás iniciar sesión.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => router.push(`/login?redirect=/clases/${slug}`)}
            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Iniciar sesión
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/15 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.05]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClaseDetallePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { isAuth, loading: authLoading } = useAuth();

  const [item, setItem] = useState<VideoClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(false);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);

  useEffect(() => {
    const run = async () => {
      setError(null);
      setLoading(true);

      try {
        const res = await classesService.getBySlug(slug);
        setItem(res.class);
      } catch (err: any) {
        setError(err?.message || "No se pudo cargar la clase.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) run();
  }, [slug]);

  useEffect(() => {
    if (authLoading || !item || !isAuth) {
      setHasAccess(null);
      return;
    }

    const run = async () => {
      setCheckingAccess(true);
      try {
        const res = await classesService.getAccess(slug);
        setHasAccess(Boolean(res.hasAccess));
      } catch {
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    run();
  }, [authLoading, isAuth, item, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 px-4 py-24">
        <div className="container mx-auto max-w-4xl animate-pulse space-y-6">
          <div className="aspect-video w-full rounded-3xl bg-card/40" />
          <div className="h-8 w-2/3 rounded bg-card/40" />
          <div className="h-24 w-full rounded bg-card/40" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-muted/20 px-4 py-24">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-muted-foreground">{error || "Clase no encontrada."}</p>
          <button
            onClick={() => router.push("/clases")}
            className="mt-6 inline-flex items-center gap-2 text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a clases
          </button>
        </div>
      </div>
    );
  }

  const duration = formatDuration(item.durationSeconds);

  const handleBuyClick = () => {
    if (!isAuth) {
      setShowLoginModal(true);
      return;
    }
    setShowPurchase(true);
  };

  return (
    <section className="min-h-screen bg-muted/20 px-4 py-20 md:py-24">
      <div className="container mx-auto max-w-4xl space-y-8">
        <button
          onClick={() => router.push("/clases")}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a clases
        </button>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 shadow-2xl">
          <div className="relative aspect-video w-full">
            <Image
              src={item.coverImageUrl || "/placeholder.svg"}
              alt={item.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold leading-tight md:text-4xl">{item.title}</h1>

            {duration && (
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {duration}
              </span>
            )}

            {item.description ? (
              <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            ) : (
              <p className="text-muted-foreground">Sin descripción.</p>
            )}
          </div>

          <div className="h-fit space-y-4 rounded-3xl border border-white/10 bg-card p-6 shadow-xl">
            <div>
              <p className="text-sm text-muted-foreground">Precio</p>
              <p className="mt-1 text-4xl font-extrabold text-primary">
                {formatUsd(item.usdPrice)}
              </p>
              {formatArsEquivalent(item.arPrice) ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatArsEquivalent(item.arPrice)}
                </p>
              ) : null}
            </div>

            {isAuth && checkingAccess && (
              <p className="text-center text-xs text-muted-foreground">
                Verificando tu acceso...
              </p>
            )}

            {isAuth && !checkingAccess && hasAccess ? (
              <Link
                href={`/clases/${item.slug}/ver`}
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <PlayCircle className="h-4 w-4" />
                Ver clase
              </Link>
            ) : !showPurchase ? (
              <>
                <button
                  type="button"
                  onClick={handleBuyClick}
                  disabled={isAuth && checkingAccess}
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Comprar clase
                </button>
              </>
            ) : (
              <ClasePurchaseWidget clase={item} />
            )}
          </div>
        </div>
      </div>

      {showLoginModal && (
        <LoginRequiredModal onClose={() => setShowLoginModal(false)} />
      )}
    </section>
  );
}
