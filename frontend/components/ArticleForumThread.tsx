"use client"

import { useEffect, useState } from "react"
import { forumService, ForumPost, ForumComment } from "@/services/forum.service"
import { CommentItem, CommentComposer } from "@/components/CommentThread"
import { displayAuthorName } from "@/components/PostBody"

export function ArticleForumThread({ slug }: { slug: string }) {
  const [post, setPost] = useState<ForumPost | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const { post: data } = await forumService.getByArticleSlug(slug)
      setPost(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [slug])

  const handleAddComment = async (content: string) => {
    await forumService.addArticleComment(slug, content)
    await load()
  }

  const handleDeleteComment = async (comment: ForumComment) => {
    const author = displayAuthorName(comment.author)
    if (!confirm(`¿Eliminar el comentario de ${author}? Esta acción no se puede deshacer.`)) return

    try {
      await forumService.removeComment(comment.id)
      await load()
    } catch (e: any) {
      alert(e?.message || "No se pudo eliminar el comentario")
    }
  }

  if (loading) {
    return (
      <div className="mx-auto mt-16 max-w-[800px] border-t border-[#2a2620]/10 pt-10">
        <p className="text-[14px] text-[#6b6153]">Cargando comentarios...</p>
      </div>
    )
  }

  const comments = post?.comments ?? []

  return (
    <div className="mx-auto mt-16 max-w-[800px] border-t border-[#2a2620]/10 pt-10">
      <h2 className="text-[20px] font-medium text-[#2a2620]">
        Comentarios <span className="text-[#6b6153]">({comments.length})</span>
      </h2>

      <div className="mt-5 space-y-4">
        {comments.map((c) => (
          <CommentItem key={c.id} comment={c} onDelete={() => handleDeleteComment(c)} />
        ))}

        {comments.length === 0 && (
          <p className="text-[14px] text-[#6b6153]">
            Todavía no hay comentarios. Sé el primero en participar.
          </p>
        )}
      </div>

      <div className="mt-8">
        <CommentComposer onSubmit={handleAddComment} />
      </div>
    </div>
  )
}
