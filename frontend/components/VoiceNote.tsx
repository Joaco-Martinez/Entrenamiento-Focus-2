"use client"

import { useEffect, useRef, useState } from "react"
import { Pause, Play } from "lucide-react"

export const MAX_RECORDING_SECONDS = 120
export const WAVEFORM_BARS = 48
const MIN_BAR_HEIGHT_PERCENT = 15

// En orden de preferencia: opus (mejor compresión) si el navegador lo
// soporta; Safari/iOS no soportan webm/opus pero sí graban en mp4/aac.
const CANDIDATE_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/ogg;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
]

export function isVoiceRecordingSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined"
  )
}

export function pickAudioMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return undefined
  return CANDIDATE_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type))
}

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds || 0))
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, "0")}`
}

/**
 * Decodifica el blob grabado UNA sola vez (al terminar de grabar, antes de
 * subir) y calcula 48 valores de amplitud RMS normalizados 0-100. Si
 * decodeAudioData falla por lo que sea, devuelve [] — el reproductor cae al
 * fallback de barras planas, nunca se reintenta decodificar en el feed.
 */
export async function computeAudioPeaks(
  blob: Blob,
  numBars: number = WAVEFORM_BARS
): Promise<number[]> {
  try {
    const AudioCtxCtor =
      typeof window !== "undefined" &&
      (window.AudioContext || (window as any).webkitAudioContext)
    if (!AudioCtxCtor) return []

    const arrayBuffer = await blob.arrayBuffer()
    const audioCtx: AudioContext = new AudioCtxCtor()

    try {
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
      const channelData = audioBuffer.getChannelData(0)
      const samplesPerBar = Math.max(1, Math.floor(channelData.length / numBars))

      const raw: number[] = []
      let max = 0

      for (let i = 0; i < numBars; i++) {
        const start = i * samplesPerBar
        const end =
          i === numBars - 1 ? channelData.length : Math.min(channelData.length, start + samplesPerBar)

        let sumSquares = 0
        for (let j = start; j < end; j++) sumSquares += channelData[j] * channelData[j]
        const rms = Math.sqrt(sumSquares / Math.max(1, end - start))

        raw.push(rms)
        if (rms > max) max = rms
      }

      return raw.map((v) => (max > 0 ? Math.round((v / max) * 100) : 0))
    } finally {
      audioCtx.close()
    }
  } catch {
    return []
  }
}

function barHeightPercent(value: number): number {
  return Math.max(MIN_BAR_HEIGHT_PERCENT, Math.min(100, value))
}

/** Pausa cualquier otro <audio> de la página: nunca suenan dos a la vez. */
function pauseOtherAudios(current: HTMLAudioElement) {
  document.querySelectorAll("audio").forEach((el) => {
    if (el !== current) el.pause()
  })
}

function StaticWaveform({
  peaks,
  progressRatio,
  onSeek,
}: {
  peaks: number[]
  progressRatio: number
  onSeek: (ratio: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Comentarios viejos no tienen audioPeaks: barras planas, nunca se
  // decodifica el audio acá para reconstruirlas.
  const bars = peaks.length === WAVEFORM_BARS ? peaks : Array(WAVEFORM_BARS).fill(40)

  const seekFromClientX = (clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0) return
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    onSeek(ratio)
  }

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label="Posición de la nota de voz"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progressRatio * 100)}
      className="flex h-8 flex-1 cursor-pointer touch-none items-center gap-[2px]"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        seekFromClientX(e.clientX)
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) seekFromClientX(e.clientX)
      }}
    >
      {bars.map((value, i) => {
        const played = i < Math.floor(progressRatio * WAVEFORM_BARS)
        return (
          <span
            key={i}
            className={`w-[3px] shrink-0 rounded-full transition-colors ${
              played ? "bg-[#a67c27]" : "bg-[#2a2620]/20"
            }`}
            style={{ height: `${barHeightPercent(value)}%` }}
          />
        )
      })}
    </div>
  )
}

/** Onda en vivo mientras se graba: crece hacia la derecha, no persiste. */
export function LiveWaveform({ levels }: { levels: number[] }) {
  return (
    <div className="flex h-8 flex-1 items-center gap-[2px] overflow-hidden">
      {levels.map((value, i) => (
        <span
          key={i}
          className="w-[3px] shrink-0 rounded-full bg-red-600/70"
          style={{ height: `${barHeightPercent(value)}%` }}
        />
      ))}
    </div>
  )
}

export function VoiceNotePlayer({
  src,
  duration,
  peaks,
}: {
  src: string
  duration?: number | null
  peaks?: number[]
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [knownDuration, setKnownDuration] = useState(duration ?? 0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlay = () => {
      pauseOtherAudios(audio)
      setPlaying(true)
    }
    const onPause = () => setPlaying(false)
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) setKnownDuration(audio.duration)
    }
    const onEnded = () => {
      setPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("ended", onEnded)

    return () => {
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("ended", onEnded)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play()
    else audio.pause()
  }

  const handleSeek = (ratio: number) => {
    const audio = audioRef.current
    const total = audio?.duration && isFinite(audio.duration) ? audio.duration : knownDuration
    if (!audio || !total) return
    audio.currentTime = ratio * total
    setCurrentTime(audio.currentTime)
  }

  const progressRatio = knownDuration > 0 ? Math.min(1, currentTime / knownDuration) : 0
  const displaySeconds = currentTime > 0 ? currentTime : knownDuration

  return (
    <div className="mt-2 flex items-center gap-3 rounded-full border border-[#a67c27]/20 bg-[#f4ecdf] px-4 py-2">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />

      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? "Pausar nota de voz" : "Reproducir nota de voz"}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#a67c27] text-[#2a2620] transition hover:bg-[#c7952f]"
      >
        {playing ? (
          <Pause className="h-3.5 w-3.5" />
        ) : (
          <Play className="ml-0.5 h-3.5 w-3.5" />
        )}
      </button>

      <StaticWaveform peaks={peaks ?? []} progressRatio={progressRatio} onSeek={handleSeek} />

      <span className="shrink-0 text-[13px] tabular-nums text-[#6b6153]">
        {formatTime(displaySeconds)}
      </span>
    </div>
  )
}
