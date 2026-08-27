"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { forumService, ForumPost } from "@/services/forum.service"
import { PostBody, extractArticleSlugs, displayAuthorName } from "@/components/PostBody"

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function highlight(text: string, query: string) {
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

function findMatchedComment(post: ForumPost, query: string) {
  if (!query.trim() || !post.comments?.length) return null

  const q = query.toLowerCase()
  const titleOrContentMatch =
    post.title.toLowerCase().includes(q) || post.content.toLowerCase().includes(q)

  if (titleOrContentMatch) return null

  return post.comments.find((c) => c.content.toLowerCase().includes(q)) ?? null
}

function ForoProximamente() {
  return (
    <main className="mt-16 flex min-h-screen items-center justify-center bg-[#f4ecdf] px-6 text-[#2a2620]">
      <div className="text-center">
        <h1 className="text-[32px] font-light tracking-[-0.03em] text-[#2a2620] sm:text-[40px]">
          Foro <span className="text-[#a67c27]">próximamente</span>
        </h1>

        <p className="mt-4 text-[15px] text-[#6b6153]">
          Estamos terminando de preparar esta sección. Volvé pronto.
        </p>
      </div>
    </main>
  )
}

export default function ForoPage() {
  const forumEnabled = process.env.NEXT_PUBLIC_SHOW_FORO === "true"

  const { isAuth } = useAuth()

  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState("")
  const [activeQuery, setActiveQuery] = useState("")

  const loadAll = async () => {
    setLoading(true)
    setError(null)

    try {
      const { posts: data } = await forumService.getAll()
      setPosts(data)
    } catch (e: any) {
      setError(e?.message || "No se pudo cargar el foro")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (forumEnabled) {
      loadAll()
    }
  }, [])

  const runSearch = async (q: string) => {
    const trimmed = q.trim()
    setActiveQuery(trimmed)

    if (!trimmed) {
      loadAll()
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { posts: data } = await forumService.search(trimmed)
      setPosts(data)
    } catch (e: any) {
      setError(e?.message || "No se pudo realizar la búsqueda")
    } finally {
      setLoading(false)
    }
  }

  const sortedPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [posts]
  )

  if (!forumEnabled || (!loading && error)) {
    return <ForoProximamente />
  }

  return (
    <main className="mt-16 min-h-screen bg-[#f4ecdf] text-[#2a2620]">
      <section className="border-t border-[#2a2620]/10 px-5 py-12 md:px-12 md:py-16">
        <div className="mx-auto max-w-[1180px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[13px] uppercase tracking-[0.3em] text-[#a67c27]">
                Comunidad
              </p>

              <h1 className="mt-3 text-[34px] font-light leading-[1.05] tracking-[-0.03em] text-[#2a2620] sm:text-[48px]">
                Foro
              </h1>
            </div>

            {isAuth ? (
              <Link
                href="/foro/nuevo"
                className="inline-flex w-fit items-center justify-center rounded-full bg-[#a67c27] px-6 py-3 text-[15px] font-semibold text-[#2a2620] transition hover:scale-[1.02] hover:bg-[#c7952f]"
              >
                Nuevo post
              </Link>
            ) : (
              <p className="text-[14px] text-[#6b6153]">
                <Link href="/login" className="text-[#a67c27] hover:underline">
                  Iniciá sesión
                </Link>{" "}
                para participar del foro.
              </p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              runSearch(query)
            }}
            className="mt-10 flex flex-col gap-3 sm:flex-row"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por palabra clave, ej: plugins gratis"
              className="w-full rounded-full border border-[#a67c27]/20 bg-[#faf6ee] px-6 py-3 text-[15px] text-[#2a2620] placeholder:text-[#6b6153] outline-none transition focus:border-[#a67c27]/60"
            />

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-[#a67c27]/30 px-6 py-3 text-[15px] font-medium text-[#2a2620] transition hover:bg-[#a67c27] hover:text-[#2a2620]"
            >
              Buscar
            </button>

            {activeQuery && (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setActiveQuery("")
                  loadAll()
                }}
                className="inline-flex items-center justify-center rounded-full px-4 py-3 text-[14px] text-[#6b6153] transition hover:text-[#2a2620]"
              >
                Limpiar
              </button>
            )}
          </form>

          {activeQuery && (
            <p className="mt-4 text-[14px] text-[#6b6153]">
              Resultados para <span className="text-[#a67c27]">&ldquo;{activeQuery}&rdquo;</span>
            </p>
          )}

          <div className="mt-10">
            {loading && (
              <p className="text-[15px] text-[#6b6153]">Cargando...</p>
            )}

            {!loading && sortedPosts.length === 0 && (
              <p className="text-[15px] text-[#6b6153]">
                {activeQuery
                  ? "No encontramos posts que coincidan con tu búsqueda."
                  : "Todavía no hay posts en el foro."}
              </p>
            )}

            {!loading && sortedPosts.length > 0 && (
              <div className="mx-auto flex max-w-3xl flex-col gap-5">
                {sortedPosts.map((post) => {
                  const matchedComment = findMatchedComment(post, activeQuery)
                  const hasArticleLink = extractArticleSlugs(post.content).length > 0

                  const header = (
                    <>
                      <h2 className="text-[20px] font-medium leading-tight text-[#2a2620] transition-colors group-hover:text-[#a67c27]">
                        {highlight(post.title, activeQuery)}
                      </h2>

                      <p className="mt-2 text-[13px] text-[#6b6153]">
                        <span className={post.author?.role === "ADMIN" ? "text-[#a67c27]" : undefined}>
                          {displayAuthorName(post.author, { isArticlePost: hasArticleLink })}
                        </span>{" "}
                        · {formatDate(post.createdAt)}
                      </p>
                    </>
                  )

                  const footer = (
                    <>
                      {matchedComment && (
                        <div className="mt-4 rounded-2xl border border-[#2a2620]/10 bg-[#f4ecdf] p-4">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-[#a67c27]">
                            Coincidencia en un comentario de{" "}
                            {displayAuthorName(matchedComment.author)}
                          </p>

                          <p className="mt-2 line-clamp-2 text-[13px] leading-[1.6] text-[#6b6153]">
                            {highlight(matchedComment.content, activeQuery)}
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

                      <p className="mt-4 text-[13px] text-[#6b6153]">
                        {post._count?.comments ?? post.comments?.length ?? 0} comentarios
                      </p>
                    </>
                  )

                  const cardBody = (
                    <PostBody
                      text={post.content}
                      textClassName="mt-4 line-clamp-2 text-[14px] leading-[1.6] text-[#6b6153]"
                      highlightQuery={activeQuery}
                    />
                  )

                  if (hasArticleLink) {
                    return (
                      <div
                        key={post.id}
                        className="group rounded-[28px] border border-[#2a2620]/10 bg-[#faf6ee] p-6 transition-all duration-300 hover:border-[#a67c27]/40 hover:bg-[#a67c27]/[0.05]"
                      >
                        <Link href={`/foro/${post.id}`} className="block">
                          {header}
                        </Link>

                        {cardBody}

                        <Link href={`/foro/${post.id}`} className="block">
                          {footer}
                        </Link>
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={post.id}
                      href={`/foro/${post.id}`}
                      className="group rounded-[28px] border border-[#2a2620]/10 bg-[#faf6ee] p-6 transition-all duration-300 hover:border-[#a67c27]/40 hover:bg-[#a67c27]/[0.05]"
                    >
                      {header}
                      {cardBody}
                      {footer}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
