"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { forumService, ForumComment, ForumPost } from "@/services/forum.service"
import { articlesService, Article } from "@/services/articles.service"
import { Newspaper } from "lucide-react"

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

function linkifyText(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#a67c27] underline-offset-2 hover:underline"
      >
        {part}
      </a>
    ) : (
      part
    )
  )
}

function extractArticleSlugs(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const matches = text.match(urlRegex) || []
  const slugs: string[] = []

  matches.forEach((raw) => {
    try {
      const url = new URL(raw)
      if (url.host !== window.location.host) return

      const match = url.pathname.match(/^\/articulos\/([^/]+)\/?$/)
      if (match) {
        const slug = decodeURIComponent(match[1])
        if (!slugs.includes(slug)) slugs.push(slug)
      }
    } catch {
      // URL malformada, se ignora
    }
  })

  return slugs
}

function ArticlePreviewCard({ slug }: { slug: string }) {
  const [article, setArticle] = useState<Article | null>(null)

  useEffect(() => {
    let cancelled = false

    articlesService
      .getBySlug(slug)
      .then(({ article: data }) => {
        if (!cancelled) setArticle(data)
      })
      .catch(() => {
        // si no se encuentra el artículo, no se muestra la tarjeta
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (!article) return null

  return (
    <Link
      href={`/articulos/${article.slug}`}
      className="group mt-3 flex flex-col overflow-hidden rounded-2xl border border-[#2a2620]/10 bg-[#faf6ee] transition duration-300 hover:border-[#a67c27]/30 hover:bg-[#a67c27]/5"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#f4ecdf]">
        {article.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#6b6153]">
            <Newspaper className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4 sm:p-5">
        <p className="text-[18px] font-bold leading-snug text-[#2a2620] transition group-hover:text-[#a67c27] sm:text-[20px]">
          {article.title}
        </p>

        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#a67c27]">
          Ver artículo →
        </span>
      </div>
    </Link>
  )
}

function PostBody({ text, textClassName }: { text: string; textClassName: string }) {
  const articleSlugs = extractArticleSlugs(text)

  return (
    <>
      <p className={textClassName}>{linkifyText(text)}</p>

      {articleSlugs.map((slug) => (
        <ArticlePreviewCard key={slug} slug={slug} />
      ))}
    </>
  )
}

function ForoProximamente() {
  return (
    <main className="mt-16 flex min-h-screen items-center justify-center bg-[#f4ecdf] px-6 text-[#2a2620]">
      <div className="text-center">
        <h1 className="text-[32px] font-light tracking-[-0.03em] text-[#2a2620] sm:text-[40px]">
          Foro <span className="text-[#a67c27]">próximamente</span>
        </h1>

        <p className="mt-4 text-[15px] text-[#6b6153]">
          Estamos terminando de preparar esta sección. Volvé pronto.
        </p>
      </div>
    </main>
  )
}

export default function ForoPostPage() {
  const forumEnabled = process.env.NEXT_PUBLIC_SHOW_FORO === "true"

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

  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editTags, setEditTags] = useState("")
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

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
    if (forumEnabled && id) load()
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

  const handleStartEdit = () => {
    if (!post) return
    setEditTitle(post.title)
    setEditContent(post.content)
    setEditTags(post.tags.join(", "))
    setEditError(null)
    setEditing(true)
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setEditError(null)
  }

  const handleSaveEdit = async () => {
    if (!post) return
    if (!editTitle.trim() || !editContent.trim()) return

    setEditSubmitting(true)
    setEditError(null)

    try {
      const tagsArray = editTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      await forumService.update(post.id, {
        title: editTitle.trim(),
        content: editContent.trim(),
        tags: tagsArray,
      })
      setEditing(false)
      load()
    } catch (e: any) {
      setEditError(e?.message || "No se pudo actualizar el post")
    } finally {
      setEditSubmitting(false)
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

  if (!forumEnabled || (!loading && error)) {
    return <ForoProximamente />
  }

  return (
    <main className="mt-16 min-h-screen bg-[#f4ecdf] text-[#2a2620]">
      <section className="border-t border-[#2a2620]/10 px-5 py-12 md:px-12 md:py-16">
        <div className="mx-auto max-w-[860px]">
          <Link href="/foro" className="text-[13px] text-[#a67c27] hover:underline">
            ← Volver al foro
          </Link>

          {loading && (
            <p className="mt-8 text-[15px] text-[#6b6153]">Cargando...</p>
          )}

          {!loading && post && (
            <>
              <div className="mt-6 rounded-[28px] border border-[#2a2620]/10 bg-[#faf6ee] p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  {editing ? (
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Título"
                      className="w-full rounded-2xl border border-[#a67c27]/20 bg-[#f4ecdf] px-5 py-3.5 text-[20px] font-light text-[#2a2620] outline-none transition focus:border-[#a67c27]/60 sm:text-[28px]"
                    />
                  ) : (
                    <h1 className="text-[28px] font-light leading-[1.15] tracking-[-0.02em] text-[#2a2620] sm:text-[36px]">
                      {post.title}
                    </h1>
                  )}

                  {canDelete(post.authorId) && !editing && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={handleStartEdit}
                        className="rounded-full border border-[#a67c27]/30 px-4 py-1.5 text-[12px] font-medium text-[#a67c27] transition hover:bg-[#a67c27]/10"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={handleDeletePost}
                        className="rounded-full border border-red-700/30 px-4 py-1.5 text-[12px] font-medium text-red-700 transition hover:bg-red-700/10"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>

                <p className="mt-3 text-[13px] text-[#6b6153]">
                  {authorName(post.author)} · {formatDate(post.createdAt)}
                </p>

                {editing ? (
                  <div className="mt-6 space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Contenido"
                      rows={8}
                      className="w-full rounded-2xl border border-[#a67c27]/20 bg-[#f4ecdf] px-5 py-4 text-[15px] text-[#2a2620] placeholder:text-[#6b6153] outline-none transition focus:border-[#a67c27]/60"
                    />

                    <input
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="Tags (separados por coma)"
                      className="w-full rounded-2xl border border-[#a67c27]/20 bg-[#f4ecdf] px-5 py-3.5 text-[15px] text-[#2a2620] placeholder:text-[#6b6153] outline-none transition focus:border-[#a67c27]/60"
                    />

                    {editError && <p className="text-[13px] text-red-700">{editError}</p>}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        disabled={editSubmitting || !editTitle.trim() || !editContent.trim()}
                        className="inline-flex items-center justify-center rounded-full bg-[#a67c27] px-6 py-3 text-[15px] font-semibold text-[#2a2620] transition hover:scale-[1.02] hover:bg-[#c7952f] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {editSubmitting ? "Guardando..." : "Guardar"}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={editSubmitting}
                        className="inline-flex items-center justify-center rounded-full border border-[#a67c27]/20 px-6 py-3 text-[15px] font-medium text-[#6b6153] transition hover:bg-[#2a2620]/5 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <PostBody
                    text={post.content}
                    textClassName="mt-6 whitespace-pre-wrap text-[16px] leading-[1.8] text-[#2a2620]"
                  />
                )}

                {post.tags?.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#a67c27]/30 px-3 py-1 text-[11px] font-medium text-[#a67c27]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-10">
                <h2 className="text-[18px] font-medium text-[#2a2620]">
                  Comentarios{" "}
                  <span className="text-[#6b6153]">
                    ({post.comments?.length ?? 0})
                  </span>
                </h2>

                <div className="mt-5 space-y-4">
                  {(post.comments ?? []).map((c: ForumComment) => (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-[#2a2620]/10 bg-[#faf6ee] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-[13px] text-[#6b6153]">
                          <span className="font-medium text-[#6b6153]">
                            {authorName(c.author)}
                          </span>{" "}
                          · {formatDate(c.createdAt)}
                        </p>

                        {canDelete(c.authorId) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(c.id)}
                            className="shrink-0 text-[12px] font-medium text-red-700/80 transition hover:text-red-700"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>

                      <PostBody
                        text={c.content}
                        textClassName="mt-2 whitespace-pre-wrap text-[14px] leading-[1.7] text-[#2a2620]"
                      />
                    </div>
                  ))}

                  {(post.comments ?? []).length === 0 && (
                    <p className="text-[14px] text-[#6b6153]">
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
                        className="w-full rounded-2xl border border-[#a67c27]/20 bg-[#faf6ee] px-5 py-4 text-[15px] text-[#2a2620] placeholder:text-[#6b6153] outline-none transition focus:border-[#a67c27]/60"
                      />

                      {commentError && (
                        <p className="text-[13px] text-red-700">{commentError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={submitting || !comment.trim()}
                        className="inline-flex items-center justify-center rounded-full bg-[#a67c27] px-6 py-3 text-[15px] font-semibold text-[#2a2620] transition hover:scale-[1.02] hover:bg-[#c7952f] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submitting ? "Publicando..." : "Comentar"}
                      </button>
                    </form>
                  ) : (
                    <p className="text-[14px] text-[#6b6153]">
                      <Link href="/login" className="text-[#a67c27] hover:underline">
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
