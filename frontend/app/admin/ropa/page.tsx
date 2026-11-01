"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AlertTriangle, Check, Loader2, Plus, RefreshCw, Search, Shirt, X } from "lucide-react";
import {
  clothingService,
  ClothingCategory,
  ClothingDashboard,
  ClothingOrder,
  ClothingSize,
  ClothingStatus,
} from "@/services/clothing.service";

type Tab = "orders" | "stock" | "products";
type ItemDraft = {
  productId: string; productName: string; category: ClothingCategory;
  size: ClothingSize | ""; quantity: number; unitPrice: number;
  unitDtfCost: number; unitGarmentCost: number; trackStock: boolean;
};
type Draft = {
  clientName: string; source: string; status: ClothingStatus; orderDate: string;
  expectedDate: string; receivedAmount: number; extraExpenses: number;
  notes: string; items: ItemDraft[];
};

const money = (n: number) => "$" + (n || 0).toLocaleString("es-AR");
const statusOptions: { value: ClothingStatus; label: string }[] = [
  { value: "ORDER_RECEIVED", label: "Pedido recibido" },
  { value: "PAYMENT_RECEIVED", label: "Pago recibido" },
  { value: "ORDERED_TO_SUPPLIER", label: "Pedido al proveedor" },
  { value: "FOLLOW_UP_SENT", label: "Seguimiento enviado" },
  { value: "WAITING_YURI", label: "Esperando Yuri" },
  { value: "DISPATCHED", label: "Despachado" },
  { value: "RETURNING", label: "Volviendo" },
  { value: "FINISHED", label: "Finalizado" },
  { value: "CANCELLED", label: "Cancelado" },
];
const categoryOptions: { value: ClothingCategory; label: string }[] = [
  { value: "TSHIRT", label: "Remera" },
  { value: "HOODIE", label: "Buzo" },
  { value: "CHOMBA", label: "Chomba" },
  { value: "OTHER", label: "Otro" },
];
const sizeOptions: { value: ClothingSize; label: string }[] = [
  { value: "S", label: "S" }, { value: "M", label: "M" }, { value: "L", label: "L" },
  { value: "XL", label: "XL" }, { value: "XXL", label: "2XL" },
  { value: "XXXL", label: "3XL" }, { value: "ONE_SIZE", label: "Único" },
];
const channels = ["Wsp", "Tienda Nube", "Tiktok", "Instagram", "YouTube", "Otro"];
const field = "w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white outline-none focus:border-yellow-400/50";
const today = new Date().toISOString().slice(0, 10);

function newDraft(): Draft {
  return {
    clientName: "", source: "Wsp", status: "ORDER_RECEIVED", orderDate: today,
    expectedDate: "", receivedAmount: 0, extraExpenses: 0, notes: "", items: [],
  };
}
function cost(order: ClothingOrder) {
  return order.extraExpenses + order.items.reduce((sum, item) =>
    sum + item.quantity * (item.unitDtfCost + item.unitGarmentCost), 0);
}
function dateValue(value: string) {
  return value ? new Date(value + "T12:00:00").toISOString() : null;
}
function statusLabel(value: ClothingStatus) {
  return statusOptions.find((item) => item.value === value)?.label || value;
}

