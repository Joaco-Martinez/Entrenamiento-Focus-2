import { ForumPost } from "@/services/forum.service"
import { ForoFeedClient } from "@/components/ForoFeedClient"

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

async function fetchInitialPosts(onlyWithArticle: boolean): Promise<ForumPost[]> {
  try {
    const qs = onlyWithArticle ? "?articulos=true" : ""
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/posts${qs}`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.posts ?? []
  } catch {
    return []
  }
}

export default async function ForoPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>
}) {
  const forumEnabled = process.env.NEXT_PUBLIC_SHOW_FORO === "true"

  if (!forumEnabled) {
    return <ForoProximamente />
  }

  const { tipo } = await searchParams
  const onlyArticles = tipo === "articulos"
  const initialPosts = await fetchInitialPosts(onlyArticles)

  return (
    <main className="mt-16 min-h-screen bg-[#f4ecdf] text-[#2a2620]">
      <section className="border-t border-[#2a2620]/10 px-5 py-12 md:px-12 md:py-16">
        <div className="mx-auto max-w-[1180px]">
          <ForoFeedClient initialPosts={initialPosts} />
        </div>
      </section>
    </main>
  )
}
