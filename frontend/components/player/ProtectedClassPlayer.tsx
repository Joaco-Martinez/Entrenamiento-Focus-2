"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { classesService } from "@/services/classes.service";
import { BunnyPlayerBridge } from "@/lib/playerjsBridge";
import { RefreshCw } from "lucide-react";

// Posiciones preestablecidas para la marca de agua: bordes y esquinas, nunca
// el centro (para no tapar lo importante del video). Cambia cada ~30s.
const WATERMARK_POSITIONS: Array<{ top: string; left: string }> = [
  { top: "6%", left: "5%" },
  { top: "6%", left: "70%" },
  { top: "88%", left: "5%" },
  { top: "88%", left: "68%" },
  { top: "46%", left: "3%" },
  { top: "46%", left: "80%" },
];

const WATERMARK_INTERVAL_MS = 30_000;
const PROGRESS_SAVE_INTERVAL_MS = 15_000;
const REFRESH_MARGIN_SECONDS = 45;

export default function ProtectedClassPlayer({ slug }: { slug: string }) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [watermark, setWatermark] = useState<{ name: string; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [watermarkIndex, setWatermarkIndex] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const bridgeRef = useRef<BunnyPlayerBridge | null>(null);
  const positionRef = useRef(0);
  const lastSavedPositionRef = useRef(0);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshPlaybackRef = useRef<() => Promise<void>>(async () => {});

  const loadPlayback = useCallback(async () => {
    const res = await classesService.getPlayback(slug);
    setEmbedUrl(res.embedUrl);
    setWatermark(res.watermark);
    positionRef.current = res.resumeFromSeconds;
    lastSavedPositionRef.current = res.resumeFromSeconds;

    const secondsUntilExpire = res.expiresAt - Math.floor(Date.now() / 1000);
    const delayMs = Math.max((secondsUntilExpire - REFRESH_MARGIN_SECONDS) * 1000, 20_000);

    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => refreshPlaybackRef.current(), delayMs);
  }, [slug]);

  const refreshPlayback = useCallback(async () => {
    setRefreshing(true);
    try {
      const live = await bridgeRef.current?.request<number>("getCurrentTime");
      const position = typeof live === "number" && Number.isFinite(live) ? live : positionRef.current;

      await classesService.saveProgress(slug, position).catch(() => {});
      lastSavedPositionRef.current = position;
      positionRef.current = position;

      await loadPlayback();
    } catch {
      setError("Se perdió la conexión con el video. Recargá la página.");
    } finally {
      setRefreshing(false);
    }
  }, [slug, loadPlayback]);

  useEffect(() => {
    refreshPlaybackRef.current = refreshPlayback;
  }, [refreshPlayback]);

  // Carga inicial
  useEffect(() => {
    setError(null);
    loadPlayback().catch((err: any) => {
      setError(err?.message || "No se pudo cargar el video.");
    });

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Bridge al iframe (una sola vez que el iframe existe): escucha tiempo de
  // reproducción real para guardar el progreso y para preservarlo al renovar.
  useEffect(() => {
    if (!embedUrl || !iframeRef.current || bridgeRef.current) return;

    const bridge = new BunnyPlayerBridge(iframeRef.current);
    bridge.on("timeupdate", (value: { seconds?: number }) => {
      if (typeof value?.seconds === "number") {
        positionRef.current = value.seconds;
      }
    });
    bridgeRef.current = bridge;

    return () => {
      bridge.destroy();
      bridgeRef.current = null;
    };
  }, [embedUrl]);

  // Guardado periódico de progreso mientras hay algo nuevo que guardar.
  useEffect(() => {
    const interval = setInterval(() => {
      const current = Math.floor(positionRef.current);
      if (Math.abs(current - lastSavedPositionRef.current) < 3) return;

      lastSavedPositionRef.current = current;
      classesService.saveProgress(slug, current).catch(() => {});
    }, PROGRESS_SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [slug]);

  // Guardado best-effort al salir de la página.
  useEffect(() => {
    const handleUnload = () => {
      const current = Math.floor(positionRef.current);
      if (current === lastSavedPositionRef.current) return;

      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/clases/${slug}/progress`;
        const blob = new Blob([JSON.stringify({ positionSeconds: current })], {
          type: "application/json",
        });
        navigator.sendBeacon?.(url, blob);
      } catch {
        // best-effort, no bloqueante
      }
    };

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") handleUnload();
    });
    window.addEventListener("pagehide", handleUnload);

    return () => {
      window.removeEventListener("pagehide", handleUnload);
    };
  }, [slug]);

  // Posición de la marca de agua: cambia sola cada ~30s.
  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkIndex((i) => (i + 1) % WATERMARK_POSITIONS.length);
    }, WATERMARK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-3xl border border-red-500/25 bg-red-500/10 text-sm text-red-200">
        {error}
      </div>
    );
  }

  if (!embedUrl) {
    return (
      <div className="flex aspect-video w-full animate-pulse items-center justify-center rounded-3xl border border-white/10 bg-black/40 text-sm text-white/40">
        Cargando video...
      </div>
    );
  }

  const pos = WATERMARK_POSITIONS[watermarkIndex];

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl"
      onContextMenu={(e) => e.preventDefault()}
    >
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
      />

      {watermark && (
        <div
          className="pointer-events-none absolute select-none whitespace-nowrap text-[11px] font-medium text-white/35 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] transition-all duration-1000 md:text-xs"
          style={{ top: pos.top, left: pos.left }}
        >
          {watermark.name.toLowerCase() === watermark.email.toLowerCase()
            ? watermark.email
            : `${watermark.name} · ${watermark.email}`}
        </div>
      )}

      {refreshing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <RefreshCw className="h-6 w-6 animate-spin text-white/70" />
        </div>
      )}
    </div>
  );
}
