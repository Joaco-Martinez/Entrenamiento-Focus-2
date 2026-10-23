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

function highlightInText(value: string, query?: string) {
  const term = query?.trim()
  if (!term) return value

  const index = value.toLocaleLowerCase().indexOf(term.toLocaleLowerCase())
  if (index === -1) return value

  return (
    <>
      {value.slice(0, index)}
      <mark className="rounded bg-[#a67c27]/25 px-0.5 text-[#2a2620]">
        {value.slice(index, index + term.length)}
      </mark>
      {value.slice(index + term.length)}
    </>
  )
}

// Quita signos de puntuación que suelen quedar pegados al final de una URL
// en el texto de un post (por ejemplo, "https://ejemplo.com.").
function splitUrlEnding(value: string) {
  let end = value.length

  while (end > 0) {
    const last = value[end - 1]
    if (".,;:!?".includes(last)) {
      end--
      continue
    }

    const current = value.slice(0, end)
    const unbalanced = (open: string, close: string) =>
      current.split(close).length > current.split(open).length

    if (
      (last === ")" && unbalanced("(", ")")) ||
      (last === "]" && unbalanced("[", "]")) ||
      (last === "}" && unbalanced("{", "}"))
    ) {
      end--
      continue
    }

    break
  }

  return [value.slice(0, end), value.slice(end)] as const
}

/** Convierte URLs escritas en publicaciones y comentarios en enlaces seguros. */
export function linkifyText(text: string, highlightQuery?: string) {
  // El separador inicial evita detectar enlaces en medio de otra palabra.
  const urlRegex = /(^|[\s([{"'«])((?:https?:\/\/|www\.)[^\s<>"']+)/gi
  const nodes = []
  let cursor = 0

  for (const match of text.matchAll(urlRegex)) {
    const start = (match.index ?? 0) + match[1].length
    const rawUrl = match[2]
    const [visibleUrl, ending] = splitUrlEnding(rawUrl)
    const href = visibleUrl.toLowerCase().startsWith("www.")
      ? "https://" + visibleUrl
      : visibleUrl

    let valid = false
    try {
      const parsed = new URL(href)
      valid = (parsed.protocol === "https:" || parsed.protocol === "http:") && !!parsed.hostname
    } catch {
      // Dejar como texto cualquier URL que no sea válida.
    }

    nodes.push(highlightInText(text.slice(cursor, start), highlightQuery))

    if (valid) {
      nodes.push(
        <a
          key={start}
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow ugc"
          className="break-words font-medium text-[#a67c27] underline decoration-[#a67c27]/50 underline-offset-2 hover:decoration-[#a67c27]"
          style={{ overflowWrap: "anywhere" }}
        >
          {highlightInText(visibleUrl, highlightQuery)}
        </a>
      )
      if (ending) nodes.push(highlightInText(ending, highlightQuery))
    } else {
      nodes.push(highlightInText(rawUrl, highlightQuery))
    }

    cursor = start + rawUrl.length
  }

  nodes.push(highlightInText(text.slice(cursor), highlightQuery))
  return nodes
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
