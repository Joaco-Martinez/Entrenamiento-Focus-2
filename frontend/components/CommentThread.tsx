"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Mic, Square, Trash2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { ForumComment, NewCommentInput } from "@/services/forum.service"
import { displayAuthorName, formatDateTime, linkifyText } from "@/components/PostBody"
import { ActionsMenu } from "@/components/ActionsMenu"
import {
  MAX_RECORDING_SECONDS,
  LiveWaveform,
  VoiceNotePlayer,
  computeAudioPeaks,
  formatTime,
  isVoiceRecordingSupported,
  pickAudioMimeType,
} from "@/components/VoiceNote"

export function CommentItem({
  comment,
  onDelete,
}: {
  comment: ForumComment
  onDelete?: () => void
}) {
  const { isAdmin, user } = useAuth()
  const canDelete = isAdmin || user?.id === comment.authorId

  return (
    <div className="rounded-2xl border border-[#2a2620]/10 bg-[#faf6ee] p-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[13px] text-[#6b6153]">
          <span
            className={`font-medium ${
              comment.author?.role === "ADMIN" ? "text-[#a67c27]" : "text-[#6b6153]"
            }`}
          >
            {displayAuthorName(comment.author)}
          </span>{" "}
          · {formatDateTime(comment.createdAt)}
        </p>

        {canDelete && onDelete && (
          <ActionsMenu items={[{ label: "Eliminar", onClick: onDelete, destructive: true }]} />
        )}
      </div>

      {comment.content && (
        <p className="mt-2 whitespace-pre-wrap text-[14px] leading-[1.7] text-[#2a2620]">
          {linkifyText(comment.content)}
        </p>
      )}

      {comment.audioUrl && (
        <VoiceNotePlayer
          src={comment.audioUrl}
          duration={comment.audioDuration}
          peaks={comment.audioPeaks}
        />
      )}
    </div>
  )
}

type RecState = "idle" | "recording" | "recorded"

