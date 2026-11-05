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

const money = (n: number) => "$" + (n || 0).toLocaleString("es-AR", { maximumFractionDigits: 2 });
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
  { value: "SIZE_1", label: "1" }, { value: "SIZE_2", label: "2" },
  { value: "S", label: "S" }, { value: "M", label: "M" }, { value: "L", label: "L" },
  { value: "XL", label: "XL" }, { value: "XXL", label: "2XL" },
  { value: "XXXL", label: "3XL" }, { value: "ONE_SIZE", label: "Único" },
];
const channels = ["Wsp", "Tienda Nube", "TikTok", "Instagram", "YouTube", "Otro"];
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
function sales(order: ClothingOrder) {
  return order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}
function isSoldStatus(status: ClothingStatus) {
  return status === "DISPATCHED" || status === "FINISHED" || status === "RETURNING";
}
function statusTone(status: ClothingStatus) {
  if (status === "DISPATCHED" || status === "FINISHED") return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
  if (status === "RETURNING") return "border-orange-400/25 bg-orange-400/10 text-orange-200";
  if (status === "CANCELLED") return "border-red-400/25 bg-red-400/10 text-red-200";
  if (status === "PAYMENT_RECEIVED") return "border-yellow-400/25 bg-yellow-400/10 text-yellow-200";
  return "border-white/10 bg-white/[0.04] text-white/65";
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
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [productFilter, setProductFilter] = useState("ALL");
  const [sizeFilter, setSizeFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingOrderItemsLocked, setEditingOrderItemsLocked] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(newDraft);
  const [stockValues, setStockValues] = useState<Record<string, { initialQty: number; restockedQty: number }>>({});
  const [paymentValues, setPaymentValues] = useState<Record<string, number>>({});
  const [productDraft, setProductDraft] = useState({
    name: "", category: "TSHIRT" as ClothingCategory, trackStock: true,
    defaultUnitPrice: 0, defaultUnitDtfCost: 0, defaultUnitGarmentCost: 0,
  });
  const [movementDraft, setMovementDraft] = useState({
    category: "TSHIRT" as ClothingCategory, size: "M" as ClothingSize,
    type: "IN" as "IN" | "OUT" | "ADJUSTMENT", quantity: 1, notes: "",
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
    if (editingOrderItemsLocked) return;
    const product = data?.products.find((item) => item.active);
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
    const product = data?.products.find((item) => item.id === id && item.active);
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
      const { items: draftItems, ...orderFields } = draft;
      const payload = {
        ...orderFields,
        orderDate: dateValue(draft.orderDate),
        expectedDate: dateValue(draft.expectedDate),
        ...(editingOrderId && editingOrderItemsLocked ? {} : {
          items: draftItems.map((item) => ({ ...item, size: item.size || null })),
        }),
      };
      if (editingOrderId) await clothingService.updateOrder(editingOrderId, payload);
      else await clothingService.createOrder(payload);
      setDraft(newDraft());
      setEditingOrderId(null);
      setEditingOrderItemsLocked(false);
      setShowForm(false);
      setMessage(editingOrderId ? "Pedido actualizado correctamente." : "Pedido guardado correctamente.");
      await load();
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar el pedido.");
    } finally {
      setSaving(false);
    }
  }

  function startEditOrder(order: ClothingOrder) {
    setEditingOrderItemsLocked(isSoldStatus(order.status));
    setDraft({
      clientName: order.clientName, source: order.source, status: order.status,
      orderDate: new Date(order.orderDate).toISOString().slice(0, 10),
      expectedDate: order.expectedDate ? new Date(order.expectedDate).toISOString().slice(0, 10) : "",
      receivedAmount: order.receivedAmount, extraExpenses: order.extraExpenses,
      notes: order.notes || "",
      items: order.items.map((item) => ({
        productId: item.productId || "", productName: item.productName, category: item.category,
        size: item.size || "", quantity: item.quantity, unitPrice: item.unitPrice,
        unitDtfCost: item.unitDtfCost, unitGarmentCost: item.unitGarmentCost, trackStock: item.trackStock,
      })),
    });
    setEditingOrderId(order.id);
    setShowForm(true);
    setTab("orders");
    setError("");
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

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!productDraft.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      if (editingProductId) await clothingService.updateProduct(editingProductId, productDraft);
      else await clothingService.createProduct(productDraft);
      setProductDraft({ name: "", category: "TSHIRT", trackStock: true, defaultUnitPrice: 0, defaultUnitDtfCost: 0, defaultUnitGarmentCost: 0 });
      setEditingProductId(null);
      setMessage(editingProductId ? "Producto actualizado." : "Producto agregado.");
      await load();
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  }

  function startEditProduct(product: ClothingDashboard["products"][number]) {
    setEditingProductId(product.id);
    setProductDraft({
      name: product.name, category: product.category, trackStock: product.trackStock,
      defaultUnitPrice: product.defaultUnitPrice, defaultUnitDtfCost: product.defaultUnitDtfCost,
      defaultUnitGarmentCost: product.defaultUnitGarmentCost,
    });
  }

  async function toggleProduct(product: ClothingDashboard["products"][number]) {
    setSaving(true);
    try {
      await clothingService.updateProduct(product.id, { active: !product.active });
      setMessage(product.active ? "Producto desactivado." : "Producto reactivado.");
      await load();
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar el producto.");
    } finally {
      setSaving(false);
    }
  }

  async function createStockMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await clothingService.createStockMovement(movementDraft);
      setMovementDraft((old) => ({ ...old, quantity: 1, notes: "" }));
      setMessage("Movimiento de stock registrado.");
      await load();
    } catch (err: any) {
      setError(err?.message || "No se pudo registrar el movimiento.");
    } finally {
      setSaving(false);
    }
  }

  const orders = (data?.orders || []).filter((order) => {
    const text = [order.clientName, order.source, ...order.items.map((item) => item.productName)].join(" ").toLowerCase();
    const orderDay = new Date(order.orderDate).toISOString().slice(0, 10);
    return text.includes(search.toLowerCase())
      && (filter === "ALL" || order.status === filter)
      && (channelFilter === "ALL" || order.source === channelFilter)
      && (productFilter === "ALL" || order.items.some((item) => item.productId === productFilter))
      && (sizeFilter === "ALL" || order.items.some((item) => item.size === sizeFilter))
      && (!dateFrom || orderDay >= dateFrom)
      && (!dateTo || orderDay <= dateTo);
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
            <button onClick={() => { setTab("orders"); setEditingOrderId(null); setEditingOrderItemsLocked(false); setDraft(newDraft()); setShowForm(true); }} className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold text-black hover:bg-yellow-300"><Plus className="h-4 w-4" />Nuevo pedido</button>
          </div>
        </div>
      </header>

      {error && <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200"><AlertTriangle className="mr-2 inline h-4 w-4" />{error}</div>}
      {message && <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200"><Check className="mr-2 inline h-4 w-4" />{message}</div>}
      {loading && !data ? <div className="flex items-center gap-2 py-12 text-sm text-white/50"><Loader2 className="h-5 w-5 animate-spin" />Cargando...</div> : data && <>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Pedidos activos" value={data.stats.orders.toString()} />
          <Stat label="Pedidos pendientes" value={data.stats.pending.toString()} />
          <Stat label="Pedidos entregados" value={data.stats.delivered.toString()} />
          <Stat label="Unidades despachadas" value={data.stats.units.toString()} />
          <Stat label="Ventas registradas" value={money(data.stats.totalSales)} />
          <Stat label="Dinero cobrado" value={money(data.stats.receivedAmount)} />
          <Stat label="Costos registrados" value={money(data.stats.totalCost)} />
          <Stat label="Ganancia estimada" value={money(data.stats.profit)} />
          <Stat label="Saldo pendiente" value={money(data.stats.balanceDue)} />
          <Stat label="Stock neto total" value={data.stats.stockAvailable.toString()} />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="font-bold">Diseños más vendidos</h2>
            <p className="mt-1 text-xs text-white/45">Unidades de pedidos despachados, en devolución o finalizados.</p>
            <div className="mt-4 space-y-3">
              {data.productSales.slice(0, 6).map((item, index) => <div key={item.name} className="flex items-center justify-between gap-3 text-sm"><span className="min-w-0 truncate text-white/75">{index + 1}. {item.name}</span><b className="shrink-0">{item.quantity} u.</b></div>)}
              {!data.productSales.length && <p className="text-xs text-white/40">Todavía no hay unidades despachadas.</p>}
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="font-bold">Resumen mensual</h2>
            <p className="mt-1 text-xs text-white/45">Ventas, cobros, costos y resultado por fecha del pedido.</p>
            <div className="mt-4 space-y-3">
              {data.monthlySummary.slice(-6).map((item) => <div key={item.month} className="rounded-xl border border-white/[0.07] bg-black/20 p-3"><div className="flex items-center justify-between gap-3"><b className="capitalize">{new Date(item.month + "-01T12:00:00").toLocaleDateString("es-AR", { month: "long", year: "numeric" })}</b><b className={item.profit < 0 ? "text-red-300" : "text-emerald-300"}>{money(item.profit)}</b></div><div className="mt-2 grid grid-cols-3 gap-2 text-xs"><div><span className="text-white/40">Ventas</span><p className="mt-1">{money(item.sales)}</p></div><div><span className="text-white/40">Cobrado</span><p className="mt-1">{money(item.received)}</p></div><div><span className="text-white/40">Costos</span><p className="mt-1">{money(item.cost)}</p></div></div></div>)}
              {!data.monthlySummary.length && <p className="text-xs text-white/40">Todavía no hay movimientos mensuales.</p>}
            </div>
          </section>
        </div>
        <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/30 p-2">
          {([["orders", "Pedidos"], ["stock", "Stock y talles"], ["products", "Productos"]] as [Tab, string][]).map(([value, label]) =>
            <button key={value} onClick={() => setTab(value)} className={"rounded-xl px-4 py-2.5 text-sm font-semibold " + (tab === value ? "bg-yellow-400 text-black" : "text-white/60 hover:bg-white/5")}>{label}</button>
          )}
        </div>

        {tab === "orders" && <section className="space-y-4">
          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente o producto" className={field + " pl-9"} /></div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className={field}><option value="ALL">Todos los estados</option>{statusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
            <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} className={field}><option value="ALL">Todos los canales</option>{channels.map((channel) => <option key={channel} value={channel}>{channel}</option>)}</select>
            <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className={field}><option value="ALL">Todos los diseños</option>{data.products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select>
            <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} className={field}><option value="ALL">Todos los talles</option>{sizeOptions.map((size) => <option key={size.value} value={size.value}>{size.label}</option>)}</select>
            <Field label="Desde"><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={field} /></Field>
            <Field label="Hasta"><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={field} /></Field>
            <button onClick={() => { setEditingOrderId(null); setEditingOrderItemsLocked(false); setDraft(newDraft()); setShowForm(true); }} className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-black"><Plus className="mr-1 inline h-4 w-4" />Cargar pedido</button>
          </div>

          {showForm && <form onSubmit={createOrder} className="space-y-4 rounded-3xl border border-yellow-400/20 bg-yellow-400/[0.04] p-5">
            <div className="flex items-center justify-between"><h2 className="font-bold">{editingOrderId ? "Editar pedido" : "Nuevo pedido"}</h2><button type="button" onClick={() => { setShowForm(false); setEditingOrderId(null); setEditingOrderItemsLocked(false); }}><X className="h-5 w-5 text-white/50" /></button></div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Field label="Cliente"><input required value={draft.clientName} onChange={(e) => setDraft({ ...draft, clientName: e.target.value })} className={field} placeholder="Nombre del cliente" /></Field>
              <Field label="Origen"><select value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} className={field}>{channels.map((v) => <option key={v}>{v}</option>)}</select></Field>
              <Field label="Estado"><select disabled={editingOrderItemsLocked} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as ClothingStatus })} className={field}>{statusOptions.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}</select></Field>
              <Field label="Fecha de ingreso"><input type="date" value={draft.orderDate} onChange={(e) => setDraft({ ...draft, orderDate: e.target.value })} className={field} /></Field>
              <Field label="Fecha estimada"><input type="date" value={draft.expectedDate} onChange={(e) => setDraft({ ...draft, expectedDate: e.target.value })} className={field} /></Field>
              <Field label="Dinero recibido ($)"><input type="number" min="0" step="0.01" value={draft.receivedAmount} onChange={(e) => setDraft({ ...draft, receivedAmount: Number(e.target.value) })} className={field} /></Field>
              <Field label="Gastos adicionales ($)"><input type="number" min="0" step="0.01" value={draft.extraExpenses} onChange={(e) => setDraft({ ...draft, extraExpenses: Number(e.target.value) })} className={field} /></Field>
              <Field label="Notas"><input value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} className={field} /></Field>
            </div>
            <div className="space-y-3">
              {editingOrderItemsLocked && <p className="rounded-xl border border-yellow-400/20 bg-yellow-400/[0.06] p-3 text-xs text-yellow-100/80">Este pedido ya fue despachado o finalizado. Podés corregir sus datos y cobros, pero las prendas quedan bloqueadas para no alterar el stock automáticamente.</p>}
              <div className="flex items-center justify-between"><h3 className="text-sm font-bold">Prendas y talles</h3><button type="button" disabled={editingOrderItemsLocked} onClick={addItem} className="rounded-lg border border-yellow-400/20 px-3 py-2 text-xs font-semibold text-yellow-200 disabled:opacity-40"><Plus className="mr-1 inline h-3.5 w-3.5" />Agregar producto</button></div>
              {draft.items.map((item, index) => <div key={index} className="grid gap-2 rounded-2xl border border-white/10 bg-black/30 p-3 sm:grid-cols-2 xl:grid-cols-6">
                <Field label="Producto"><select disabled={editingOrderItemsLocked} value={item.productId} onChange={(e) => chooseProduct(index, e.target.value)} className={field}>{data.products.filter((p) => p.active || p.id === item.productId).map((p) => <option key={p.id} value={p.id}>{p.name}{p.active ? "" : " (desactivado)"}</option>)}</select></Field>
                <Field label="Talle"><select disabled={editingOrderItemsLocked} value={item.size} onChange={(e) => changeItem(index, { size: e.target.value as ClothingSize | "" })} className={field}><option value="">No aplica</option>{sizeOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></Field>
                <Field label="Cantidad"><input disabled={editingOrderItemsLocked} type="number" min="1" value={item.quantity} onChange={(e) => changeItem(index, { quantity: Math.max(1, Number(e.target.value)) })} className={field} /></Field>
                <Field label="Precio unitario"><input disabled={editingOrderItemsLocked} type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => changeItem(index, { unitPrice: Number(e.target.value) })} className={field} /></Field>
                <Field label="Costo DTF por unidad"><input disabled={editingOrderItemsLocked} type="number" min="0" step="0.01" value={item.unitDtfCost} onChange={(e) => changeItem(index, { unitDtfCost: Number(e.target.value) })} className={field} /></Field>
                <Field label="Costo de prenda por unidad"><input disabled={editingOrderItemsLocked} type="number" min="0" step="0.01" value={item.unitGarmentCost} onChange={(e) => changeItem(index, { unitGarmentCost: Number(e.target.value) })} className={field} /></Field>
                <div className="flex items-center justify-between sm:col-span-2 xl:col-span-6"><label className="text-xs text-white/55"><input type="checkbox" disabled={editingOrderItemsLocked} checked={item.trackStock} onChange={(e) => changeItem(index, { trackStock: e.target.checked })} className="mr-2" />Descontar del stock</label><button type="button" disabled={editingOrderItemsLocked} onClick={() => setDraft({ ...draft, items: draft.items.filter((_, i) => i !== index) })} className="text-xs text-red-300 disabled:opacity-40">Quitar</button></div>
              </div>)}
              {!draft.items.length && <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-white/40">Agregá una o más prendas al pedido.</p>}
            </div>
            <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-white/45">Los costos unitarios se multiplican por la cantidad de cada talle.</p><button disabled={saving || !draft.items.length} className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-black disabled:opacity-50">{saving ? "Guardando..." : editingOrderId ? "Guardar cambios" : "Guardar pedido"}</button></div>
          </form>}

          {orders.map((order) => <article key={order.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="font-bold">{order.clientName}</h3><p className="mt-1 text-xs text-white/45">{new Date(order.orderDate).toLocaleDateString("es-AR")} · {order.source || "Origen no indicado"}</p><span className={"mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold " + statusTone(order.status)}>{statusLabel(order.status)}</span></div><div className="flex flex-col gap-2 sm:w-56"><select value={order.status} onChange={(e) => updateStatus(order, e.target.value as ClothingStatus)} className={field}>{statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select><button onClick={() => startEditOrder(order)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/5">Editar pedido</button></div></div>
            <div className="mt-3 space-y-1">{order.items.map((item) => <p key={item.id} className="text-sm text-white/70">{item.productName} · {item.size || "Sin talle"} · ×{item.quantity}</p>)}</div>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/[0.07] pt-3 text-xs sm:grid-cols-4"><div><p className="text-white/40">Venta</p><p className="mt-1 font-bold">{money(sales(order))}</p></div><div><p className="text-white/40">Cobrado</p><p className="mt-1 font-bold">{money(order.receivedAmount)}</p></div><div><p className="text-white/40">Costos totales</p><p className="mt-1 font-bold">{money(cost(order))}</p></div><div><p className="text-white/40">Ganancia estimada</p><p className="mt-1 font-bold">{money(sales(order) - cost(order))}</p></div></div>
            <div className="mt-3 flex flex-col gap-2 border-t border-white/[0.07] pt-3 sm:flex-row sm:items-end">
              <Field label="Actualizar dinero recibido ($)"><input type="number" min="0" value={paymentValues[order.id] ?? order.receivedAmount} onChange={(e) => setPaymentValues((old) => ({ ...old, [order.id]: Number(e.target.value) }))} className={field} /></Field>
              <button onClick={() => savePayment(order)} disabled={saving} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-white/75 hover:bg-white/5 disabled:opacity-50">Guardar cobro</button>
            </div>
          </article>)}
          {!orders.length && <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">No hay pedidos para mostrar.</p>}
        </section>}

        {tab === "stock" && <section className="space-y-4">
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/55">El stock se descuenta cuando el pedido sale del depósito (Despachado, Volviendo o Finalizado). Los pedidos recibidos, pagados o en preparación no se cuentan como vendidos. Las entradas, salidas y ajustes manuales quedan registrados en el historial. No registres una salida manual por una venta que ya marcaste como despachada: esa unidad ya se descuenta automáticamente.</p>
          <form onSubmit={createStockMovement} className="grid gap-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.04] p-4 sm:grid-cols-2 xl:grid-cols-5">
            <Field label="Prenda"><select value={movementDraft.category} onChange={(e) => setMovementDraft({ ...movementDraft, category: e.target.value as ClothingCategory })} className={field}>{categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></Field>
            <Field label="Talle"><select value={movementDraft.size} onChange={(e) => setMovementDraft({ ...movementDraft, size: e.target.value as ClothingSize })} className={field}>{sizeOptions.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}</select></Field>
            <Field label="Movimiento"><select value={movementDraft.type} onChange={(e) => setMovementDraft({ ...movementDraft, type: e.target.value as "IN" | "OUT" | "ADJUSTMENT" })} className={field}><option value="IN">Ingreso</option><option value="OUT">Salida manual</option><option value="ADJUSTMENT">Ajuste (+/-)</option></select></Field>
            <Field label={movementDraft.type === "ADJUSTMENT" ? "Cantidad (+/-)" : "Cantidad"}><input type="number" step="1" value={movementDraft.quantity} onChange={(e) => setMovementDraft({ ...movementDraft, quantity: Number(e.target.value) })} className={field} /></Field>
            <div className="flex items-end"><button disabled={saving} className="w-full rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold text-black disabled:opacity-50">Registrar movimiento</button></div>
            <div className="sm:col-span-2 xl:col-span-5"><Field label="Observación"><input value={movementDraft.notes} onChange={(e) => setMovementDraft({ ...movementDraft, notes: e.target.value })} className={field} placeholder="Ej.: ingreso de 10 remeras talle M" /></Field></div>
          </form>
          {categoryOptions.map((category) => <div key={category.value} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><h2 className="mb-3 font-bold">{category.label}</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{data.stock.filter((row) => row.category === category.value).map((row) => {
            const key = row.category + ":" + row.size;
            const value = stockValues[key] || { initialQty: row.initialQty, restockedQty: row.restockedQty };
            return <div key={key} className="rounded-xl border border-white/[0.08] bg-black/25 p-3"><div className="flex items-center justify-between"><b>{sizeOptions.find((s) => s.value === row.size)?.label || row.size}</b><span className={row.available < 0 ? "text-red-300" : row.available === 0 ? "text-yellow-200" : "text-emerald-300"}>{row.available < 0 ? `${row.available} · faltante` : row.available === 0 ? "Sin stock" : `${row.available} disponibles`}</span></div><div className="mt-3 grid grid-cols-2 gap-2"><Field label="Stock inicial"><input type="number" min="0" value={value.initialQty} onChange={(e) => setStockValues((old) => ({ ...old, [key]: { ...value, initialQty: Number(e.target.value) } }))} className={field} /></Field><div><span className="text-xs font-medium text-white/55">Reposiciones históricas</span><div className="mt-1 rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white/65">{row.restockedQty}</div></div></div><div className="mt-3 flex items-center justify-between"><span className="text-xs text-white/40">{row.sold} despachados · {row.movementNet >= 0 ? "+" : ""}{row.movementNet} movimientos</span><button onClick={() => saveStock(row.category, row.size)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70">Guardar</button></div></div>;
          })}</div></div>)}
          {data.movements.length > 0 && <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><h2 className="mb-3 font-bold">Últimos movimientos</h2><div className="space-y-2">{data.movements.map((movement) => <div key={movement.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2 text-xs"><div><b>{categoryOptions.find((c) => c.value === movement.category)?.label} · {sizeOptions.find((s) => s.value === movement.size)?.label || movement.size}</b><p className="mt-1 text-white/40">{movement.notes || "Sin observaciones"} · {new Date(movement.createdAt).toLocaleDateString("es-AR")}</p></div><span className={movement.type === "OUT" || (movement.type === "ADJUSTMENT" && movement.quantity < 0) ? "text-red-300" : "text-emerald-300"}>{movement.type === "IN" ? "+" : movement.type === "OUT" ? "−" : movement.quantity > 0 ? "+" : "−"}{Math.abs(movement.quantity)}</span></div>)}</div></div>}
        </section>}

        {tab === "products" && <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><h2 className="mb-3 font-bold">Catálogo</h2><div className="space-y-2">{data.products.map((product) => <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-black/25 p-3"><div><p className="text-sm font-semibold">{product.name}</p><p className="mt-1 text-xs text-white/45">{categoryOptions.find((c) => c.value === product.category)?.label} · {product.trackStock ? "Control de stock" : "Sin stock"} · {product.active ? "Activo" : "Desactivado"}</p><p className="mt-1 text-xs text-white/45">Precio {money(product.defaultUnitPrice)} · DTF {money(product.defaultUnitDtfCost)} · Prenda {money(product.defaultUnitGarmentCost)}</p></div><div className="flex gap-2"><button type="button" onClick={() => startEditProduct(product)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70">Editar</button><button type="button" onClick={() => toggleProduct(product)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70">{product.active ? "Desactivar" : "Activar"}</button></div></div>)}</div></div>
          <form onSubmit={saveProduct} className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-4"><h2 className="font-bold">{editingProductId ? "Editar producto" : "Agregar producto"}</h2><div className="mt-3 space-y-3"><Field label="Nombre"><input required value={productDraft.name} onChange={(e) => setProductDraft({ ...productDraft, name: e.target.value })} className={field} /></Field><Field label="Categoría"><select value={productDraft.category} onChange={(e) => setProductDraft({ ...productDraft, category: e.target.value as ClothingCategory })} className={field}>{categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></Field><Field label="Precio unitario"><input type="number" min="0" step="0.01" value={productDraft.defaultUnitPrice} onChange={(e) => setProductDraft({ ...productDraft, defaultUnitPrice: Number(e.target.value) })} className={field} /></Field><Field label="Costo DTF predeterminado (por unidad)"><input type="number" min="0" step="0.01" value={productDraft.defaultUnitDtfCost} onChange={(e) => setProductDraft({ ...productDraft, defaultUnitDtfCost: Number(e.target.value) })} className={field} /></Field><Field label="Costo de prenda predeterminado (por unidad)"><input type="number" min="0" step="0.01" value={productDraft.defaultUnitGarmentCost} onChange={(e) => setProductDraft({ ...productDraft, defaultUnitGarmentCost: Number(e.target.value) })} className={field} /></Field><label className="flex items-center gap-2 text-xs text-white/55"><input type="checkbox" checked={productDraft.trackStock} onChange={(e) => setProductDraft({ ...productDraft, trackStock: e.target.checked })} />Controlar stock</label><div className="flex gap-2"><button disabled={saving} className="flex-1 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold text-black disabled:opacity-50">{saving ? "Guardando..." : editingProductId ? "Guardar cambios" : "Agregar"}</button>{editingProductId && <button type="button" onClick={() => { setEditingProductId(null); setProductDraft({ name: "", category: "TSHIRT", trackStock: true, defaultUnitPrice: 0, defaultUnitDtfCost: 0, defaultUnitGarmentCost: 0 }); }} className="rounded-xl border border-white/10 px-3 py-3 text-xs text-white/70">Cancelar</button>}</div></div></form>
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
