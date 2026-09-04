"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { forumService, ForumPost } from "@/services/forum.service"
import { ForumPostCard } from "@/components/ForumPostCard"
import { ComunidadHeader } from "@/components/ComunidadHeader"

function LoginRequiredModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a2620]/50 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-[28px] border border-[#2a2620]/10 bg-[#faf6ee] p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[15px] leading-[1.6] text-[#2a2620]">
          Para crear un aporte a la comunidad de Entrenamiento Focus necesitás iniciar sesión.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/login?redirect=/foro")}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-[#a67c27] px-5 py-2.5 text-[14px] font-semibold text-[#2a2620] transition hover:scale-[1.02] hover:bg-[#c7952f]"
          >
            Iniciar sesión
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-[#a67c27]/20 px-5 py-2.5 text-[14px] font-medium text-[#6b6153] transition hover:bg-[#2a2620]/5"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export function ForoFeedClient({ initialPosts }: { initialPosts: ForumPost[] }) {
  const { isAuth } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const onlyArticles = searchParams.get("tipo") === "articulos"

  const [posts, setPosts] = useState<ForumPost[]>(initialPosts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState("")
  const [activeQuery, setActiveQuery] = useState("")

  const [showLoginModal, setShowLoginModal] = useState(false)

  const runQuery = async (q: string, onlyArt: boolean) => {
    setLoading(true)
    setError(null)

    try {
      const { posts: data } = q.trim()
        ? await forumService.search(q.trim(), { onlyWithArticle: onlyArt })
        : await forumService.getAll({ onlyWithArticle: onlyArt })
      setPosts(data)
    } catch (e: any) {
      setError(e?.message || "No se pudo cargar el foro")
    } finally {
      setLoading(false)
    }
  }

  // El primer render ya trae initialPosts calculado en el server con el
  // filtro correcto; solo hace falta refetchear cuando "tipo" cambia
  // después (link, atrás/adelante del navegador).
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    runQuery(activeQuery, onlyArticles)
  }, [onlyArticles])

  const runSearch = async (q: string) => {
    const trimmed = q.trim()
    setActiveQuery(trimmed)
    await runQuery(trimmed, onlyArticles)
  }

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  const handleNewPostClick = () => {
    if (isAuth) {
      router.push("/foro/nuevo")
    } else {
      setShowLoginModal(true)
    }
  }

  return (
    <>
      {showLoginModal && <LoginRequiredModal onClose={() => setShowLoginModal(false)} />}

      <div className="space-y-4">
        <ComunidadHeader active="foro" />

        <p className="mx-auto max-w-2xl text-center text-base leading-relaxed text-[#6b6153] md:text-lg">
          Un espacio para compartir conocimientos, descubrimientos,
          herramientas y experiencias que puedan aportar valor a toda la
          comunidad.
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center gap-2 sm:items-end">
        <button
          type="button"
          onClick={handleNewPostClick}
          className="inline-flex w-fit items-center justify-center rounded-full bg-[#a67c27] px-6 py-3 text-[15px] font-semibold text-[#2a2620] transition hover:scale-[1.02] hover:bg-[#c7952f]"
        >
          Nuevo post
        </button>

        {!isAuth && (
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
              runQuery("", onlyArticles)
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
              : onlyArticles
              ? "Todavía no hay posts que enlacen un artículo."
              : "Todavía no hay posts en el foro."}
          </p>
        )}

        {!loading && sortedPosts.length > 0 && (
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {sortedPosts.map((post) => (
              <ForumPostCard
                key={post.id}
                post={post}
                highlightQuery={activeQuery}
                onDeleted={handlePostDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