export function CommentComposer({
  onSubmit,
  placeholder = "Escribí tu comentario...",
}: {
  onSubmit: (input: NewCommentInput) => Promise<void>
  placeholder?: string
}) {
  const { isAuth } = useAuth()
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [recState, setRecState] = useState<RecState>("idle")
  const [recSeconds, setRecSeconds] = useState(0)
  const [recError, setRecError] = useState<string | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [recordedMimeType, setRecordedMimeType] = useState("")
  const [recordedPeaks, setRecordedPeaks] = useState<number[]>([])
  const [liveLevels, setLiveLevels] = useState<number[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const liveAudioCtxRef = useRef<AudioContext | null>(null)
  const liveAnalyserRef = useRef<AnalyserNode | null>(null)
  const liveRafRef = useRef<number | null>(null)

  const recordingSupported = isVoiceRecordingSupported()

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  // Onda en vivo mientras graba (solo feedback visual, no es lo que se
  // guarda): un AnalyserNode sobre el mismo stream, muestreado con rAF.
  const startLiveWaveform = (stream: MediaStream) => {
    const AudioCtxCtor = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtxCtor) return

    const audioCtx: AudioContext = new AudioCtxCtor()
    const source = audioCtx.createMediaStreamSource(stream)
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)

    liveAudioCtxRef.current = audioCtx
    liveAnalyserRef.current = analyser
    setLiveLevels([])

    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    const SAMPLE_INTERVAL_MS = 120
    let lastSample = 0

    const tick = (ts: number) => {
      if (!liveAnalyserRef.current) return

      if (ts - lastSample > SAMPLE_INTERVAL_MS) {
        lastSample = ts
        liveAnalyserRef.current.getByteTimeDomainData(dataArray)

        let sumSquares = 0
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128
          sumSquares += v * v
        }
        const rms = Math.sqrt(sumSquares / dataArray.length)
        const level = Math.min(100, Math.round(rms * 400))
        setLiveLevels((prev) => [...prev.slice(-59), level])
      }

      liveRafRef.current = requestAnimationFrame(tick)
    }

    liveRafRef.current = requestAnimationFrame(tick)
  }

  const stopLiveWaveform = () => {
    if (liveRafRef.current) {
      cancelAnimationFrame(liveRafRef.current)
      liveRafRef.current = null
    }
    liveAnalyserRef.current = null
    liveAudioCtxRef.current?.close().catch(() => {})
    liveAudioCtxRef.current = null
  }

  // Corta sola a los 2 minutos.
  useEffect(() => {
    if (recState === "recording" && recSeconds >= MAX_RECORDING_SECONDS) {
      mediaRecorderRef.current?.stop()
      stopTimer()
      setRecError(`La grabación se cortó sola al llegar a ${MAX_RECORDING_SECONDS / 60} minutos.`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recSeconds, recState])

  // No dejar el micrófono prendido si el componente se desmonta grabando.
  useEffect(() => {
    return () => {
      stopTimer()
      stopStream()
      stopLiveWaveform()
      if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startRecording = async () => {
    setRecError(null)

    if (!recordingSupported) {
      setRecError("Tu navegador no permite grabar audio.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      startLiveWaveform(stream)

      const mimeType = pickAudioMimeType()
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType || "audio/webm"
        const blob = new Blob(chunksRef.current, { type })
        setRecordedBlob(blob)
        setRecordedUrl(URL.createObjectURL(blob))
        setRecordedMimeType(type)
        setRecState("recorded")
        stopStream()
        stopLiveWaveform()
        computeAudioPeaks(blob).then(setRecordedPeaks)
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setRecSeconds(0)
      setRecState("recording")
      timerRef.current = setInterval(() => {
        setRecSeconds((s) => s + 1)
      }, 1000)
    } catch (err: any) {
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        setRecError(
          "Necesitamos permiso para usar el micrófono. Habilitalo en la configuración del navegador e intentá de nuevo."
        )
      } else if (err?.name === "NotFoundError") {
        setRecError("No encontramos un micrófono disponible.")
      } else {
        setRecError("No se pudo iniciar la grabación.")
      }
    }
  }

  const stopRecording = () => {
    stopTimer()
    mediaRecorderRef.current?.stop()
  }

  const discardRecording = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    setRecordedBlob(null)
    setRecordedUrl(null)
    setRecordedPeaks([])
    setLiveLevels([])
    setRecSeconds(0)
    setRecError(null)
    setRecState("idle")
  }

  if (!isAuth) {
    return (
      <p className="text-[14px] text-[#6b6153]">
        <Link href="/login" className="text-[#a67c27] hover:underline">
          Iniciá sesión
        </Link>{" "}
        para dejar un comentario.
      </p>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = content.trim()
    if ((!trimmed && !recordedBlob) || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        content: trimmed || undefined,
        audio: recordedBlob
          ? { blob: recordedBlob, mimeType: recordedMimeType, peaks: recordedPeaks }
          : undefined,
      })
      setContent("")
      discardRecording()
    } catch (e: any) {
      setError(e?.message || "No se pudo publicar el comentario")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {recState === "recording" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-700/20 bg-red-700/5 px-5 py-4">
          <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-red-600" />
          <LiveWaveform levels={liveLevels} />
          <span className="shrink-0 text-[14px] font-medium tabular-nums text-[#2a2620]">
            {formatTime(recSeconds)}
          </span>

          <button
            type="button"
            onClick={stopRecording}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#2a2620] px-4 py-1.5 text-[12px] font-medium text-[#faf6ee] transition hover:opacity-90"
          >
            <Square className="h-3.5 w-3.5" />
            Detener
          </button>
        </div>
      ) : recState === "recorded" && recordedUrl ? (
        <div className="flex items-center gap-3 rounded-2xl border border-[#a67c27]/20 bg-[#f4ecdf] px-4 py-3">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={recordedUrl} className="h-9 flex-1" />
          <button
            type="button"
            onClick={discardRecording}
            aria-label="Descartar grabación"
            className="shrink-0 rounded-full p-2 text-red-700/70 transition hover:bg-red-700/10 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-2xl border border-[#a67c27]/20 bg-[#faf6ee] px-5 py-4 text-[15px] text-[#2a2620] placeholder:text-[#6b6153] outline-none transition focus:border-[#a67c27]/60"
        />
      )}

      {recError && <p className="text-[13px] text-red-700">{recError}</p>}
      {error && <p className="text-[13px] text-red-700">{error}</p>}

      <div className="flex items-center gap-3">
        {recState === "idle" && recordingSupported && (
          <button
            type="button"
            onClick={startRecording}
            aria-label="Grabar nota de voz"
            className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-[#a67c27]/30 text-[#a67c27] transition hover:bg-[#a67c27]/10"
          >
            <Mic className="h-4 w-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={submitting || (!content.trim() && !recordedBlob)}
          className="inline-flex items-center justify-center rounded-full bg-[#a67c27] px-6 py-2.5 text-[14px] font-semibold text-[#2a2620] transition hover:scale-[1.02] hover:bg-[#c7952f] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Publicando..." : "Comentar"}
        </button>
      </div>
    </form>
  )
}
