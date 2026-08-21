"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { forumService, ForumComment, ForumPost } from "@/services/forum.service"

function authorName(author: { firstName: string | null; lastName: string | null } | null | undefined) {
  const name = [author?.firstName, author?.lastName].filter(Boolean).join(" ")
  return name || "Usuario"
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function ForoProximamente() {
  return (
    <main className="mt-16 flex min-h-screen items-center justify-center bg-[#111110] px-6 text-[#f0ede6]">
      <div className="text-center">
        <h1 className="text-[32px] font-light tracking-[-0.03em] text-[#f0ede6] sm:text-[40px]">
          Foro <span className="text-[#c8a84b]">próximamente</span>
        </h1>

        <p className="mt-4 text-[15px] text-[#f0ede6]/60">
          Estamos terminando de preparar esta sección. Volvé pronto.
        </p>
      </div>
    </main>
  )
}

export default function ForoPostPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { isAuth, isAdmin, user } = useAuth()

  const [post, setPost] = useState<ForumPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)

    try {
      const { post: data } = await forumService.getById(id)
      setPost(data)
    } catch (e: any) {
      setError(e?.message || "No se pudo cargar el post")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) load()
  }, [id])

  const canDelete = (authorId: string) => isAdmin || user?.id === authorId

  const handleDeletePost = async () => {
    if (!post) return
    if (!confirm("¿Seguro que querés eliminar este post? Esta acción no se puede deshacer.")) return

    try {
      await forumService.remove(post.id)
      router.push("/foro")
    } catch (e: any) {
      alert(e?.message || "No se pudo eliminar el post")
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("¿Seguro que querés eliminar este comentario?")) return

    try {
      await forumService.removeComment(commentId)
      load()
    } catch (e: any) {
      alert(e?.message || "No se pudo eliminar el comentario")
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    setSubmitting(true)
    setCommentError(null)

    try {
      await forumService.addComment(id, comment.trim())
      setComment("")
      load()
    } catch (e: any) {
      setCommentError(e?.message || "No se pudo publicar el comentario")
    } finally {
      setSubmitting(false)
    }
  }

  if (!loading && error) {
    return <ForoProximamente />
  }

  return (
    <main className="mt-16 min-h-screen bg-[#111110] text-[#f0ede6]">
      <section className="border-t border-[#c8a84b]/10 px-5 py-12 md:px-12 md:py-16">
        <div className="mx-auto max-w-[860px]">
          <Link href="/foro" className="text-[13px] text-[#c8a84b] hover:underline">
            ← Volver al foro
          </Link>

          {loading && (
            <p className="mt-8 text-[15px] text-[#f0ede6]/60">Cargando...</p>
          )}

          {!loading && post && (
            <>
              <div className="mt-6 rounded-[28px] border border-[#c8a84b]/10 bg-[#181816] p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-[28px] font-light leading-[1.15] tracking-[-0.02em] text-[#f0ede6] sm:text-[36px]">
                    {post.title}
                  </h1>

                  {canDelete(post.authorId) && (
                    <button
                      type="button"
                      onClick={handleDeletePost}
                      className="shrink-0 rounded-full border border-red-400/30 px-4 py-1.5 text-[12px] font-medium text-red-400 transition hover:bg-red-400/10"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <p className="mt-3 text-[13px] text-[#f0ede6]/50">
                  {authorName(post.author)} · {formatDate(post.createdAt)}
                </p>

                <p className="mt-6 whitespace-pre-wrap text-[16px] leading-[1.8] text-[#f0ede6]/85">
                  {post.content}
                </p>

                {post.tags?.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#c8a84b]/30 px-3 py-1 text-[11px] font-medium text-[#c8a84b]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-10">
                <h2 className="text-[18px] font-medium text-[#f0ede6]">
                  Comentarios{" "}
                  <span className="text-[#f0ede6]/40">
                    ({post.comments?.length ?? 0})
                  </span>
                </h2>

                <div className="mt-5 space-y-4">
                  {(post.comments ?? []).map((c: ForumComment) => (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-[#c8a84b]/10 bg-[#181816] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-[13px] text-[#f0ede6]/50">
                          <span className="font-medium text-[#f0ede6]/80">
                            {authorName(c.author)}
                          </span>{" "}
                          · {formatDate(c.createdAt)}
                        </p>

                        {canDelete(c.authorId) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(c.id)}
                            className="shrink-0 text-[12px] font-medium text-red-400/80 transition hover:text-red-400"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>

                      <p className="mt-2 whitespace-pre-wrap text-[14px] leading-[1.7] text-[#f0ede6]/80">
                        {c.content}
                      </p>
                    </div>
                  ))}

                  {(post.comments ?? []).length === 0 && (
                    <p className="text-[14px] text-[#f0ede6]/50">
                      Todavía no hay comentarios. Sé el primero en participar.
                    </p>
                  )}
                </div>

                <div className="mt-8">
                  {isAuth ? (
                    <form onSubmit={handleSubmitComment} className="space-y-3">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Escribí tu comentario..."
                        rows={4}
                        className="w-full rounded-2xl border border-[#c8a84b]/20 bg-[#181816] px-5 py-4 text-[15px] text-[#f0ede6] placeholder:text-[#f0ede6]/40 outline-none transition focus:border-[#c8a84b]/60"
                      />

                      {commentError && (
                        <p className="text-[13px] text-red-400">{commentError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={submitting || !comment.trim()}
                        className="inline-flex items-center justify-center rounded-full bg-[#c8a84b] px-6 py-3 text-[15px] font-semibold text-[#111110] transition hover:scale-[1.02] hover:bg-[#d8b85b] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submitting ? "Publicando..." : "Comentar"}
                      </button>
                    </form>
                  ) : (
                    <p className="text-[14px] text-[#f0ede6]/60">
                      <Link href="/login" className="text-[#c8a84b] hover:underline">
                        Iniciá sesión
                      </Link>{" "}
                      para dejar un comentario.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
