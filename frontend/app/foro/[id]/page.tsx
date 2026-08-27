import { redirect } from "next/navigation"
import { ForumPost } from "@/services/forum.service"
import { ForoPostDetail } from "@/components/ForoPostDetail"

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

async function fetchPost(id: string): Promise<ForumPost | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/posts/${id}`, {
      cache: "no-store",
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.post ?? null
  } catch {
    return null
  }
}

export default async function ForoPostPage({ params }: { params: Promise<{ id: string }> }) {
  const forumEnabled = process.env.NEXT_PUBLIC_SHOW_FORO === "true"
  if (!forumEnabled) {
    return <ForoProximamente />
  }

  const { id } = await params
  const post = await fetchPost(id)

  if (!post) {
    return <ForoProximamente />
  }

  if (post.articleSlug) {
    redirect(`/articulos/${post.articleSlug}?from=foro&post=${post.id}`)
  }

  return <ForoPostDetail initialPost={post} />
}
