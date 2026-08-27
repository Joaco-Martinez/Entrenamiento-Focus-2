"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { articlesService, Article } from "@/services/articles.service";
import { ArticleForumThread } from "@/components/ArticleForumThread";
import { ArrowLeft, Newspaper } from "lucide-react";

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function ArticuloDetallePage() {
  const params = useParams();
  const slug = params.slug as string;

  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const fromPostId = searchParams.get("post");

  // /foro/<id> redirige de vuelta acá cuando el post tiene articleSlug, así
  // que desde el artículo nunca hay que apuntar ahí: siempre al feed, con
  // ancla al post cuando lo conocemos.
  const backHref =
    from === "foro" ? (fromPostId ? `/foro#post-${fromPostId}` : "/foro") : "/articulos";
  const backLabel = from === "foro" ? "Volver al foro" : "Volver a artículos";

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const run = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const res = await articlesService.getBySlug(slug);
        if (!res?.article) {
          setNotFound(true);
        } else {
          setArticle(res.article);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4ecdf] px-4">
        <p className="text-sm text-[#6b6153]">Cargando artículo...</p>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#f4ecdf] px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#2a2620]/10 bg-[#faf6ee] text-[#6b6153]">
          <Newspaper className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#2a2620]">
            Artículo no encontrado
          </h1>
          <p className="text-sm text-[#6b6153]">
            El artículo que buscás no existe o fue eliminado.
          </p>
        </div>

        <Link
          href="/articulos"
          className="inline-flex items-center gap-2 rounded-2xl border border-[#a67c27]/25 bg-[#a67c27]/10 px-5 py-3 text-sm font-semibold text-[#a67c27] transition hover:bg-[#a67c27]/15"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a artículos
        </Link>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#f4ecdf] px-4 py-16 text-[#2a2620] md:py-24">
      <div className="mx-auto max-w-[1180px]">
        <Link
          href={backHref}
          className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-[#6b6153] transition hover:text-[#a67c27]"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        <article className="mx-auto max-w-[800px]">
          {article.coverImageUrl && (
            <div className="relative mb-10 aspect-[16/9] w-full overflow-hidden rounded-3xl border border-[#2a2620]/10 bg-[#f4ecdf]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.coverImageUrl}
                alt={article.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="mb-8 space-y-4">
            <h1 className="text-balance text-3xl font-black leading-tight md:text-5xl">
              {article.title}
            </h1>

            <div className="flex items-center gap-2 text-sm text-[#6b6153]">
              <span className="font-semibold text-[#a67c27]">
                {article.authorName}
              </span>
              <span className="h-1 w-1 rounded-full bg-[#6b6153]" />
              <span>{formatDate(article.createdAt)}</span>
            </div>
          </div>

          <div className="space-y-6 border-t border-[#2a2620]/10 pt-8 text-[17px] leading-8 text-[#2a2620] md:text-lg md:leading-9">
            {article.content
              .split(/\n{2,}/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
          </div>
        </article>

        <ArticleForumThread slug={article.slug} />
      </div>
    </section>
  );
}
