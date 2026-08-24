"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  articlesService,
  Article,
  CreateArticleDto,
  UpdateArticleDto,
} from "@/services/articles.service";
import { useAuth } from "@/context/AuthContext";
import {
  Newspaper,
  Plus,
  RefreshCw,
  Search,
  Pencil,
  Trash2,
  ImageIcon,
  UserCircle2,
  ChevronRight,
  X,
  Upload,
  Link as LinkIcon,
  Check,
} from "lucide-react";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-300">
        {icon}
      </div>

      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black leading-none text-white">{value}</p>
    </div>
  );
}

function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export default function AdminArticlesPage() {
  const { isAdmin } = useAuth();

  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [copiedSlugId, setCopiedSlugId] = useState<string | null>(null);

  const refresh = async (silent = false) => {
    setError(null);

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await articlesService.adminList();
      setItems(Array.isArray(res?.articles) ? res.articles : []);
    } catch (err: any) {
      setError(err?.message || "No se pudieron cargar los artículos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    refresh();
  }, [isAdmin]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((a) => {
      return (
        a.title?.toLowerCase().includes(q) ||
        a.excerpt?.toLowerCase().includes(q) ||
        a.authorName?.toLowerCase().includes(q) ||
        a.slug?.toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  const stats = useMemo(() => {
    const total = items.length;
    const withCover = items.filter((a) => a.coverImageUrl).length;
    const withoutCover = total - withCover;

    return { total, withCover, withoutCover };
  }, [items]);

  const onCreate = async (dto: CreateArticleDto) => {
    await articlesService.create(dto);
    setOpenCreate(false);
    await refresh(true);
  };

  const onEdit = async (id: string, dto: UpdateArticleDto) => {
    await articlesService.update(id, dto);
    setOpenEdit(false);
    setEditing(null);
    await refresh(true);
  };

  const handleCopySlug = async (a: Article) => {
    const url = `${window.location.origin}/articulos/${a.slug}`;
    await navigator.clipboard.writeText(url);

    setCopiedSlugId(a.id);
    setTimeout(() => {
      setCopiedSlugId((current) => (current === a.id ? null : current));
    }, 1500);
  };

  const onDelete = async (id: string) => {
    const ok = confirm("¿Eliminar este artículo? Esta acción no se puede deshacer.");
    if (!ok) return;

    setDeletingId(id);
    try {
      await articlesService.remove(id);
      await refresh(true);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-80px] top-0 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute right-[-80px] top-24 h-80 w-80 rounded-full bg-yellow-300/5 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-[1500px] space-y-6 px-4 pb-8 md:px-6 xl:px-8">
        <header className="overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.12),transparent_30%),linear-gradient(135deg,#111111,#060606_55%,#000000)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-200">
                <Newspaper className="h-3.5 w-3.5" />
                Panel administrativo
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl 2xl:text-[52px]">
                Artículos <span className="text-yellow-400">Admin</span>
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/65 md:text-base">
                Creá, editá y eliminá artículos del blog curado. Administrá título,
                extracto, contenido, autor y portada desde una vista clara y moderna.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => refresh(true)}
                disabled={refreshing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white/85 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Actualizando..." : "Actualizar"}
              </button>

              <button
                onClick={() => setOpenCreate(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-400/15"
              >
                <Plus className="h-4 w-4" />
                Crear artículo
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Artículos"
            value={stats.total}
            icon={<Newspaper className="h-5 w-5" />}
          />
          <StatCard
            label="Con portada"
            value={stats.withCover}
            icon={<ImageIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Sin portada"
            value={stats.withoutCover}
            icon={<ImageIcon className="h-5 w-5" />}
          />
        </section>

        {error && (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="rounded-3xl border border-white/10 bg-black/35 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-sm md:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                placeholder="Buscar por título, extracto, autor o slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/35 focus:bg-white/[0.06]"
              />
            </div>

            <div className="text-sm text-white/45">
              Mostrando <span className="font-semibold text-white">{filteredItems.length}</span> de{" "}
              <span className="font-semibold text-white">{items.length}</span> artículos
            </div>
          </div>
        </section>

        {/* mobile / tablet */}
        <section className="space-y-4 xl:hidden">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
              Cargando artículos...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/40">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">No hay resultados</h3>
              <p className="mt-2 text-sm text-white/55">
                No encontramos artículos que coincidan con tu búsqueda.
              </p>
            </div>
          ) : (
            filteredItems.map((a) => {
              const isBusy = deletingId === a.id;

              return (
                <article
                  key={a.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
                >
                  <div className="border-b border-white/8 p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                        {a.coverImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={a.coverImageUrl}
                            alt={a.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-white/30">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-bold text-white">{a.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-white/55">{a.excerpt}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                        Autor
                      </p>
                      <p className="mt-1 text-sm text-white/85">{a.authorName}</p>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                        Fecha
                      </p>
                      <p className="mt-1 text-sm text-white/85">{formatDate(a.createdAt)}</p>
                    </div>

                    <div className="sm:col-span-2 rounded-xl border border-white/8 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                        Slug
                      </p>
                      <p className="mt-1 truncate text-sm text-white/70">{a.slug}</p>
                    </div>
                  </div>

                  <div className="border-t border-white/8 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.06]"
                        onClick={() => {
                          setEditing(a);
                          setOpenEdit(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </button>

                      <button
                        disabled={isBusy}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/15 disabled:opacity-50"
                        onClick={() => onDelete(a.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        {isBusy ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {/* desktop */}
        <section className="hidden xl:block">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/35 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-white/[0.03] text-left text-white/50">
                <tr>
                  <th className="w-[38%] px-5 py-4 font-medium">Artículo</th>
                  <th className="w-[16%] px-5 py-4 font-medium">Autor</th>
                  <th className="w-[20%] px-5 py-4 font-medium">Slug</th>
                  <th className="w-[12%] px-5 py-4 font-medium">Fecha</th>
                  <th className="w-[14%] px-5 py-4 font-medium text-right">Acción</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-white/60">
                      Cargando artículos...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-white/60">
                      No hay artículos para mostrar.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((a) => {
                    const isBusy = deletingId === a.id;

                    return (
                      <tr
                        key={a.id}
                        className="border-t border-white/6 align-top transition hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                              {a.coverImageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={a.coverImageUrl}
                                  alt={a.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-white/30">
                                  <ImageIcon className="h-4 w-4" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-white">{a.title}</p>
                              <p className="mt-1 line-clamp-2 text-xs text-white/45">
                                {a.excerpt}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-white/80">
                            <UserCircle2 className="h-4 w-4 text-white/35" />
                            {a.authorName}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => handleCopySlug(a)}
                            title="Copiar URL pública del artículo"
                          >
                            <Badge
                              className={`border transition ${
                                copiedSlugId === a.id
                                  ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-200"
                                  : "border-white/10 bg-white/5 text-white/70 hover:border-yellow-400/30 hover:bg-yellow-400/10 hover:text-yellow-200"
                              }`}
                            >
                              {copiedSlugId === a.id ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  <span className="truncate">Copiado</span>
                                </>
                              ) : (
                                <>
                                  <LinkIcon className="h-3 w-3" />
                                  <span className="truncate">{a.slug}</span>
                                </>
                              )}
                            </Badge>
                          </button>
                        </td>

                        <td className="px-5 py-4 text-white/80">{formatDate(a.createdAt)}</td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.06]"
                              onClick={() => {
                                setEditing(a);
                                setOpenEdit(true);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Editar
                            </button>

                            <button
                              disabled={isBusy}
                              className="inline-flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/15 disabled:opacity-50"
                              onClick={() => onDelete(a.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {isBusy ? "..." : "Eliminar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {openCreate && (
        <ArticleModal
          title="Crear artículo"
          submitLabel="Crear"
          onClose={() => setOpenCreate(false)}
          onSubmit={onCreate}
        />
      )}

      {openEdit && editing && (
        <ArticleModal
          title="Editar artículo"
          submitLabel="Guardar cambios"
          defaultValues={{
            title: editing.title,
            excerpt: editing.excerpt,
            content: editing.content,
            authorName: editing.authorName,
          }}
          article={editing}
          onClose={() => {
            setOpenEdit(false);
            setEditing(null);
          }}
          onSubmit={(dto) => onEdit(editing.id, dto)}
          onCoverUploaded={() => refresh(true)}
          isEdit
        />
      )}
    </div>
  );
}

/* ---------------- Modal ---------------- */

type ArticleFormValues = {
  title: string;
  excerpt: string;
  content: string;
  authorName?: string;
};

function ArticleModal({
  title,
  submitLabel,
  onClose,
  onSubmit,
  defaultValues,
  article,
  onCoverUploaded,
  isEdit = false,
}: {
  title: string;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (dto: CreateArticleDto | UpdateArticleDto) => Promise<void>;
  defaultValues?: ArticleFormValues;
  article?: Article;
  onCoverUploaded?: (article: Article) => void;
  isEdit?: boolean;
}) {
  const [titleValue, setTitleValue] = useState(defaultValues?.title ?? "");
  const [excerpt, setExcerpt] = useState(defaultValues?.excerpt ?? "");
  const [content, setContent] = useState(defaultValues?.content ?? "");
  const [authorName, setAuthorName] = useState(
    defaultValues?.authorName ?? "Entrenamiento Focus"
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [coverImageUrl, setCoverImageUrl] = useState<string | null | undefined>(
    article?.coverImageUrl
  );
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    if (!titleValue.trim() || titleValue.trim().length < 3) {
      return "El título debe tener al menos 3 caracteres.";
    }
    if (!excerpt.trim()) return "El extracto es obligatorio.";
    if (!content.trim()) return "El contenido es obligatorio.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const v = validate();
    if (v) return setError(v);

    try {
      setSaving(true);

      const dto: CreateArticleDto | UpdateArticleDto = {
        title: titleValue.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        authorName: authorName.trim() || undefined,
      };

      await onSubmit(dto);
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !article) return;

    setCoverError(null);
    setUploadingCover(true);

    try {
      const res = await articlesService.uploadCover(article.id, file);
      setCoverImageUrl(res.article.coverImageUrl);
      onCoverUploaded?.(res.article);
    } catch (err: any) {
      setCoverError(err?.message || "No se pudo subir la imagen.");
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 px-4 py-8 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-3xl">
        <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.10),transparent_30%),linear-gradient(180deg,#0F0F0F_0%,#090909_100%)] shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
          <div className="border-b border-white/8 px-5 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="max-w-xl">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-200">
                  <Newspaper className="h-3.5 w-3.5" />
                  Gestión de artículos
                </div>

                <h3 className="text-xl font-black text-white sm:text-2xl">{title}</h3>
                {isEdit && article?.slug && (
                  <p className="mt-2 text-sm text-white/60">
                    Slug:{" "}
                    <span className="text-white/80">{article.slug}</span> (no cambia
                    aunque edites el título, para no romper links compartidos)
                  </p>
                )}
              </div>

              <button
                onClick={onClose}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.07] hover:text-white"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          <div className="px-5 py-5 sm:px-6 sm:py-6">
            {error && (
              <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/85">
                      Título
                    </label>
                    <input
                      value={titleValue}
                      onChange={(e) => setTitleValue(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                      placeholder="5 hábitos para mezclar mejor"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/85">
                      Extracto
                    </label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                      placeholder="Un resumen corto que aparece en la lista de artículos..."
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/85">
                      Contenido
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={10}
                      className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                      placeholder="Contenido completo del artículo..."
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <p className="mb-4 text-sm font-semibold text-white/85">Autor</p>

                    <input
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                      placeholder="Entrenamiento Focus"
                    />
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <p className="mb-4 text-sm font-semibold text-white/85">Portada</p>

                    {isEdit && article ? (
                      <div className="space-y-3">
                        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                          {coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={coverImageUrl}
                              alt={titleValue}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-white/30">
                              <ImageIcon className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverChange}
                        />

                        <button
                          type="button"
                          disabled={uploadingCover}
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white/80 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Upload className="h-4 w-4" />
                          {uploadingCover ? "Subiendo..." : "Subir imagen"}
                        </button>

                        {coverError && (
                          <p className="text-xs text-red-300">{coverError}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-white/45">
                        Podrás subir la portada después de crear el artículo,
                        editándolo.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/8 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-white/75 transition hover:bg-white/[0.07] hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-5 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Guardando..." : submitLabel}
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
