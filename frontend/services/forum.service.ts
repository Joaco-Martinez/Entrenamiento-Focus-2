import { apiFetch } from "@/lib/api"

export type ForumAuthor = {
  id: string
  firstName: string | null
  lastName: string | null
  role?: string
}

export type ForumComment = {
  id: string
  postId: string
  authorId: string
  author: ForumAuthor
  content: string | null
  audioUrl: string | null
  audioDuration: number | null
  /** Onda del reproductor (48 valores 0-100). Vacío en comentarios viejos. */
  audioPeaks: number[]
  createdAt: string
  updatedAt: string
}

/** Un comentario nuevo: texto, audio, o los dos (nunca ninguno). */
export type NewCommentInput = {
  content?: string
  audio?: { blob: Blob; mimeType: string; peaks?: number[] }
}

export type ForumPost = {
  id: string
  authorId: string
  author: ForumAuthor
  title: string
  content: string
  tags: string[]
  articleSlug: string | null
  createdAt: string
  updatedAt: string
  _count?: { comments: number }
  /** In feed/search responses: only the oldest comment (see commentCount for the total). */
  comments?: ForumComment[]
  /** Only present in search results, when the match was found inside a comment. */
  matchedComment?: ForumComment | null
}

export type CreateForumPostDto = {
  title: string
  content: string
  tags?: string[]
}

export type UpdateForumPostDto = Partial<CreateForumPostDto>

function audioExtension(mimeType: string): string {
  if (mimeType.includes("mp4")) return "m4a"
  if (mimeType.includes("ogg")) return "ogg"
  if (mimeType.includes("wav")) return "wav"
  return "webm"
}

function buildCommentBody(input: NewCommentInput): BodyInit {
  if (input.audio) {
    const formData = new FormData()
    if (input.content) formData.append("content", input.content)
    formData.append(
      "audio",
      input.audio.blob,
      `voice-note.${audioExtension(input.audio.mimeType)}`
    )
    if (input.audio.peaks && input.audio.peaks.length) {
      formData.append("audioPeaks", JSON.stringify(input.audio.peaks))
    }
    return formData
  }
  return JSON.stringify({ content: input.content })
}

export const forumService = {
  /**
   * List all forum posts (public). Each post carries only its oldest
   * comment plus the total count — call getComments() to load the rest.
   */
  async getAll(options?: { onlyWithArticle?: boolean }): Promise<{ posts: ForumPost[] }> {
    const qs = options?.onlyWithArticle ? "?articulos=true" : ""
    const data = await apiFetch(`/forum/posts${qs}`)
    return data as { posts: ForumPost[] }
  },

  /**
   * Search posts by keyword, matching title, content, tags or comments.
   */
  async search(
    q: string,
    options?: { onlyWithArticle?: boolean }
  ): Promise<{ posts: ForumPost[] }> {
    const params = new URLSearchParams({ q })
    if (options?.onlyWithArticle) params.set("articulos", "true")
    const data = await apiFetch(`/forum/search?${params.toString()}`)
    return data as { posts: ForumPost[] }
  },

  async getById(id: string): Promise<{ post: ForumPost }> {
    const data = await apiFetch(`/forum/posts/${id}`)
    return data as { post: ForumPost }
  },

  /**
   * All comments for a post, oldest first. Used to expand a feed card.
   */
  async getComments(postId: string): Promise<{ comments: ForumComment[] }> {
    const data = await apiFetch(`/forum/posts/${postId}/comments`)
    return data as { comments: ForumComment[] }
  },

  /**
   * The canonical (oldest) forum post linked to an article, with its full
   * comment thread. Null if no post links that article yet.
   */
  async getByArticleSlug(slug: string): Promise<{ post: ForumPost | null }> {
    const data = await apiFetch(`/forum/by-article/${encodeURIComponent(slug)}`)
    return data as { post: ForumPost | null }
  },

  /**
   * Comment on an article. Requires auth. Attaches to the canonical post
   * for that slug, creating it first if none exists yet.
   */
  async addArticleComment(
    slug: string,
    input: NewCommentInput
  ): Promise<{ post: ForumPost; comment: ForumComment }> {
    const data = await apiFetch(`/forum/by-article/${encodeURIComponent(slug)}/comments`, {
      method: "POST",
      body: buildCommentBody(input),
    })
    return data as { post: ForumPost; comment: ForumComment }
  },

  /**
   * Create a new post. Requires auth.
   */
  async create(dto: CreateForumPostDto): Promise<{ post: ForumPost }> {
    const data = await apiFetch(`/forum/posts`, {
      method: "POST",
      body: JSON.stringify(dto),
    })
    return data as { post: ForumPost }
  },

  /**
   * Add a comment to a post. Requires auth.
   */
  async addComment(
    postId: string,
    input: NewCommentInput
  ): Promise<{ comment: ForumComment }> {
    const data = await apiFetch(`/forum/posts/${postId}/comments`, {
      method: "POST",
      body: buildCommentBody(input),
    })
    return data as { comment: ForumComment }
  },

  /**
   * Update a post. Requires auth (author or admin).
   */
  async update(id: string, dto: UpdateForumPostDto): Promise<{ post: ForumPost }> {
    const data = await apiFetch(`/forum/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    })
    return data as { post: ForumPost }
  },

  /**
   * Remove a post. Requires auth (author or admin).
   */
  async remove(id: string) {
    return apiFetch(`/forum/posts/${id}`, { method: "DELETE" })
  },

  /**
   * Remove a comment. Requires auth (author or admin).
   */
  async removeComment(id: string) {
    return apiFetch(`/forum/comments/${id}`, { method: "DELETE" })
  },
}
