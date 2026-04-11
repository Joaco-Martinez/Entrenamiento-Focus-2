"use client";

import { useEffect, useMemo, useState } from "react";
import {
  productsService,
  Product,
  CreateProductDto,
  UpdateProductDto,
  ResourceType,
} from "@/services/products.service";
import { useAuth } from "@/context/AuthContext";
import {
  BadgeCheck,
  Layers3,
  Plus,
  RefreshCw,
  Search,
  Pencil,
  Trash2,
  Link as LinkIcon,
  FileText,
  DollarSign,
  Crown,
  CreditCard,
  Package2,
  ChevronRight,
  X,
} from "lucide-react";

function formatUsd(value?: number | null) {
  if (value == null) return "—";
  return `US$${Number(value).toFixed(2)}`;
}

function formatArs(value?: number | null) {
  if (value == null) return "—";
  return `$${Number(value).toLocaleString("es-AR")}`;
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

export default function AdminProductsPage() {
  const { isAdmin } = useAuth();

  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const refresh = async (silent = false) => {
    setError(null);

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await productsService.adminList();
      setItems(Array.isArray(res?.products) ? res.products : []);
    } catch (err: any) {
      setError(err?.message || "No se pudieron cargar los productos.");
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

    return items.filter((p) => {
      return (
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.resourceType?.toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  const stats = useMemo(() => {
    const total = items.length;
    const subscriptions = items.filter((p) => p.isSubscription).length;
    const premium = items.filter((p) => p.requiresPremium).length;
    const links = items.filter((p) => p.resourceType === "LINK").length;

    return { total, subscriptions, premium, links };
  }, [items]);

  const onCreate = async (dto: CreateProductDto) => {
    await productsService.create(dto);
    setOpenCreate(false);
    await refresh(true);
  };

  const onEdit = async (id: string, dto: UpdateProductDto) => {
    await productsService.update(id, dto);
    setOpenEdit(false);
    setEditing(null);
    await refresh(true);
  };

  const onDelete = async (id: string) => {
    const ok = confirm("¿Eliminar este producto? Esta acción no se puede deshacer.");
    if (!ok) return;

    setDeletingId(id);
    try {
      await productsService.remove(id);
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
                <Layers3 className="h-3.5 w-3.5" />
                Panel administrativo
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl 2xl:text-[52px]">
                Productos <span className="text-yellow-400">Admin</span>
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/65 md:text-base">
                Creá, editá y eliminá productos, cursos o planes. Administrá
                precios, acceso premium, tipo de recurso y portada desde una vista
                mucho más clara y moderna.
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
                Crear producto
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <StatCard
            label="Productos"
            value={stats.total}
            icon={<Package2 className="h-5 w-5" />}
          />
          <StatCard
            label="Suscripciones"
            value={stats.subscriptions}
            icon={<CreditCard className="h-5 w-5" />}
          />
          <StatCard
            label="Premium"
            value={stats.premium}
            icon={<Crown className="h-5 w-5" />}
          />
          <StatCard
            label="Tipo LINK"
            value={stats.links}
            icon={<LinkIcon className="h-5 w-5" />}
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
                placeholder="Buscar por nombre, descripción o tipo de recurso..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/35 focus:bg-white/[0.06]"
              />
            </div>

            <div className="text-sm text-white/45">
              Mostrando <span className="font-semibold text-white">{filteredItems.length}</span> de{" "}
              <span className="font-semibold text-white">{items.length}</span> productos
            </div>
          </div>
        </section>

        {/* mobile / tablet */}
        <section className="space-y-4 xl:hidden">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
              Cargando productos...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/40">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">No hay resultados</h3>
              <p className="mt-2 text-sm text-white/55">
                No encontramos productos que coincidan con tu búsqueda.
              </p>
            </div>
          ) : (
            filteredItems.map((p) => {
              const isBusy = deletingId === p.id;

              return (
                <article
                  key={p.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
                >
                  <div className="border-b border-white/8 p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                        {p.coverImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.coverImageUrl}
                            alt={p.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-white/30">
                            <FileText className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-bold text-white">{p.title}</h3>
                        {p.description ? (
                          <p className="mt-1 line-clamp-2 text-sm text-white/55">
                            {p.description}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-white/35">Sin descripción</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                        Precio USD
                      </p>
                      <p className="mt-1 text-sm text-white/85">{formatUsd(p.usdPrice)}</p>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                        Precio ARS
                      </p>
                      <p className="mt-1 text-sm text-white/85">{formatArs(p.arPrice)}</p>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                        Suscripción
                      </p>
                      <div className="mt-2">
                        {p.isSubscription ? (
                          <Badge className="border border-yellow-400/25 bg-yellow-400/10 text-yellow-200">
                            Sí
                          </Badge>
                        ) : (
                          <Badge className="border border-white/10 bg-white/5 text-white/60">
                            No
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                        Premium
                      </p>
                      <div className="mt-2">
                        {p.requiresPremium ? (
                          <Badge className="border border-emerald-400/25 bg-emerald-400/10 text-emerald-200">
                            Requiere
                          </Badge>
                        ) : (
                          <Badge className="border border-white/10 bg-white/5 text-white/60">
                            Libre
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2 rounded-xl border border-white/8 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                        Tipo de recurso
                      </p>
                      <div className="mt-2">
                        <Badge className="border border-white/10 bg-white/5 text-white/80">
                          {p.resourceType}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/8 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.06]"
                        onClick={() => {
                          setEditing(p);
                          setOpenEdit(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </button>

                      <button
                        disabled={isBusy}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/15 disabled:opacity-50"
                        onClick={() => onDelete(p.id)}
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
                  <th className="w-[32%] px-5 py-4 font-medium">Producto</th>
                  <th className="w-[12%] px-5 py-4 font-medium">USD</th>
                  <th className="w-[12%] px-5 py-4 font-medium">ARS</th>
                  <th className="w-[12%] px-5 py-4 font-medium">Suscripción</th>
                  <th className="w-[12%] px-5 py-4 font-medium">Premium</th>
                  <th className="w-[10%] px-5 py-4 font-medium">Tipo</th>
                  <th className="w-[10%] px-5 py-4 font-medium text-right">Acción</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-white/60">
                      Cargando productos...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-white/60">
                      No hay productos para mostrar.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((p) => {
                    const isBusy = deletingId === p.id;

                    return (
                      <tr
                        key={p.id}
                        className="border-t border-white/6 align-top transition hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                              {p.coverImageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={p.coverImageUrl}
                                  alt={p.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-white/30">
                                  <FileText className="h-4 w-4" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-white">{p.title}</p>
                              {p.description ? (
                                <p className="mt-1 line-clamp-2 text-xs text-white/45">
                                  {p.description}
                                </p>
                              ) : (
                                <p className="mt-1 text-xs text-white/30">Sin descripción</p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-white/80">{formatUsd(p.usdPrice)}</td>

                        <td className="px-5 py-4 text-white/80">{formatArs(p.arPrice)}</td>

                        <td className="px-5 py-4">
                          {p.isSubscription ? (
                            <Badge className="border border-yellow-400/25 bg-yellow-400/10 text-yellow-200">
                              Sí
                            </Badge>
                          ) : (
                            <Badge className="border border-white/10 bg-white/5 text-white/60">
                              No
                            </Badge>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {p.requiresPremium ? (
                            <Badge className="border border-emerald-400/25 bg-emerald-400/10 text-emerald-200">
                              <BadgeCheck className="h-3.5 w-3.5" />
                              Requiere
                            </Badge>
                          ) : (
                            <Badge className="border border-white/10 bg-white/5 text-white/60">
                              Libre
                            </Badge>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <Badge className="border border-white/10 bg-white/5 text-white/75">
                            {p.resourceType}
                          </Badge>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.06]"
                              onClick={() => {
                                setEditing(p);
                                setOpenEdit(true);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Editar
                            </button>

                            <button
                              disabled={isBusy}
                              className="inline-flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/15 disabled:opacity-50"
                              onClick={() => onDelete(p.id)}
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
        <ProductModal<CreateProductDto>
          title="Crear producto"
          submitLabel="Crear"
          onClose={() => setOpenCreate(false)}
          onSubmit={onCreate}
        />
      )}

      {openEdit && editing && (
        <ProductModal<UpdateProductDto>
          title="Editar producto"
          submitLabel="Guardar cambios"
          defaultValues={{
            title: editing.title,
            description: editing.description || "",
            usdPrice: Number(editing.usdPrice ?? 0),
            arPrice: editing.arPrice != null ? Number(editing.arPrice) : undefined,
            isSubscription: editing.isSubscription,
            requiresPremium: editing.requiresPremium,
            coverImageUrl: editing.coverImageUrl ?? "",
            resourceType: editing.resourceType,
            resourceUrl: "",
          }}
          onClose={() => {
            setOpenEdit(false);
            setEditing(null);
          }}
          onSubmit={(dto) => onEdit(editing.id, dto)}
          isEdit
        />
      )}
    </div>
  );
}

/* ---------------- Modal ---------------- */

type ProductFormValues = {
  title: string;
  description?: string;
  usdPrice: number;
  arPrice?: number;
  isSubscription?: boolean;
  requiresPremium?: boolean;
  coverImageUrl?: string;
  resourceType?: ResourceType;
  resourceUrl?: string;
};

function ProductModal<TDto extends CreateProductDto | UpdateProductDto>({
  title,
  submitLabel,
  onClose,
  onSubmit,
  defaultValues,
  isEdit = false,
}: {
  title: string;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (dto: TDto) => Promise<void>;
  defaultValues?: ProductFormValues;
  isEdit?: boolean;
}) {
  const [titleValue, setTitleValue] = useState(defaultValues?.title ?? "");
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [usdPrice, setUsdPrice] = useState<number>(defaultValues?.usdPrice ?? 0);
  const [arPrice, setArPrice] = useState<number | "">(defaultValues?.arPrice ?? "");
  const [isSubscription, setIsSubscription] = useState<boolean>(
    defaultValues?.isSubscription ?? false
  );
  const [requiresPremium, setRequiresPremium] = useState<boolean>(
    defaultValues?.requiresPremium ?? false
  );
  const [coverImageUrl, setCoverImageUrl] = useState<string>(
    defaultValues?.coverImageUrl ?? ""
  );
  const [resourceType, setResourceType] = useState<ResourceType>(
    defaultValues?.resourceType ?? "LINK"
  );
  const [resourceUrl, setResourceUrl] = useState<string>(
    defaultValues?.resourceUrl ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!titleValue.trim()) return "El título es obligatorio.";
    if (!Number.isFinite(usdPrice) || usdPrice < 0) {
      return "El precio USD debe ser 0 o mayor.";
    }
    if (arPrice !== "" && (!Number.isFinite(Number(arPrice)) || Number(arPrice) < 0)) {
      return "Si cargás precio ARS, debe ser 0 o mayor.";
    }
    if (!resourceType) return "El tipo de recurso es obligatorio.";
    if (!isEdit && !resourceUrl.trim()) {
      return "El resourceUrl es obligatorio para crear.";
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

      const dto: any = {
        title: titleValue.trim(),
        description: description.trim() || undefined,
        usdPrice: Number(usdPrice),
        isSubscription,
        requiresPremium,
        coverImageUrl: coverImageUrl.trim() || undefined,
        resourceType,
        resourceUrl: resourceUrl.trim() || undefined,
      };

      if (arPrice !== "") dto.arPrice = Number(arPrice);

      if (isEdit && !dto.resourceUrl) delete dto.resourceUrl;
      if (!dto.description) delete dto.description;
      if (!dto.coverImageUrl) delete dto.coverImageUrl;

      await onSubmit(dto as TDto);
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
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
                  <Layers3 className="h-3.5 w-3.5" />
                  Gestión de productos
                </div>

                <h3 className="text-xl font-black text-white sm:text-2xl">{title}</h3>
                <p className="mt-2 text-sm text-white/60">
                  Completá los datos del producto. La lógica se mantiene igual, pero la
                  experiencia visual ahora es mucho más sólida y cómoda.
                </p>
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
                      Nombre
                    </label>
                    <input
                      value={titleValue}
                      onChange={(e) => setTitleValue(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                      placeholder="Plantilla de Ingresos (Excel)"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/85">
                      Descripción (opcional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                      placeholder="Template para controlar ingresos, egresos, ventas o recursos..."
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/85">
                      Cover image URL (opcional)
                    </label>
                    <input
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                      placeholder="https://.../cover.png"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/85">
                      Resource URL {isEdit ? "(solo si querés cambiarlo)" : "(obligatorio)"}
                    </label>
                    <input
                      value={resourceUrl}
                      onChange={(e) => setResourceUrl(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                      placeholder="https://drive.google.com/..."
                    />
                    <p className="mt-2 text-xs text-white/45">
                      Por seguridad, el backend no devuelve este campo en GET. Solo se
                      envía desde admin.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <p className="mb-4 text-sm font-semibold text-white/85">Precios</p>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm text-white/70">Precio USD</label>
                        <input
                          value={usdPrice}
                          onChange={(e) => setUsdPrice(Number(e.target.value))}
                          type="number"
                          step="0.01"
                          min={0}
                          className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-white outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                          placeholder="10.00"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-white/70">
                          Precio ARS (opcional)
                        </label>
                        <input
                          value={arPrice}
                          onChange={(e) =>
                            setArPrice(e.target.value === "" ? "" : Number(e.target.value))
                          }
                          type="number"
                          step="1"
                          min={0}
                          className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-white outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                          placeholder="15000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <p className="mb-4 text-sm font-semibold text-white/85">Configuración</p>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                        <input
                          id="isSubscription"
                          type="checkbox"
                          checked={isSubscription}
                          onChange={(e) => setIsSubscription(e.target.checked)}
                          className="h-4 w-4 accent-yellow-400"
                        />
                        <span className="text-sm text-white/80">Es suscripción</span>
                      </label>

                      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                        <input
                          id="requiresPremium"
                          type="checkbox"
                          checked={requiresPremium}
                          onChange={(e) => setRequiresPremium(e.target.checked)}
                          className="h-4 w-4 accent-yellow-400"
                        />
                        <span className="text-sm text-white/80">Requiere Premium</span>
                      </label>

                      <div>
                        <label className="mb-2 block text-sm text-white/70">Tipo de recurso</label>
                        <select
                          value={resourceType}
                          onChange={(e) => setResourceType(e.target.value as ResourceType)}
                          className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-white outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                        >
                          <option value="LINK">LINK</option>
                          <option value="FILE">FILE</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-yellow-400/15 bg-yellow-400/5 p-4 text-sm text-white/65">
                    Este modal mantiene tu validación actual, pero con mejor estructura,
                    mejor lectura y una experiencia mucho más sólida en mobile y desktop.
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