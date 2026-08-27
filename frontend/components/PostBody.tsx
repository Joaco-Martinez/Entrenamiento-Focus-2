"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { articlesService, Article } from "@/services/articles.service"
import { Newspaper } from "lucide-react"

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

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text

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

export function extractArticleSlugs(text: string): string[] {
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

export function PostBody({
  text,
  textClassName,
  highlightQuery,
}: {
  text: string
  textClassName: string
  highlightQuery?: string
}) {
  const articleSlugs = extractArticleSlugs(text)

  return (
    <>
      <p className={textClassName}>
        {highlightQuery !== undefined ? highlightMatch(text, highlightQuery) : linkifyText(text)}
      </p>

      {articleSlugs.map((slug) => (
        <ArticlePreviewCard key={slug} slug={slug} />
      ))}
    </>
  )
}
