"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { articlesService, Article } from "@/services/articles.service"
import { Newspaper } from "lucide-react"

export function displayAuthorName(
  author: { firstName: string | null; lastName: string | null; role?: string } | null | undefined,
  options: { isArticlePost?: boolean } = {}
) {
  if (author?.role === "ADMIN") {
    return options.isArticlePost ? "Artículo Focus" : "Entrenamiento Focus"
  }
  const name = [author?.firstName, author?.lastName].filter(Boolean).join(" ")
  return name || "Usuario"
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function linkifyText(text: string) {
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

/**
 * Removes the raw URL that points to the given article slug from the
 * displayed text: the preview card already links there, showing the bare
 * URL too is redundant.
 */
export function stripArticleUrl(text: string, slug: string): string {
  const urlRegex = /https?:\/\/[^\s]+/g

  return text
    .replace(urlRegex, (raw) => {
      try {
        const url = new URL(raw)
        const match = url.pathname.match(/^\/articulos\/([^/?#]+)\/?$/)
        if (match && decodeURIComponent(match[1]) === slug) return ""
        return raw
      } catch {
        return raw
      }
    })
    .trim()
}

export function ArticlePreviewCard({ slug, postId }: { slug: string; postId?: string }) {
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

  const href = `/articulos/${article.slug}?from=foro${postId ? `&post=${postId}` : ""}`

  return (
    <Link
      href={href}
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
