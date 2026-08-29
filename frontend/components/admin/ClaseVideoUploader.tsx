"use client";

import { useEffect, useRef, useState } from "react";
import { Upload as TusUpload } from "tus-js-client";
import { classesService, VideoStatus, VideoUploadTicket } from "@/services/classes.service";
import { UploadCloud, Pause, Play, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

const TICKET_STORAGE_PREFIX = "focus_clase_video_ticket_";

function loadStoredTicket(claseId: string): VideoUploadTicket | null {
  try {
    const raw = localStorage.getItem(TICKET_STORAGE_PREFIX + claseId);
    if (!raw) return null;
    const ticket = JSON.parse(raw) as VideoUploadTicket;
    if (ticket.expire * 1000 < Date.now()) return null;
    return ticket;
  } catch {
    return null;
  }
}

function storeTicket(claseId: string, ticket: VideoUploadTicket) {
  try {
    localStorage.setItem(TICKET_STORAGE_PREFIX + claseId, JSON.stringify(ticket));
  } catch {
    // localStorage puede fallar (modo privado, cuota); no es crítico para la subida.
  }
}

function clearStoredTicket(claseId: string) {
  try {
    localStorage.removeItem(TICKET_STORAGE_PREFIX + claseId);
  } catch {
    // no-op
  }
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

const BUNNY_STATUS_LABEL: Record<number, string> = {
  0: "Creado, esperando video",
  1: "Subido, en cola",
  2: "Procesando",
  3: "Codificando",
  4: "Listo",
  5: "Error de procesamiento",
};

export default function ClaseVideoUploader({
  claseId,
  hasExistingVideo,
  onUploaded,
}: {
  claseId: string;
  hasExistingVideo: boolean;
  onUploaded?: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "uploading" | "paused" | "done" | "error">(
    hasExistingVideo ? "done" : "idle"
  );
  const [progress, setProgress] = useState<{ sent: number; total: number }>({ sent: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<VideoStatus | null>(null);

  const uploadRef = useRef<TusUpload | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notifiedFinishedRef = useRef(false);

  useEffect(() => {
    if (!hasExistingVideo && phase !== "done") return;

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await classesService.getVideoStatus(claseId);
        if (cancelled) return;
        setVideoStatus(res);

        // Bunny ya calculó la duración final: avisamos para que la lista y
        // el resto del form (que la muestran de solo lectura) se actualicen.
        if (res.status === 4 && !notifiedFinishedRef.current) {
          notifiedFinishedRef.current = true;
          onUploaded?.();
        }
      } catch {
        // silencioso: no es crítico si un poll individual falla
      }
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [claseId, hasExistingVideo, phase]);

  const startUpload = async (file: File, resumeExisting: boolean) => {
    setError(null);
    setPhase("uploading");

    try {
      let ticket = resumeExisting ? loadStoredTicket(claseId) : null;

      if (!ticket) {
        const res = await classesService.initVideoUpload(claseId);
        ticket = res.upload;
        storeTicket(claseId, ticket);
      }

      const upload = new TusUpload(file, {
        endpoint: ticket.endpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000, 30000],
        chunkSize: 50 * 1024 * 1024,
        metadata: {
          filetype: file.type,
          title: file.name,
        },
        headers: {
          AuthorizationSignature: ticket.signature,
          AuthorizationExpire: String(ticket.expire),
          VideoId: ticket.videoId,
          LibraryId: ticket.libraryId,
        },
        onProgress: (bytesSent, bytesTotal) => {
          setProgress({ sent: bytesSent, total: bytesTotal });
        },
        onError: (err) => {
          setPhase("error");
          setError(err.message || "Error al subir el video");
        },
        onSuccess: () => {
          clearStoredTicket(claseId);
          setPhase("done");
          onUploaded?.();
        },
      });

      uploadRef.current = upload;

      const previous = await upload.findPreviousUploads();
      if (previous.length > 0) {
        upload.resumeFromPreviousUpload(previous[0]);
      }

      upload.start();
    } catch (err: any) {
      setPhase("error");
      setError(err?.message || "No se pudo iniciar la subida.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    startUpload(file, true);
  };

  const handlePause = () => {
    uploadRef.current?.abort(false);
    setPhase("paused");
  };

  const handleResume = () => {
    if (!uploadRef.current) return;
    setPhase("uploading");
    uploadRef.current.start();
  };

  const percent = progress.total > 0 ? Math.round((progress.sent / progress.total) * 100) : 0;

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {phase === "idle" && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white/80 transition hover:bg-white/[0.07]"
        >
          <UploadCloud className="h-4 w-4" />
          Subir video
        </button>
      )}

      {(phase === "uploading" || phase === "paused") && (
        <div className="space-y-2 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>{phase === "uploading" ? "Subiendo..." : "Pausado"}</span>
            <span>
              {formatBytes(progress.sent)} / {formatBytes(progress.total)} ({percent}%)
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-yellow-400 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="flex gap-2 pt-1">
            {phase === "uploading" ? (
              <button
                type="button"
                onClick={handlePause}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/[0.07]"
              >
                <Pause className="h-3.5 w-3.5" />
                Pausar
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResume}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-xs font-semibold text-yellow-200 hover:bg-yellow-400/15"
              >
                <Play className="h-3.5 w-3.5" />
                Reanudar
              </button>
            )}
          </div>
        </div>
      )}

      {phase === "error" && (
        <div className="space-y-2 rounded-2xl border border-red-500/25 bg-red-500/10 p-4">
          <div className="flex items-center gap-2 text-sm text-red-200">
            <XCircle className="h-4 w-4" />
            {error || "Ocurrió un error al subir el video."}
          </div>
          <p className="text-xs text-red-200/70">
            La subida quedó guardada: si volvés a elegir el mismo archivo, se reanuda
            desde donde quedó.
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-100 hover:bg-red-500/15"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </button>
        </div>
      )}

      {phase === "done" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            Video subido a Bunny
          </div>

          {videoStatus && videoStatus.status != null && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
              <p className="text-xs uppercase tracking-[0.14em] text-white/40">
                Estado de procesamiento (Bunny)
              </p>
              <p className="mt-1 font-medium text-white/85">
                {BUNNY_STATUS_LABEL[videoStatus.status] ?? `Código ${videoStatus.status}`}
              </p>
              {videoStatus.status !== 4 && videoStatus.status !== 5 && (
                <p className="mt-1 text-xs text-white/45">
                  Se actualiza solo cada 5 segundos.
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/70 transition hover:bg-white/[0.07]"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Reemplazar video
          </button>
        </div>
      )}
    </div>
  );
}
