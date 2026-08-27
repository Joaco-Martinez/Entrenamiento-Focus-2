"use client"

import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { ForumComment } from "@/services/forum.service"
import { displayAuthorName, formatDateTime, linkifyText } from "@/components/PostBody"

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
          <button
            type="button"
            onClick={onDelete}
            className="shrink-0 text-[12px] font-medium text-red-700/80 transition hover:text-red-700"
          >
            Eliminar
          </button>
        )}
      </div>

      <p className="mt-2 whitespace-pre-wrap text-[14px] leading-[1.7] text-[#2a2620]">
        {linkifyText(comment.content)}
      </p>
    </div>
  )
}

export function CommentComposer({
  onSubmit,
  placeholder = "Escribí tu comentario...",
}: {
  onSubmit: (content: string) => Promise<void>
  placeholder?: string
}) {
  const { isAuth } = useAuth()
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    if (!content.trim() || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      await onSubmit(content.trim())
      setContent("")
    } catch (e: any) {
      setError(e?.message || "No se pudo publicar el comentario")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-2xl border border-[#a67c27]/20 bg-[#faf6ee] px-5 py-4 text-[15px] text-[#2a2620] placeholder:text-[#6b6153] outline-none transition focus:border-[#a67c27]/60"
      />

      {error && <p className="text-[13px] text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !content.trim()}
        className="inline-flex items-center justify-center rounded-full bg-[#a67c27] px-6 py-2.5 text-[14px] font-semibold text-[#2a2620] transition hover:scale-[1.02] hover:bg-[#c7952f] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Publicando..." : "Comentar"}
      </button>
    </form>
  )
}