export default function BaseSoberanaClothingPage() {
  const [data, setData] = useState<ClothingDashboard | null>(null);
  const [tab, setTab] = useState<Tab>("orders");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Draft>(newDraft);
  const [stockValues, setStockValues] = useState<Record<string, { initialQty: number; restockedQty: number }>>({});
  const [paymentValues, setPaymentValues] = useState<Record<string, number>>({});
  const [productDraft, setProductDraft] = useState({
    name: "", category: "TSHIRT" as ClothingCategory, trackStock: true,
    defaultUnitPrice: 0, defaultUnitDtfCost: 3000, defaultUnitGarmentCost: 6800,
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await clothingService.dashboard();
      setData(result);
      setPaymentValues(Object.fromEntries(result.orders.map((order) => [order.id, order.receivedAmount])));
      setStockValues(Object.fromEntries(result.stock.map((row) => [
        row.category + ":" + row.size,
        { initialQty: row.initialQty, restockedQty: row.restockedQty },
      ])));
    } catch (err: any) {
      setError(err?.status === 403
        ? "Esta cuenta no está autorizada para ver Base Soberana."
        : err?.message || "No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function addItem() {
    const product = data?.products[0];
    if (!product) return;
    setDraft((current) => ({
      ...current,
      items: [...current.items, {
        productId: product.id, productName: product.name, category: product.category,
        size: product.trackStock ? "M" : "", quantity: 1,
        unitPrice: product.defaultUnitPrice, unitDtfCost: product.defaultUnitDtfCost,
        unitGarmentCost: product.defaultUnitGarmentCost, trackStock: product.trackStock,
      }],
    }));
  }

  function changeItem(index: number, patch: Partial<ItemDraft>) {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, i) => i === index ? { ...item, ...patch } : item),
    }));
  }

  function chooseProduct(index: number, id: string) {
    const product = data?.products.find((item) => item.id === id);
    if (!product) return;
    changeItem(index, {
      productId: product.id, productName: product.name, category: product.category,
      unitPrice: product.defaultUnitPrice, unitDtfCost: product.defaultUnitDtfCost,
      unitGarmentCost: product.defaultUnitGarmentCost, trackStock: product.trackStock,
      size: product.trackStock ? "M" : "",
    });
  }

  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.clientName.trim() || !draft.items.length) {
      setError("Completá el cliente y agregá al menos un producto.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await clothingService.createOrder({
        ...draft, orderDate: dateValue(draft.orderDate),
        expectedDate: dateValue(draft.expectedDate),
        items: draft.items.map((item) => ({ ...item, size: item.size || null })),
      });
      setDraft(newDraft());
      setShowForm(false);
      setMessage("Pedido guardado correctamente.");
      await load();
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar el pedido.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(order: ClothingOrder, status: ClothingStatus) {
    setSaving(true);
    setError("");
    try {
      await clothingService.updateOrder(order.id, { status });
      setMessage("Estado actualizado.");
      await load();
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar el pedido.");
    } finally {
      setSaving(false);
    }
  }

  async function savePayment(order: ClothingOrder) {
    const receivedAmount = paymentValues[order.id] ?? order.receivedAmount;
    setSaving(true);
    setError("");
    try {
      await clothingService.updateOrder(order.id, { receivedAmount });
      setMessage("Cobro actualizado.");
      await load();
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar el cobro.");
    } finally {
      setSaving(false);
    }
  }

  async function saveStock(category: ClothingCategory, size: ClothingSize) {
    const key = category + ":" + size;
    const value = stockValues[key];
    if (!value) return;
    setSaving(true);
    setError("");
    try {
      await clothingService.updateStock({ category, size, ...value });
      setMessage("Stock actualizado.");
      await load();
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar el stock.");
    } finally {
      setSaving(false);
    }
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!productDraft.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await clothingService.createProduct(productDraft);
      setProductDraft({
        name: "", category: "TSHIRT", trackStock: true,
        defaultUnitPrice: 0, defaultUnitDtfCost: 3000, defaultUnitGarmentCost: 6800,
      });
      setMessage("Producto agregado.");
      await load();
    } catch (err: any) {
      setError(err?.message || "No se pudo crear el producto.");
    } finally {
      setSaving(false);
    }
  }

  const orders = (data?.orders || []).filter((order) => {
    const text = [order.clientName, order.source, ...order.items.map((item) => item.productName)].join(" ").toLowerCase();
    return text.includes(search.toLowerCase()) && (filter === "ALL" || order.status === filter);
  });

  return (
    <div className="space-y-6 text-white">
      <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-yellow-400/10 to-transparent p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-yellow-300">
              <Shirt className="h-4 w-4" /> Base Soberana · Módulo privado
            </div>
            <h1 className="mt-3 text-3xl font-black">Gestión de ropa</h1>
            <p className="mt-2 text-sm text-white/55">Pedidos, talles, inventario y números del emprendimiento.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/75 hover:bg-white/5"><RefreshCw className="h-4 w-4" />Actualizar</button>
            <button onClick={() => { setTab("orders"); setShowForm(true); }} className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold text-black hover:bg-yellow-300"><Plus className="h-4 w-4" />Nuevo pedido</button>
          </div>
        </div>
      </header>

      {error && <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200"><AlertTriangle className="mr-2 inline h-4 w-4" />{error}</div>}
      {message && <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200"><Check className="mr-2 inline h-4 w-4" />{message}</div>}
      {loading && !data ? <div className="flex items-center gap-2 py-12 text-sm text-white/50"><Loader2 className="h-5 w-5 animate-spin" />Cargando...</div> : data && <>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Pedidos activos" value={data.stats.orders.toString()} />
          <Stat label="Unidades" value={data.stats.units.toString()} />
          <Stat label="Dinero recibido" value={money(data.stats.receivedAmount)} />
          <Stat label="Ganancia estimada" value={money(data.stats.profit)} />
        </div>
        <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/30 p-2">
          {([["orders", "Pedidos"], ["stock", "Stock y talles"], ["products", "Productos"]] as [Tab, string][]).map(([value, label]) =>
            <button key={value} onClick={() => setTab(value)} className={"rounded-xl px-4 py-2.5 text-sm font-semibold " + (tab === value ? "bg-yellow-400 text-black" : "text-white/60 hover:bg-white/5")}>{label}</button>
          )}
        </div>

        {tab === "orders" && <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:flex-row">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente o producto" className={field + " pl-9"} /></div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className={field + " md:w-64"}><option value="ALL">Todos los estados</option>{statusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
            <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-black"><Plus className="mr-1 inline h-4 w-4" />Cargar pedido</button>
          </div>

          {showForm && <form onSubmit={createOrder} className="space-y-4 rounded-3xl border border-yellow-400/20 bg-yellow-400/[0.04] p-5">
            <div className="flex items-center justify-between"><h2 className="font-bold">Nuevo pedido</h2><button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5 text-white/50" /></button></div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Field label="Cliente"><input required value={draft.clientName} onChange={(e) => setDraft({ ...draft, clientName: e.target.value })} className={field} placeholder="Nombre del cliente" /></Field>
              <Field label="Origen"><select value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} className={field}>{channels.map((v) => <option key={v}>{v}</option>)}</select></Field>
              <Field label="Estado"><select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as ClothingStatus })} className={field}>{statusOptions.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}</select></Field>
              <Field label="Fecha de ingreso"><input type="date" value={draft.orderDate} onChange={(e) => setDraft({ ...draft, orderDate: e.target.value })} className={field} /></Field>
              <Field label="Fecha estimada"><input type="date" value={draft.expectedDate} onChange={(e) => setDraft({ ...draft, expectedDate: e.target.value })} className={field} /></Field>
              <Field label="Dinero recibido ($)"><input type="number" min="0" value={draft.receivedAmount} onChange={(e) => setDraft({ ...draft, receivedAmount: Number(e.target.value) })} className={field} /></Field>
              <Field label="Gastos adicionales ($)"><input type="number" min="0" value={draft.extraExpenses} onChange={(e) => setDraft({ ...draft, extraExpenses: Number(e.target.value) })} className={field} /></Field>
              <Field label="Notas"><input value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} className={field} /></Field>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><h3 className="text-sm font-bold">Prendas y talles</h3><button type="button" onClick={addItem} className="rounded-lg border border-yellow-400/20 px-3 py-2 text-xs font-semibold text-yellow-200"><Plus className="mr-1 inline h-3.5 w-3.5" />Agregar producto</button></div>
              {draft.items.map((item, index) => <div key={index} className="grid gap-2 rounded-2xl border border-white/10 bg-black/30 p-3 sm:grid-cols-2 xl:grid-cols-6">
                <Field label="Producto"><select value={item.productId} onChange={(e) => chooseProduct(index, e.target.value)} className={field}>{data.products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
                <Field label="Talle"><select value={item.size} onChange={(e) => changeItem(index, { size: e.target.value as ClothingSize | "" })} className={field}><option value="">No aplica</option>{sizeOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></Field>
                <Field label="Cantidad"><input type="number" min="1" value={item.quantity} onChange={(e) => changeItem(index, { quantity: Math.max(1, Number(e.target.value)) })} className={field} /></Field>
                <Field label="Precio unitario"><input type="number" min="0" value={item.unitPrice} onChange={(e) => changeItem(index, { unitPrice: Number(e.target.value) })} className={field} /></Field>
                <Field label="Costo DTF"><input type="number" min="0" value={item.unitDtfCost} onChange={(e) => changeItem(index, { unitDtfCost: Number(e.target.value) })} className={field} /></Field>
                <Field label="Costo prenda"><input type="number" min="0" value={item.unitGarmentCost} onChange={(e) => changeItem(index, { unitGarmentCost: Number(e.target.value) })} className={field} /></Field>
                <div className="flex items-center justify-between sm:col-span-2 xl:col-span-6"><label className="text-xs text-white/55"><input type="checkbox" checked={item.trackStock} onChange={(e) => changeItem(index, { trackStock: e.target.checked })} className="mr-2" />Descontar del stock</label><button type="button" onClick={() => setDraft({ ...draft, items: draft.items.filter((_, i) => i !== index) })} className="text-xs text-red-300">Quitar</button></div>
              </div>)}
              {!draft.items.length && <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-white/40">Agregá una o más prendas al pedido.</p>}
            </div>
            <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-white/45">Los costos unitarios se multiplican por la cantidad de cada talle.</p><button disabled={saving || !draft.items.length} className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-black disabled:opacity-50">{saving ? "Guardando..." : "Guardar pedido"}</button></div>
          </form>}

          {orders.map((order) => <article key={order.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="font-bold">{order.clientName}</h3><p className="mt-1 text-xs text-white/45">{new Date(order.orderDate).toLocaleDateString("es-AR")} · {order.source || "Origen no indicado"}</p></div><select value={order.status} onChange={(e) => updateStatus(order, e.target.value as ClothingStatus)} className={field + " sm:w-56"}>{statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
            <div className="mt-3 space-y-1">{order.items.map((item) => <p key={item.id} className="text-sm text-white/70">{item.productName} · {item.size || "Sin talle"} · ×{item.quantity}</p>)}</div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-3 text-xs"><div><p className="text-white/40">Recibido</p><p className="mt-1 font-bold">{money(order.receivedAmount)}</p></div><div><p className="text-white/40">Costos</p><p className="mt-1 font-bold">{money(cost(order))}</p></div><div><p className="text-white/40">Resultado</p><p className="mt-1 font-bold">{money(order.receivedAmount - cost(order))}</p></div></div>
            <div className="mt-3 flex flex-col gap-2 border-t border-white/[0.07] pt-3 sm:flex-row sm:items-end">
              <Field label="Actualizar dinero recibido ($)"><input type="number" min="0" value={paymentValues[order.id] ?? order.receivedAmount} onChange={(e) => setPaymentValues((old) => ({ ...old, [order.id]: Number(e.target.value) }))} className={field} /></Field>
              <button onClick={() => savePayment(order)} disabled={saving} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-white/75 hover:bg-white/5 disabled:opacity-50">Guardar cobro</button>
            </div>
          </article>)}
          {!orders.length && <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">No hay pedidos para mostrar.</p>}
        </section>}

        {tab === "stock" && <section className="space-y-4">
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/55">Disponible = stock inicial + reposiciones − pedidos no cancelados. Los saldos negativos se muestran para advertir faltantes.</p>
          {categoryOptions.map((category) => <div key={category.value} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><h2 className="mb-3 font-bold">{category.label}</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{data.stock.filter((row) => row.category === category.value).map((row) => {
            const key = row.category + ":" + row.size;
            const value = stockValues[key] || { initialQty: row.initialQty, restockedQty: row.restockedQty };
            return <div key={key} className="rounded-xl border border-white/[0.08] bg-black/25 p-3"><div className="flex items-center justify-between"><b>{sizeOptions.find((s) => s.value === row.size)?.label || row.size}</b><span className={row.available < 0 ? "text-red-300" : "text-emerald-300"}>{row.available} disponibles</span></div><div className="mt-3 grid grid-cols-2 gap-2"><Field label="Stock inicial"><input type="number" min="0" value={value.initialQty} onChange={(e) => setStockValues((old) => ({ ...old, [key]: { ...value, initialQty: Number(e.target.value) } }))} className={field} /></Field><Field label="Reposiciones"><input type="number" min="0" value={value.restockedQty} onChange={(e) => setStockValues((old) => ({ ...old, [key]: { ...value, restockedQty: Number(e.target.value) } }))} className={field} /></Field></div><div className="mt-3 flex items-center justify-between"><span className="text-xs text-white/40">{row.sold} vendidos</span><button onClick={() => saveStock(row.category, row.size)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70">Guardar</button></div></div>;
          })}</div></div>)}
        </section>}

        {tab === "products" && <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><h2 className="mb-3 font-bold">Catálogo</h2><div className="space-y-2">{data.products.map((product) => <div key={product.id} className="rounded-xl border border-white/[0.08] bg-black/25 p-3"><p className="text-sm font-semibold">{product.name}</p><p className="mt-1 text-xs text-white/45">{categoryOptions.find((c) => c.value === product.category)?.label} · {product.trackStock ? "Control de stock" : "Sin stock"}</p></div>)}</div></div>
          <form onSubmit={createProduct} className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-4"><h2 className="font-bold">Agregar producto</h2><div className="mt-3 space-y-3"><Field label="Nombre"><input required value={productDraft.name} onChange={(e) => setProductDraft({ ...productDraft, name: e.target.value })} className={field} /></Field><Field label="Categoría"><select value={productDraft.category} onChange={(e) => setProductDraft({ ...productDraft, category: e.target.value as ClothingCategory })} className={field}>{categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></Field><Field label="Precio unitario"><input type="number" min="0" value={productDraft.defaultUnitPrice} onChange={(e) => setProductDraft({ ...productDraft, defaultUnitPrice: Number(e.target.value) })} className={field} /></Field><Field label="Costo DTF"><input type="number" min="0" value={productDraft.defaultUnitDtfCost} onChange={(e) => setProductDraft({ ...productDraft, defaultUnitDtfCost: Number(e.target.value) })} className={field} /></Field><Field label="Costo de prenda"><input type="number" min="0" value={productDraft.defaultUnitGarmentCost} onChange={(e) => setProductDraft({ ...productDraft, defaultUnitGarmentCost: Number(e.target.value) })} className={field} /></Field><label className="flex items-center gap-2 text-xs text-white/55"><input type="checkbox" checked={productDraft.trackStock} onChange={(e) => setProductDraft({ ...productDraft, trackStock: e.target.checked })} />Controlar stock</label><button disabled={saving} className="w-full rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold text-black disabled:opacity-50">Agregar</button></div></form>
        </section>}
      </>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-xs text-white/45">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block min-w-0"><span className="text-xs font-medium text-white/55">{label}</span><div className="mt-1">{children}</div></label>;
}
