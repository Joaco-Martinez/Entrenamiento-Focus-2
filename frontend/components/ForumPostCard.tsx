"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { forumService, ForumPost, ForumComment } from "@/services/forum.service"
import {
  displayAuthorName,
  formatDateTime,
  linkifyText,
  stripArticleUrl,
  ArticlePreviewCard,
} from "@/components/PostBody"
import { CommentItem, CommentComposer } from "@/components/CommentThread"
import { ActionsMenu } from "@/components/ActionsMenu"

function highlightMatch(text: string, query?: string) {
  if (!query || !query.trim()) return text

  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text

  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-[#a67c27]/25 px-0.5 text-[#2a2620]">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

// ~4 lines of body copy at this font size; there's no reliable way to
// measure real wrapped lines without a layout pass, so this is a proxy.
const BODY_TRUNCATE_THRESHOLD = 220

export function ForumPostCard({
  post,
  highlightQuery,
  onDeleted,
}: {
  post: ForumPost
  highlightQuery?: string
  onDeleted?: (postId: string) => void
}) {
  const { user, isAdmin } = useAuth()
  const canManagePost = isAdmin || user?.id === post.authorId

  const [postData, setPostData] = useState<ForumPost>(post)
  const isArticlePost = !!postData.articleSlug

  const [bodyExpanded, setBodyExpanded] = useState(false)
  const [commentsExpanded, setCommentsExpanded] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)
  const [comments, setComments] = useState<ForumComment[]>(post.comments ?? [])
  const [commentCount, setCommentCount] = useState(post._count?.comments ?? 0)

  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editTags, setEditTags] = useState("")
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const rawText = isArticlePost
    ? stripArticleUrl(postData.content, postData.articleSlug!)
    : postData.content
  const isLong = rawText.length > BODY_TRUNCATE_THRESHOLD
  const displayText = !bodyExpanded && isLong ? `${rawText.slice(0, BODY_TRUNCATE_THRESHOLD)}…` : rawText

  const handleToggleComments = async () => {
    if (commentsExpanded) {
      setCommentsExpanded(false)
      return
    }

    // ya tenemos todos los comentarios cargados de una expansión anterior
    if (comments.length >= commentCount || loadingComments) {
      setCommentsExpanded(true)
      return
    }

    setLoadingComments(true)
    try {
      const { comments: all } = await forumService.getComments(post.id)
      setComments(all)
      setCommentsExpanded(true)
    } catch {
      // si falla, dejamos el primer comentario visible
    } finally {
      setLoadingComments(false)
    }
  }

  const handleAddComment = async (content: string) => {
    const tempId = `temp-${Date.now()}`
    const optimistic: ForumComment = {
      id: tempId,
      postId: post.id,
      authorId: user?.id ?? "",
      author: {
        id: user?.id ?? "",
        firstName: user?.firstName ?? null,
        lastName: user?.lastName ?? null,
        role: user?.role,
      },
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const previousComments = comments
    const previousCount = commentCount
    const previousExpanded = commentsExpanded

    setComments((prev) => [...prev, optimistic])
    setCommentsExpanded(true)
    setCommentCount((c) => c + 1)

    try {
      await forumService.addComment(post.id, content)
      const { comments: all } = await forumService.getComments(post.id)
      setComments(all)
      setCommentCount(all.length)
    } catch (e) {
      setComments(previousComments)
      setCommentCount(previousCount)
      setCommentsExpanded(previousExpanded)
      throw e
    }
  }

  const handleDeleteComment = async (comment: ForumComment) => {
    const author = displayAuthorName(comment.author)
    if (!confirm(`¿Eliminar el comentario de ${author}? Esta acción no se puede deshacer.`)) return

    const previousComments = comments
    setComments((prev) => prev.filter((c) => c.id !== comment.id))
    setCommentCount((c) => Math.max(0, c - 1))

    try {
      await forumService.removeComment(comment.id)
    } catch {
      setComments(previousComments)
      setCommentCount((c) => c + 1)
    }
  }

  const handleStartEdit = () => {
    setEditTitle(postData.title)
    setEditContent(postData.content)
    setEditTags(postData.tags.join(", "))
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

      const { post: updated } = await forumService.update(post.id, {
        title: editTitle.trim(),
        content: editContent.trim(),
        tags: tagsArray,
      })
      setPostData(updated)
      setEditing(false)
    } catch (e: any) {
      setEditError(e?.message || "No se pudo actualizar el post")
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleDeletePost = async () => {
    if (!confirm(`¿Eliminar el post "${postData.title}"? Esta acción no se puede deshacer.`)) return

    try {
      await forumService.remove(post.id)
      onDeleted?.(post.id)
    } catch (e: any) {
      alert(e?.message || "No se pudo eliminar el post")
    }
  }

  const visibleComments = commentsExpanded ? comments : comments.slice(0, 1)

  return (
    <div className="rounded-[28px] border border-[#2a2620]/10 bg-[#faf6ee] p-6">
      <div className="flex items-start justify-between gap-3">
        {editing ? (
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Título"
            className="w-full rounded-2xl border border-[#a67c27]/20 bg-[#f4ecdf] px-4 py-2 text-[18px] font-medium text-[#2a2620] outline-none transition focus:border-[#a67c27]/60"
          />
        ) : (
          <h2 className="text-[20px] font-medium leading-tight text-[#2a2620]">
            {highlightMatch(postData.title, highlightQuery)}
          </h2>
        )}

        {canManagePost && !editing && (
          <ActionsMenu
            items={[
              { label: "Editar", onClick: handleStartEdit },
              { label: "Eliminar", onClick: handleDeletePost, destructive: true },
            ]}
          />
        )}
      </div>

      <p className="mt-2 text-[13px] text-[#6b6153]">
        <span className={postData.author?.role === "ADMIN" ? "text-[#a67c27]" : undefined}>
          {displayAuthorName(postData.author, { isArticlePost })}
        </span>{" "}
        · {formatDateTime(postData.createdAt)}
      </p>

      {editing ? (
        <div className="mt-4 space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Contenido"
            rows={6}
            className="w-full rounded-2xl border border-[#a67c27]/20 bg-[#f4ecdf] px-4 py-3 text-[14px] text-[#2a2620] placeholder:text-[#6b6153] outline-none transition focus:border-[#a67c27]/60"
          />

          <input
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
            placeholder="Tags (separados por coma)"
            className="w-full rounded-2xl border border-[#a67c27]/20 bg-[#f4ecdf] px-4 py-2.5 text-[14px] text-[#2a2620] placeholder:text-[#6b6153] outline-none transition focus:border-[#a67c27]/60"
          />

          {editError && <p className="text-[13px] text-red-700">{editError}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={editSubmitting || !editTitle.trim() || !editContent.trim()}
              className="inline-flex items-center justify-center rounded-full bg-[#a67c27] px-5 py-2 text-[14px] font-semibold text-[#2a2620] transition hover:scale-[1.02] hover:bg-[#c7952f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {editSubmitting ? "Guardando..." : "Guardar"}
            </button>

            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={editSubmitting}
              className="inline-flex items-center justify-center rounded-full border border-[#a67c27]/20 px-5 py-2 text-[14px] font-medium text-[#6b6153] transition hover:bg-[#2a2620]/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          {displayText && (
            <p className="mt-4 whitespace-pre-wrap text-[14px] leading-[1.6] text-[#6b6153]">
              {highlightMatch(displayText, highlightQuery)}
              {!bodyExpanded && isLong && (
                <>
                  {" "}
                  <button
                    type="button"
                    onClick={() => setBodyExpanded(true)}
                    className="font-semibold text-[#a67c27] hover:underline"
                  >
                    Leer más
                  </button>
                </>
              )}
            </p>
          )}

          {isArticlePost && <ArticlePreviewCard slug={postData.articleSlug!} postId={post.id} />}

          {postData.matchedComment && (
            <div className="mt-4 rounded-2xl border border-[#2a2620]/10 bg-[#f4ecdf] p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#a67c27]">
                Coincidencia en un comentario de {displayAuthorName(postData.matchedComment.author)}
              </p>

              <p className="mt-2 line-clamp-2 text-[13px] leading-[1.6] text-[#6b6153]">
                {highlightMatch(postData.matchedComment.content, highlightQuery)}
              </p>
            </div>
          )}

          {postData.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {postData.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#a67c27]/30 px-3 py-1 text-[11px] font-medium text-[#a67c27]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      {visibleComments.length > 0 && (
        <div className="mt-5 space-y-3">
          {visibleComments.map((c) => (
            <CommentItem key={c.id} comment={c} onDelete={() => handleDeleteComment(c)} />
          ))}
        </div>
      )}

      {commentCount > 1 && (
        <button
          type="button"
          onClick={handleToggleComments}
          disabled={loadingComments}
          className="mt-3 text-[13px] font-semibold text-[#a67c27] hover:underline disabled:opacity-60"
        >
          {loadingComments
            ? "Cargando..."
            : commentsExpanded
            ? "Ver menos comentarios"
            : `Ver los ${commentCount} comentarios`}
        </button>
      )}

      <div className="mt-5 border-t border-[#2a2620]/10 pt-4">
        <CommentComposer onSubmit={handleAddComment} />
      </div>
    </div>
  )
}
