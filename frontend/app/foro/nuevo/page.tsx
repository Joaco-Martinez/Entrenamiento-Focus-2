"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { forumService } from "@/services/forum.service"

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

export default function NuevoPostPage() {
  const forumEnabled = process.env.NEXT_PUBLIC_SHOW_FORO === "true"

  const router = useRouter()
  const { isAuth, loading: authLoading } = useAuth()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (forumEnabled && !authLoading && !isAuth) {
      router.push("/login?redirect=/foro/nuevo")
    }
  }, [authLoading, isAuth, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      const { post } = await forumService.create({
        title: title.trim(),
        content: content.trim(),
        tags: tagsArray,
      })

      router.push(`/foro/${post.id}`)
    } catch (e: any) {
      setError(e?.message || "No se pudo publicar el post")
    } finally {
      setSubmitting(false)
    }
  }

  if (!forumEnabled) {
    return <ForoProximamente />
  }

  if (authLoading || !isAuth) {
    return (
      <main className="mt-16 flex min-h-screen items-center justify-center bg-[#f4ecdf] text-[#2a2620]">
        <p className="text-[15px] text-[#6b6153]">Cargando...</p>
      </main>
    )
  }

  return (
    <main className="mt-16 min-h-screen bg-[#f4ecdf] text-[#2a2620]">
      <section className="border-t border-[#2a2620]/10 px-5 py-12 md:px-12 md:py-16">
        <div className="mx-auto max-w-[720px]">
          <Link href="/foro" className="text-[13px] text-[#a67c27] hover:underline">
            ← Volver al foro
          </Link>

          <p className="mt-6 text-[13px] uppercase tracking-[0.3em] text-[#a67c27]">
            Nuevo post
          </p>

          <h1 className="mt-3 text-[32px] font-light leading-[1.05] tracking-[-0.03em] text-[#2a2620] sm:text-[40px]">
            Compartí algo con la comunidad
          </h1>

          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-6 rounded-[28px] border border-[#2a2620]/10 bg-[#faf6ee] p-6 sm:p-8"
          >
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#6b6153]">
                Título
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: ¿Qué plugin de EQ usan para voces?"
                className="w-full rounded-2xl border border-[#a67c27]/20 bg-[#f4ecdf] px-5 py-3.5 text-[15px] text-[#2a2620] placeholder:text-[#6b6153] outline-none transition focus:border-[#a67c27]/60"
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#6b6153]">
                Contenido
              </label>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Contá tu duda, idea o experiencia..."
                rows={8}
                className="w-full rounded-2xl border border-[#a67c27]/20 bg-[#f4ecdf] px-5 py-3.5 text-[15px] text-[#2a2620] placeholder:text-[#6b6153] outline-none transition focus:border-[#a67c27]/60"
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#6b6153]">
                Tags (separados por coma)
              </label>

              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Ej: mezcla, plugins, voces"
                className="w-full rounded-2xl border border-[#a67c27]/20 bg-[#f4ecdf] px-5 py-3.5 text-[15px] text-[#2a2620] placeholder:text-[#6b6153] outline-none transition focus:border-[#a67c27]/60"
              />
            </div>

            {error && <p className="text-[13px] text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="inline-flex items-center justify-center rounded-full bg-[#a67c27] px-8 py-3.5 text-[16px] font-semibold text-[#2a2620] transition hover:scale-[1.02] hover:bg-[#c7952f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Publicando..." : "Publicar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
