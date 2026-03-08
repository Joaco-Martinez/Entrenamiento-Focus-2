"use client"

import { useEffect, useState } from "react"
import {
  productsService,
  Product,
  CreateProductDto,
  UpdateProductDto,
  ResourceType,
} from "@/services/products.service"
import { useAuth } from "@/context/AuthContext"

export default function AdminProductsPage() {
  const { isAdmin } = useAuth()

  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const [deletingId, setDeletingId] = useState<number | null>(null)

  const refresh = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await productsService.getAll(1, 50)
      setItems(res.data)
    } catch (err: any) {
      setError(err?.message || "No se pudieron cargar los productos.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const onCreate = async (dto: CreateProductDto) => {
    await productsService.create(dto)
    setOpenCreate(false)
    await refresh()
  }

  const onEdit = async (id: number, dto: UpdateProductDto) => {
    await productsService.update(id, dto)
    setOpenEdit(false)
    setEditing(null)
    await refresh()
  }

  const onDelete = async (id: number) => {
    const ok = confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")
    if (!ok) return

    setDeletingId(id)
    try {
      await productsService.remove(id)
      await refresh()
    } finally {
      setDeletingId(null)
    }
  }

  if (!isAdmin) return null

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold md:text-4xl">
            Productos <span className="text-yellow-400">Admin</span>
          </h1>
          <div className="mt-4 h-[3px] w-16 rounded-full bg-yellow-400" />
          <p className="mt-4 text-white/70">Creá, editá y eliminá productos (cursos o planes).</p>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="rounded-xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:bg-yellow-300"
        >
          + Crear producto
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-white/60">
              <tr>
                <th className="py-3 px-3">Nombre</th>
                <th className="py-3 px-3">Precio (USD)</th>
                <th className="py-3 px-3">Precio (ARS)</th>
                <th className="py-3 px-3">Suscripción</th>
                <th className="py-3 px-3">Premium</th>
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="py-6 px-3 text-white/60" colSpan={7}>
                    Cargando...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="py-6 px-3 text-white/60" colSpan={7}>
                    No hay productos todavía.
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="border-t border-white/5">
                    <td className="py-4 px-3">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                          {p.coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.coverImageUrl}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>

                        <div>
                          <div className="font-semibold text-white">{p.name}</div>
                          {p.description ? (
                            <div className="mt-1 text-xs text-white/55 line-clamp-2">
                              {p.description}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-3 text-white/80">
                      {p.priceUsd != null ? (
                        <>${Number(p.priceUsd).toFixed(2)}</>
                      ) : (
                        <span className="text-white/50">—</span>
                      )}
                    </td>

                    <td className="py-4 px-3 text-white/80">
                      {p.priceArs != null ? (
                        <>${Number(p.priceArs).toLocaleString("es-AR")}</>
                      ) : (
                        <span className="text-white/50">—</span>
                      )}
                    </td>

                    <td className="py-4 px-3">
                      {p.isSubscription ? (
                        <span className="rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-200">
                          Sí
                        </span>
                      ) : (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                          No
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-3">
                      {p.requiresPremium ? (
                        <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                          Requiere
                        </span>
                      ) : (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                          Libre
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-3">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                        {p.resourceType}
                      </span>
                    </td>

                    <td className="py-4 px-3">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/80 hover:bg-white/[0.06]"
                          onClick={() => {
                            setEditing(p)
                            setOpenEdit(true)
                          }}
                        >
                          Editar
                        </button>

                        <button
                          disabled={deletingId === p.id}
                          className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200 hover:bg-red-500/15 disabled:opacity-50"
                          onClick={() => onDelete(p.id)}
                        >
                          {deletingId === p.id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Crear */}
      {openCreate && (
        <ProductModal<CreateProductDto>
          title="Crear producto"
          submitLabel="Crear"
          onClose={() => setOpenCreate(false)}
          onSubmit={onCreate}
        />
      )}

      {/* Editar */}
      {openEdit && editing && (
        <ProductModal<UpdateProductDto>
          title="Editar producto"
          submitLabel="Guardar"
          defaultValues={{
            name: editing.name,
            description: editing.description || "",
            priceUsd: Number(editing.priceUsd ?? 0),
            priceArs: editing.priceArs != null ? Number(editing.priceArs) : undefined,
            isSubscription: editing.isSubscription,
            requiresPremium: editing.requiresPremium,
            coverImageUrl: editing.coverImageUrl ?? "",
            resourceType: editing.resourceType,
            resourceUrl: "", // no viene del GET por seguridad
          }}
          onClose={() => {
            setOpenEdit(false)
            setEditing(null)
          }}
          onSubmit={(dto) => onEdit(editing.id, dto)}
          isEdit
        />
      )}
    </div>
  )
}

/* ---------------- Modal ---------------- */

type ProductFormValues = {
  name: string
  description?: string
  priceUsd: number
  priceArs?: number
  isSubscription?: boolean
  requiresPremium?: boolean
  coverImageUrl?: string
  resourceType?: ResourceType
  resourceUrl?: string
}

function ProductModal<TDto extends CreateProductDto | UpdateProductDto>({
  title,
  submitLabel,
  onClose,
  onSubmit,
  defaultValues,
  isEdit = false,
}: {
  title: string
  submitLabel: string
  onClose: () => void
  onSubmit: (dto: TDto) => Promise<void>
  defaultValues?: ProductFormValues
  isEdit?: boolean
}) {
  const [name, setName] = useState(defaultValues?.name ?? "")
  const [description, setDescription] = useState(defaultValues?.description ?? "")

  const [priceUsd, setPriceUsd] = useState<number>(defaultValues?.priceUsd ?? 0)
  const [priceArs, setPriceArs] = useState<number | "">(defaultValues?.priceArs ?? "")

  const [isSubscription, setIsSubscription] = useState<boolean>(defaultValues?.isSubscription ?? false)

  const [requiresPremium, setRequiresPremium] = useState<boolean>(
    defaultValues?.requiresPremium ?? false
  )
  const [coverImageUrl, setCoverImageUrl] = useState<string>(defaultValues?.coverImageUrl ?? "")
  const [resourceType, setResourceType] = useState<ResourceType>(defaultValues?.resourceType ?? "LINK")
  const [resourceUrl, setResourceUrl] = useState<string>(defaultValues?.resourceUrl ?? "")

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = () => {
    if (!name.trim()) return "El nombre es obligatorio."

    // backend: number y >= 0
    if (!Number.isFinite(priceUsd) || priceUsd < 0) return "El precio USD debe ser 0 o mayor."

    if (priceArs !== "" && (!Number.isFinite(Number(priceArs)) || Number(priceArs) < 0)) {
      return "Si cargás precio ARS, debe ser 0 o mayor."
    }

    if (!resourceType) return "El tipo de recurso es obligatorio."

    // create: resourceUrl obligatorio
    if (!isEdit && !resourceUrl.trim()) return "El resourceUrl es obligatorio para crear."

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const v = validate()
    if (v) return setError(v)

    try {
      setSaving(true)

      const dto: any = {
        name: name.trim(),
        description: description.trim() || undefined,
        priceUsd: Number(priceUsd),
        isSubscription,
        requiresPremium,
        coverImageUrl: coverImageUrl.trim() || undefined,
        resourceType,
        resourceUrl: resourceUrl.trim() || undefined,
      }

      if (priceArs !== "") dto.priceArs = Number(priceArs)

      // edit: si no mandás resourceUrl, no lo envíes
      if (isEdit && !dto.resourceUrl) delete dto.resourceUrl

      // opcionales limpios (evita validaciones raras)
      if (!dto.description) delete dto.description
      if (!dto.coverImageUrl) delete dto.coverImageUrl

      await onSubmit(dto as TDto)
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-yellow-400/20 bg-[#0B0B0B] p-6 shadow-[0_0_0_1px_rgba(250,204,21,0.06),0_20px_80px_-20px_rgba(0,0,0,0.9)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="mt-1 text-sm text-white/60">Completá los datos del producto.</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 hover:bg-white/[0.06]"
          >
            Cerrar
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/85">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
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
              rows={4}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
              placeholder="Template para controlar ingresos/egresos..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/85">Precio (USD)</label>
              <input
                value={priceUsd}
                onChange={(e) => setPriceUsd(Number(e.target.value))}
                type="number"
                step="0.01"
                min={0}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                placeholder="10.00"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/85">
                Precio (ARS) (opcional)
              </label>
              <input
                value={priceArs}
                onChange={(e) => setPriceArs(e.target.value === "" ? "" : Number(e.target.value))}
                type="number"
                step="1"
                min={0}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                placeholder="15000"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <input
              id="isSubscription"
              type="checkbox"
              checked={isSubscription}
              onChange={(e) => setIsSubscription(e.target.checked)}
              className="h-4 w-4 accent-yellow-400"
            />
            <label htmlFor="isSubscription" className="text-sm text-white/80">
              Es suscripción
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <input
                id="requiresPremium"
                type="checkbox"
                checked={requiresPremium}
                onChange={(e) => setRequiresPremium(e.target.checked)}
                className="h-4 w-4 accent-yellow-400"
              />
              <label htmlFor="requiresPremium" className="text-sm text-white/80">
                Requiere Premium
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/85">Tipo de recurso</label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as ResourceType)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
              >
                <option value="LINK">LINK</option>
                <option value="FILE">FILE</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/85">
              Cover image URL (opcional)
            </label>
            <input
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
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
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
              placeholder="https://drive.google.com/..."
            />
            <p className="mt-2 text-xs text-white/45">
              Por seguridad, el backend nunca devuelve este campo en GET. Solo se envía desde admin.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Guardando..." : submitLabel}
            <span className="transition group-hover:translate-x-0.5">→</span>
          </button>
        </form>
      </div>
    </div>
  )
}
