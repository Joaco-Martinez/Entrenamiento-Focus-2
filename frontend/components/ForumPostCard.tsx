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
}: {
  post: ForumPost
  highlightQuery?: string
}) {
  const { user } = useAuth()
  const isArticlePost = !!post.articleSlug

  const [bodyExpanded, setBodyExpanded] = useState(false)
  const [commentsExpanded, setCommentsExpanded] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)
  const [comments, setComments] = useState<ForumComment[]>(post.comments ?? [])
  const [commentCount, setCommentCount] = useState(post._count?.comments ?? 0)

  const rawText = isArticlePost ? stripArticleUrl(post.content, post.articleSlug!) : post.content
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

  const visibleComments = commentsExpanded ? comments : comments.slice(0, 1)

  return (
    <div className="rounded-[28px] border border-[#2a2620]/10 bg-[#faf6ee] p-6">
      <h2 className="text-[20px] font-medium leading-tight text-[#2a2620]">
        {highlightMatch(post.title, highlightQuery)}
      </h2>

      <p className="mt-2 text-[13px] text-[#6b6153]">
        <span className={post.author?.role === "ADMIN" ? "text-[#a67c27]" : undefined}>
          {displayAuthorName(post.author, { isArticlePost })}
        </span>{" "}
        · {formatDateTime(post.createdAt)}
      </p>

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

      {isArticlePost && <ArticlePreviewCard slug={post.articleSlug!} postId={post.id} />}

      {post.matchedComment && (
        <div className="mt-4 rounded-2xl border border-[#2a2620]/10 bg-[#f4ecdf] p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#a67c27]">
            Coincidencia en un comentario de {displayAuthorName(post.matchedComment.author)}
          </p>

          <p className="mt-2 line-clamp-2 text-[13px] leading-[1.6] text-[#6b6153]">
            {highlightMatch(post.matchedComment.content, highlightQuery)}
          </p>
        </div>
      )}

      {post.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
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
