"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { forumService, ForumComment, ForumPost } from "@/services/forum.service"
import { displayAuthorName, formatDateTime, linkifyText } from "@/components/PostBody"
import { CommentItem, CommentComposer } from "@/components/CommentThread"

export function ForoPostDetail({ initialPost }: { initialPost: ForumPost }) {
  const router = useRouter()
  const { isAdmin, user } = useAuth()

  const [post, setPost] = useState<ForumPost>(initialPost)

  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editTags, setEditTags] = useState("")
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const reload = async () => {
    const { post: data } = await forumService.getById(post.id)
    setPost(data)
  }

  const canDelete = (authorId: string) => isAdmin || user?.id === authorId

  const handleDeletePost = async () => {
    if (!confirm(`¿Eliminar el post "${post.title}"? Esta acción no se puede deshacer.`)) return

    try {
      await forumService.remove(post.id)
      router.push("/foro")
    } catch (e: any) {
      alert(e?.message || "No se pudo eliminar el post")
    }
  }

  const handleStartEdit = () => {
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
      await reload()
      router.refresh()
    } catch (e: any) {
      setEditError(e?.message || "No se pudo actualizar el post")
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleDeleteComment = async (comment: ForumComment) => {
    const author = displayAuthorName(comment.author)
    if (!confirm(`¿Eliminar el comentario de ${author}? Esta acción no se puede deshacer.`)) return

    try {
      await forumService.removeComment(comment.id)
      await reload()
    } catch (e: any) {
      alert(e?.message || "No se pudo eliminar el comentario")
    }
  }

  const handleAddComment = async (content: string) => {
    await forumService.addComment(post.id, content)
    await reload()
  }

  return (
    <main className="mt-16 min-h-screen bg-[#f4ecdf] text-[#2a2620]">
      <section className="border-t border-[#2a2620]/10 px-5 py-12 md:px-12 md:py-16">
        <div className="mx-auto max-w-[860px]">
          <Link href="/foro" className="text-[13px] text-[#a67c27] hover:underline">
            ← Volver al foro
          </Link>

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
                <div className="flex shrink-0 items-center gap-8">
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
                    className="text-[12px] font-medium text-red-700/60 underline-offset-2 transition hover:text-red-700 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>

            <p className="mt-3 text-[13px] text-[#6b6153]">
              <span className={post.author?.role === "ADMIN" ? "text-[#a67c27]" : undefined}>
                {displayAuthorName(post.author)}
              </span>{" "}
              · {formatDateTime(post.createdAt)}
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
              <p className="mt-6 whitespace-pre-wrap text-[16px] leading-[1.8] text-[#2a2620]">
                {linkifyText(post.content)}
              </p>
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
              <span className="text-[#6b6153]">({post.comments?.length ?? 0})</span>
            </h2>

            <div className="mt-5 space-y-4">
              {(post.comments ?? []).map((c) => (
                <CommentItem key={c.id} comment={c} onDelete={() => handleDeleteComment(c)} />
              ))}

              {(post.comments ?? []).length === 0 && (
                <p className="text-[14px] text-[#6b6153]">
                  Todavía no hay comentarios. Sé el primero en participar.
                </p>
              )}
            </div>

            <div className="mt-8">
              <CommentComposer onSubmit={handleAddComment} />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
