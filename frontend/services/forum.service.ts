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
  content: string
  createdAt: string
  updatedAt: string
}

export type ForumPost = {
  id: string
  authorId: string
  author: ForumAuthor
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
  _count?: { comments: number }
  comments?: ForumComment[]
}

export type CreateForumPostDto = {
  title: string
  content: string
  tags?: string[]
}

export type UpdateForumPostDto = Partial<CreateForumPostDto>

export const forumService = {
  /**
   * List all forum posts (public).
   */
  async getAll(): Promise<{ posts: ForumPost[] }> {
    const data = await apiFetch(`/forum/posts`)
    return data as { posts: ForumPost[] }
  },

  /**
   * Search posts by keyword, matching title, content, tags or comments.
   */
  async search(q: string): Promise<{ posts: ForumPost[] }> {
    const data = await apiFetch(`/forum/search?q=${encodeURIComponent(q)}`)
    return data as { posts: ForumPost[] }
  },

  async getById(id: string): Promise<{ post: ForumPost }> {
    const data = await apiFetch(`/forum/posts/${id}`)
    return data as { post: ForumPost }
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
  async addComment(postId: string, content: string): Promise<{ comment: ForumComment }> {
    const data = await apiFetch(`/forum/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
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
