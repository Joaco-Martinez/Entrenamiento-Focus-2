import { apiFetch } from "@/lib/api"

export type Article = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImageUrl?: string | null
  authorName: string
  published: boolean
  createdAt: string
  updatedAt: string
}

export type CreateArticleDto = {
  title: string
  excerpt: string
  content: string
  authorName?: string
  published?: boolean
}

export type UpdateArticleDto = Partial<CreateArticleDto>

export const articlesService = {
  /**
   * List public articles.
   */
  async getAll(): Promise<{ articles: Article[] }> {
    const data = await apiFetch(`/articles`);
    return data as { articles: Article[] };
  },

  async getBySlug(slug: string): Promise<{ article: Article }> {
    const data = await apiFetch(`/articles/${slug}`);
    return data as { article: Article };
  },

  /**
   * List articles for admin. Requires admin credentials.
   */
  async adminList(): Promise<{ articles: Article[] }> {
    const data = await apiFetch(`/articles/admin/articles`);
    return data as { articles: Article[] };
  },

  /**
   * Create a new article (admin only).
   */
  async create(dto: CreateArticleDto) {
    return apiFetch(`/articles/admin/articles`, {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  /**
   * Update an article (admin only).
   */
  async update(id: string, dto: UpdateArticleDto) {
    return apiFetch(`/articles/admin/articles/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    });
  },

  /**
   * Remove an article (admin only).
   */
  async remove(id: string) {
    return apiFetch(`/articles/admin/articles/${id}`, { method: "DELETE" });
  },

  /**
   * Upload the cover image for an article (admin only).
   */
  async uploadCover(id: string, file: File): Promise<{ article: Article }> {
    const formData = new FormData();
    formData.append("image", file);

    const data = await apiFetch(`/articles/admin/articles/${id}/cover`, {
      method: "POST",
      body: formData,
    });
    return data as { article: Article };
  },

  /**
   * Upload an image to embed in article content (admin only). Not tied to
   * any article id, so it also works while writing a brand-new article
   * that hasn't been saved yet.
   */
  async uploadContentImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("image", file);

    const data = await apiFetch(`/articles/admin/uploads/image`, {
      method: "POST",
      body: formData,
    });
    return data as { url: string };
  },
};
