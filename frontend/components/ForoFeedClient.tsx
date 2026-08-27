"use client"

import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { forumService, ForumPost } from "@/services/forum.service"
import { ForumPostCard } from "@/components/ForumPostCard"

export function ForoFeedClient({ initialPosts }: { initialPosts: ForumPost[] }) {
  const { isAuth } = useAuth()

  const [posts, setPosts] = useState<ForumPost[]>(initialPosts)
  const [loading, setLoading] = useState(false)
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

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] uppercase tracking-[0.3em] text-[#a67c27]">Comunidad</p>

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
        {loading && <p className="text-[15px] text-[#6b6153]">Cargando...</p>}

        {error && <p className="text-[15px] text-red-700">{error}</p>}

        {!loading && sortedPosts.length === 0 && (
          <p className="text-[15px] text-[#6b6153]">
            {activeQuery
              ? "No encontramos posts que coincidan con tu búsqueda."
              : "Todavía no hay posts en el foro."}
          </p>
        )}

        {!loading && sortedPosts.length > 0 && (
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {sortedPosts.map((post) => (
              <ForumPostCard key={post.id} post={post} highlightQuery={activeQuery} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
