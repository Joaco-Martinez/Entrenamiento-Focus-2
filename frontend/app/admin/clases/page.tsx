"use client";

import { useEffect, useMemo, useState } from "react";
import {
  classesService,
  VideoClass,
  CreateClassDto,
  UpdateClassDto,
} from "@/services/classes.service";
import ClaseVideoUploader from "@/components/admin/ClaseVideoUploader";
import {
  Clapperboard,
  Plus,
  RefreshCw,
  Search,
  Pencil,
  Trash2,
  DollarSign,
  Image as ImageIcon,
  ChevronRight,
  X,
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";

function formatUsd(value?: number | null) {
  if (!value) return null;
  return `US$${value.toLocaleString("en-US")}`;
}

function formatArs(value?: number | null) {
  if (!value) return null;
  return `$${value.toLocaleString("es-AR")}`;
}

function formatDuration(seconds?: number | null) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
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

export default function AdminClasesPage() {
  const [items, setItems] = useState<VideoClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = async (silent = false) => {
    setError(null);
    silent ? setRefreshing(true) : setLoading(true);

    try {
      const res = await classesService.adminList();
      setItems(Array.isArray(res?.classes) ? res.classes : []);
    } catch (err: any) {
      setError(err?.message || "No se pudieron cargar las clases.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => c.title.toLowerCase().includes(q));
  }, [items, search]);

  const editingItem = items.find((c) => c.id === editingId) || null;

  const onCreate = async (dto: CreateClassDto) => {
    await classesService.create(dto);
    await refresh(true);
  };

  const onTogglePublish = async (item: VideoClass) => {
    const nextStatus = item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await classesService.update(item.id, { status: nextStatus });
    await refresh(true);
  };

  const onDelete = async (id: string) => {
    const ok = confirm(
      "¿Eliminar esta clase? Se borra también el video de Bunny y la portada de Cloudinary. No se puede deshacer."
    );
    if (!ok) return;

    setDeletingId(id);
    try {
      await classesService.remove(id);
      await refresh(true);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="relative">
      <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 pb-8 md:px-6 xl:px-8">
        <header className="overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.12),transparent_30%),linear-gradient(135deg,#111111,#060606_55%,#000000)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-200">
                <Clapperboard className="h-3.5 w-3.5" />
                Catálogo de clases
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Clases <span className="text-yellow-400">de video</span>
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/65 md:text-base">
                Cargá clases independientes, subí el video directo a Bunny Stream
                y publicalas cuando estén listas.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => refresh(true)}
                disabled={refreshing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white/85 transition hover:bg-white/[0.07] disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Actualizando..." : "Actualizar"}
              </button>

              <button
                onClick={() => setOpenCreate(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-400/15"
              >
                <Plus className="h-4 w-4" />
                Nueva clase
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="rounded-3xl border border-white/10 bg-black/35 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-sm md:p-5">
          <div className="relative w-full xl:max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/35 focus:bg-white/[0.06]"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[280px] animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]"
              />
            ))
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/55">
              Todavía no hay clases cargadas.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isBusy = deletingId === item.id;

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
                >
                  <div className="relative aspect-video w-full overflow-hidden border-b border-white/8 bg-black/40">
                    {item.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.coverImageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/25">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}

                    <div className="absolute right-3 top-3">
                      {item.status === "PUBLISHED" ? (
                        <Badge className="border border-emerald-400/25 bg-emerald-500/80 text-white backdrop-blur-sm">
                          Publicada
                        </Badge>
                      ) : (
                        <Badge className="border border-white/10 bg-black/60 text-white/80 backdrop-blur-sm">
                          Borrador
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <h3 className="truncate text-base font-bold text-white">{item.title}</h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/55">
                      <span className="inline-flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        {[formatUsd(item.usdPrice), formatArs(item.arPrice)]
                          .filter(Boolean)
                          .join(" · ") || "Sin precio"}
                      </span>
                      <span>{formatDuration(item.durationSeconds)}</span>
                      <span className={item.bunnyVideoId ? "text-emerald-300" : "text-white/35"}>
                        {item.bunnyVideoId ? "Video cargado" : "Sin video"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                      <button
                        onClick={() => setEditingId(item.id)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs font-semibold text-white/80 transition hover:bg-white/[0.06]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </button>

                      <button
                        onClick={() => onTogglePublish(item)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs font-semibold text-white/80 transition hover:bg-white/[0.06]"
                      >
                        {item.status === "PUBLISHED" ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            Despublicar
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5" />
                            Publicar
                          </>
                        )}
                      </button>

                      <button
                        disabled={isBusy}
                        onClick={() => onDelete(item.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/15 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {isBusy ? "..." : ""}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>

      {openCreate && (
        <ClaseModal
          title="Nueva clase"
          submitLabel="Crear"
          onClose={() => setOpenCreate(false)}
          onSubmit={onCreate}
        />
      )}

      {editingItem && (
        <ClaseModal
          title="Editar clase"
          submitLabel="Guardar cambios"
          isEdit
          claseItem={editingItem}
          onClose={() => setEditingId(null)}
          onSubmit={async (dto) => {
            await classesService.update(editingItem.id, dto as UpdateClassDto);
            await refresh(true);
          }}
          onCoverUploaded={() => refresh(true)}
          onVideoUploaded={() => refresh(true)}
        />
      )}
    </div>
  );
}

function ClaseModal({
  title,
  submitLabel,
  onClose,
  onSubmit,
  isEdit = false,
  claseItem,
  onCoverUploaded,
  onVideoUploaded,
}: {
  title: string;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (dto: CreateClassDto | UpdateClassDto) => Promise<void>;
  isEdit?: boolean;
  claseItem?: VideoClass;
  onCoverUploaded?: () => void;
  onVideoUploaded?: () => void;
}) {
  const [titleValue, setTitleValue] = useState(claseItem?.title ?? "");
  const [description, setDescription] = useState(claseItem?.description ?? "");
  const [usdPrice, setUsdPrice] = useState<number | "">(claseItem?.usdPrice || "");
  const [arPrice, setArPrice] = useState<number | "">(claseItem?.arPrice || "");

  const [coverImageUrl, setCoverImageUrl] = useState<string | null | undefined>(
    claseItem?.coverImageUrl
  );
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!titleValue.trim() || titleValue.trim().length < 2) {
      return "El título debe tener al menos 2 caracteres.";
    }
    if (usdPrice !== "" && (!Number.isFinite(Number(usdPrice)) || Number(usdPrice) < 0)) {
      return "El precio USD debe ser 0 o mayor.";
    }
    if (arPrice !== "" && (!Number.isFinite(Number(arPrice)) || Number(arPrice) < 0)) {
      return "El precio ARS debe ser 0 o mayor.";
    }
    if ((usdPrice === "" || Number(usdPrice) <= 0) && (arPrice === "" || Number(arPrice) <= 0)) {
      return "Cargá al menos un precio (USD o ARS) para que se pueda comprar.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const v = validate();
    if (v) return setError(v);

    try {
      setSaving(true);

      const dto: CreateClassDto = {
        title: titleValue.trim(),
        description: description.trim() || undefined,
        usdPrice: usdPrice === "" ? 0 : Number(usdPrice),
        arPrice: arPrice === "" ? 0 : Number(arPrice),
      };

      await onSubmit(dto);
      onClose();
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar.");
      setSaving(false);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !claseItem) return;

    setCoverError(null);
    setUploadingCover(true);

    try {
      const res = await classesService.uploadCover(claseItem.id, file);
      setCoverImageUrl(res.class.coverImageUrl);
      onCoverUploaded?.();
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
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-200">
                  <Clapperboard className="h-3.5 w-3.5" />
                  Gestión de clases
                </div>
                <h3 className="text-xl font-black text-white sm:text-2xl">{title}</h3>
                {isEdit && claseItem && (
                  <p className="mt-2 text-sm text-white/60">
                    Slug: <span className="text-white/80">{claseItem.slug}</span>
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
                      placeholder="Mezcla de bajo avanzada"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/85">
                      Descripción
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                      placeholder="De qué trata la clase, qué se aprende..."
                    />
                  </div>

                  {isEdit && claseItem ? (
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                      <p className="mb-3 text-sm font-semibold text-white/85">Video (Bunny)</p>
                      <ClaseVideoUploader
                        claseId={claseItem.id}
                        hasExistingVideo={Boolean(claseItem.bunnyVideoId)}
                        onUploaded={onVideoUploaded}
                      />
                    </div>
                  ) : (
                    <div className="rounded-[24px] border border-yellow-400/15 bg-yellow-400/5 p-4 text-sm text-white/65">
                      Vas a poder subir el video y la portada después de crear la
                      clase, editándola.
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <p className="mb-4 text-sm font-semibold text-white/85">Precio</p>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm text-white/70">
                          Precio USD (PayPal)
                        </label>
                        <input
                          value={usdPrice}
                          onChange={(e) =>
                            setUsdPrice(e.target.value === "" ? "" : Number(e.target.value))
                          }
                          type="number"
                          step="1"
                          min={0}
                          placeholder="10"
                          className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-white/70">
                          Precio ARS (Mercado Pago)
                        </label>
                        <input
                          value={arPrice}
                          onChange={(e) =>
                            setArPrice(e.target.value === "" ? "" : Number(e.target.value))
                          }
                          type="number"
                          step="1"
                          min={0}
                          placeholder="10000"
                          className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                        />
                        <p className="mt-2 text-xs text-white/45">
                          Si lo dejás vacío, la clase no se puede comprar por
                          Mercado Pago (solo por PayPal).
                        </p>
                      </div>

                      {isEdit && (
                        <div>
                          <label className="mb-2 block text-sm text-white/70">Duración</label>
                          <div className="flex h-12 w-full items-center rounded-2xl border border-white/10 bg-black/20 px-4 text-white/60">
                            {claseItem?.durationSeconds
                              ? formatDuration(claseItem.durationSeconds)
                              : "Se completa sola cuando Bunny termina de procesar el video."}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <p className="mb-4 text-sm font-semibold text-white/85">Portada</p>

                    {isEdit && claseItem ? (
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

                        <label className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white/80 transition hover:bg-white/[0.07]">
                          <Upload className="h-4 w-4" />
                          {uploadingCover ? "Subiendo..." : "Subir imagen"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingCover}
                            onChange={handleCoverChange}
                          />
                        </label>

                        {coverError && <p className="text-xs text-red-300">{coverError}</p>}
                      </div>
                    ) : (
                      <p className="text-xs text-white/45">
                        Podrás subir la portada después de crear la clase.
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
                  Cerrar
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
