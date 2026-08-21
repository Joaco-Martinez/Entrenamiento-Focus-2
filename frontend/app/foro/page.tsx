"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { forumService, ForumPost } from "@/services/forum.service"

function authorName(author: ForumPost["author"]) {
  const name = [author?.firstName, author?.lastName].filter(Boolean).join(" ")
  return name || "Usuario"
}

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
      <mark className="rounded bg-[#c8a84b]/25 px-0.5 text-[#f0ede6]">
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
    <main className="mt-16 flex min-h-screen items-center justify-center bg-[#111110] px-6 text-[#f0ede6]">
      <div className="text-center">
        <h1 className="text-[32px] font-light tracking-[-0.03em] text-[#f0ede6] sm:text-[40px]">
          Foro <span className="text-[#c8a84b]">próximamente</span>
        </h1>

        <p className="mt-4 text-[15px] text-[#f0ede6]/60">
          Estamos terminando de preparar esta sección. Volvé pronto.
        </p>
      </div>
    </main>
  )
}

export default function ForoPage() {
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
    loadAll()
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

  if (!loading && error) {
    return <ForoProximamente />
  }

  return (
    <main className="mt-16 min-h-screen bg-[#111110] text-[#f0ede6]">
      <section className="border-t border-[#c8a84b]/10 px-5 py-12 md:px-12 md:py-16">
        <div className="mx-auto max-w-[1180px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[13px] uppercase tracking-[0.3em] text-[#c8a84b]">
                Comunidad
              </p>

              <h1 className="mt-3 text-[34px] font-light leading-[1.05] tracking-[-0.03em] text-[#f0ede6] sm:text-[48px]">
                Foro
              </h1>
            </div>

            {isAuth ? (
              <Link
                href="/foro/nuevo"
                className="inline-flex w-fit items-center justify-center rounded-full bg-[#c8a84b] px-6 py-3 text-[15px] font-semibold text-[#111110] transition hover:scale-[1.02] hover:bg-[#d8b85b]"
              >
                Nuevo post
              </Link>
            ) : (
              <p className="text-[14px] text-[#f0ede6]/60">
                <Link href="/login" className="text-[#c8a84b] hover:underline">
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
              className="w-full rounded-full border border-[#c8a84b]/20 bg-[#181816] px-6 py-3 text-[15px] text-[#f0ede6] placeholder:text-[#f0ede6]/40 outline-none transition focus:border-[#c8a84b]/60"
            />

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-[#c8a84b]/30 px-6 py-3 text-[15px] font-medium text-[#f0ede6] transition hover:bg-[#c8a84b] hover:text-[#111110]"
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
                className="inline-flex items-center justify-center rounded-full px-4 py-3 text-[14px] text-[#f0ede6]/60 transition hover:text-[#f0ede6]"
              >
                Limpiar
              </button>
            )}
          </form>

          {activeQuery && (
            <p className="mt-4 text-[14px] text-[#f0ede6]/50">
              Resultados para <span className="text-[#c8a84b]">&ldquo;{activeQuery}&rdquo;</span>
            </p>
          )}

          <div className="mt-10">
            {loading && (
              <p className="text-[15px] text-[#f0ede6]/60">Cargando...</p>
            )}

            {!loading && sortedPosts.length === 0 && (
              <p className="text-[15px] text-[#f0ede6]/60">
                {activeQuery
                  ? "No encontramos posts que coincidan con tu búsqueda."
                  : "Todavía no hay posts en el foro."}
              </p>
            )}

            {!loading && sortedPosts.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2">
                {sortedPosts.map((post) => {
                  const matchedComment = findMatchedComment(post, activeQuery)

                  return (
                    <Link
                      key={post.id}
                      href={`/foro/${post.id}`}
                      className="group rounded-[28px] border border-[#c8a84b]/10 bg-[#181816] p-6 transition-all duration-300 hover:border-[#c8a84b]/40 hover:bg-[#c8a84b]/[0.05]"
                    >
                      <h2 className="text-[20px] font-medium leading-tight text-[#f0ede6] transition-colors group-hover:text-[#c8a84b]">
                        {highlight(post.title, activeQuery)}
                      </h2>

                      <p className="mt-2 text-[13px] text-[#f0ede6]/50">
                        {authorName(post.author)} · {formatDate(post.createdAt)}
                      </p>

                      <p className="mt-4 line-clamp-2 text-[14px] leading-[1.6] text-[#f0ede6]/70">
                        {highlight(post.content, activeQuery)}
                      </p>

                      {matchedComment && (
                        <div className="mt-4 rounded-2xl border border-[#c8a84b]/15 bg-[#111110] p-4">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-[#c8a84b]">
                            Coincidencia en un comentario de{" "}
                            {authorName(matchedComment.author)}
                          </p>

                          <p className="mt-2 line-clamp-2 text-[13px] leading-[1.6] text-[#f0ede6]/75">
                            {highlight(matchedComment.content, activeQuery)}
                          </p>
                        </div>
                      )}

                      {post.tags?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-[#c8a84b]/30 px-3 py-1 text-[11px] font-medium text-[#c8a84b]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="mt-4 text-[13px] text-[#f0ede6]/50">
                        {post._count?.comments ?? post.comments?.length ?? 0} comentarios
                      </p>
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
