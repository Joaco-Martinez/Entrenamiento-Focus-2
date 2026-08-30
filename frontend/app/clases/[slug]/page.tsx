"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, ShoppingCart, PlayCircle, Clapperboard } from "lucide-react";
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
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="aspect-video max-h-[420px] w-full rounded-3xl bg-card/40" />
          <div className="h-8 w-2/3 rounded bg-card/40" />
          <div className="h-24 w-full rounded bg-card/40" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-muted/20 px-4 py-24">
        <div className="mx-auto max-w-6xl text-center">
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

  const priceBlock = (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">Precio</p>
      <p className="mt-1 text-3xl font-extrabold leading-none text-primary md:text-4xl">
        {formatUsd(item.usdPrice)}
      </p>
      {formatArsEquivalent(item.arPrice) ? (
        <p className="mt-1.5 text-xs text-muted-foreground md:text-sm">
          {formatArsEquivalent(item.arPrice)}
        </p>
      ) : null}
    </div>
  );

  const actionBlock =
    isAuth && checkingAccess ? (
      <p className="text-center text-xs text-muted-foreground">Verificando tu acceso...</p>
    ) : isAuth && hasAccess ? (
      <Link
        href={`/clases/${item.slug}/ver`}
        className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        <PlayCircle className="h-4 w-4" />
        Ver clase
      </Link>
    ) : !showPurchase ? (
      <button
        type="button"
        onClick={handleBuyClick}
        className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        <ShoppingCart className="h-4 w-4" />
        Comprar clase
      </button>
    ) : (
      <ClasePurchaseWidget clase={item} />
    );

  // En mobile el bloque de compra vive fijo abajo de la pantalla; solo pasa
  // al flujo normal (debajo del título) cuando hay que mostrar el selector
  // de medio de pago, que puede crecer bastante (brick de MP, botón de PayPal).
  const mobileExpanded = showPurchase && !(isAuth && hasAccess);

  return (
    <section className="min-h-screen bg-muted/20 px-4 pb-28 pt-20 md:pb-16 md:pt-24">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => router.push("/clases")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a clases
        </button>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[3fr_2fr] md:items-start md:gap-x-10 md:gap-y-8">
          {/* Portada */}
          <div className="order-1 md:order-none md:col-start-1 md:row-start-1">
            <div className="relative aspect-video max-h-[420px] w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
              {item.coverImageUrl ? (
                <Image
                  src={item.coverImageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/25 via-black to-black px-6 text-center">
                  <div className="space-y-2">
                    <Clapperboard className="mx-auto h-8 w-8 text-primary/70" />
                    <p className="text-xl font-bold text-white md:text-2xl">{item.title}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Título + duración */}
          <div className="order-2 space-y-3 md:order-none md:col-start-1 md:row-start-2">
            <h1 className="text-3xl font-bold leading-tight md:text-4xl">{item.title}</h1>

            {duration && (
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {duration}
              </span>
            )}
          </div>

          {/* Panel de compra */}
          <div className="order-3 md:order-none md:col-start-2 md:row-start-1 md:row-span-3">
            {/* Desktop: panel compacto, sticky */}
            <div className="hidden space-y-4 rounded-3xl border border-white/10 bg-card p-5 shadow-xl md:sticky md:top-24 md:block">
              {priceBlock}
              {actionBlock}
            </div>

            {/* Mobile: fijo abajo, o expandido inline cuando hay que elegir medio de pago */}
            <div className="md:hidden">
              {mobileExpanded ? (
                <div className="space-y-4 rounded-3xl border border-white/10 bg-card p-5 shadow-xl">
                  {priceBlock}
                  {actionBlock}
                </div>
              ) : (
                <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-[#0b0b0b]/95 px-4 py-3 backdrop-blur-lg">
                  <div className="mx-auto flex max-w-6xl items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Precio
                      </p>
                      <p className="truncate text-xl font-extrabold leading-none text-primary">
                        {formatUsd(item.usdPrice)}
                      </p>
                    </div>
                    <div className="w-44 shrink-0">{actionBlock}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="order-4 md:order-none md:col-start-1 md:row-start-3">
            {item.description ? (
              <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            ) : (
              <p className="text-muted-foreground">Sin descripción.</p>
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
