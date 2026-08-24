"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { articlesService, Article } from "@/services/articles.service";
import { ArrowRight, Newspaper } from "lucide-react";

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function ArticulosPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setError(null);
      setLoading(true);

      try {
        const res = await articlesService.getAll();
        setArticles(Array.isArray(res?.articles) ? res.articles : []);
      } catch (err: any) {
        setError(err?.message || "No se pudieron cargar los artículos.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  return (
    <section className="min-h-screen bg-[#f4ecdf] px-4 py-16 text-[#2a2620] md:py-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-14 space-y-4 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#a67c27]/25 bg-[#a67c27]/10 px-3 py-1 text-xs font-medium tracking-[0.08em] text-[#a67c27]">
            <Newspaper className="h-3.5 w-3.5" />
            Blog curado
          </div>

          <h1 className="text-balance text-4xl font-black tracking-tight md:text-5xl">
            Artículos <span className="text-[#a67c27]">Focus</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#6b6153] md:text-lg">
            Ideas, técnicas y reflexiones sobre producción musical, mezcla y
            mastering.
          </p>
        </div>

        {error && (
          <div className="mb-10 rounded-2xl border border-red-700/25 bg-red-700/10 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[380px] animate-pulse rounded-3xl border border-[#2a2620]/10 bg-[#faf6ee]"
              />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-3xl border border-[#2a2620]/10 bg-[#faf6ee] p-14 text-center">
            <p className="text-[#6b6153]">
              Todavía no hay artículos publicados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articulos/${article.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-[#2a2620]/10 bg-[#faf6ee] transition duration-300 hover:-translate-y-1 hover:border-[#a67c27]/30 hover:bg-[#a67c27]/5"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f4ecdf]">
                  {article.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.coverImageUrl}
                      alt={article.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#6b6153]">
                      <Newspaper className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-[#6b6153]">
                    <span>{article.authorName}</span>
                    <span className="h-1 w-1 rounded-full bg-[#6b6153]" />
                    <span>{formatDate(article.createdAt)}</span>
                  </div>

                  <h2 className="line-clamp-2 text-xl font-bold leading-snug text-[#2a2620] transition group-hover:text-[#a67c27]">
                    {article.title}
                  </h2>

                  <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-[#6b6153]">
                    {article.excerpt}
                  </p>

                  <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#a67c27]">
                    Seguir leyendo
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
