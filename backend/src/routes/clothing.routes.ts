import { Router } from "express";
import { ClothingCategory, ClothingOrderStatus, ClothingSize } from "@prisma/client";
import { prisma } from "../prisma/client";
import { authRequired } from "../common/middlewares/authRequired";
import { clothingOwnerOnly } from "../common/middlewares/clothingOwnerOnly";
import { asyncHandler } from "../common/utils/asyncHandler";
import { ApiError } from "../common/errors/ApiError";

export const clothingRoutes = Router();
const categories = Object.values(ClothingCategory);
const sizes = Object.values(ClothingSize);
const statuses = Object.values(ClothingOrderStatus);
const includeItems = { items: { orderBy: { createdAt: "asc" as const } } };

const defaults = [
  ['Remera "POR MALVINAS"', ClothingCategory.TSHIRT, true, 3000, 6800],
  ['Remera "ETERNO 10"', ClothingCategory.TSHIRT, true, 3000, 6800],
  ['Remera "Huella Argentina"', ClothingCategory.TSHIRT, true, 3000, 6800],
  ['Buzo "Malvinas Argentinas"', ClothingCategory.HOODIE, true, 3000, 25500],
  ['Remera "Costumbres Argentinas" Mujer', ClothingCategory.TSHIRT, true, 3000, 6800],
  ['Remera "Malvinas Argentinas"', ClothingCategory.TSHIRT, true, 3000, 6800],
  ['Buzo "Malvinas Argentinas Doble estampa"', ClothingCategory.HOODIE, true, 3000, 25500],
  ['Remera "Tiro Berreta"', ClothingCategory.TSHIRT, true, 3000, 6800],
  ['Remera "Uno contra la Flota"', ClothingCategory.TSHIRT, true, 3000, 6800],
  ['Remera "EXOCET"', ClothingCategory.TSHIRT, true, 3000, 6800],
  ["Pablo Carballo (Grande)", ClothingCategory.OTHER, true, 0, 0],
  ["Pablo Carballo (Chica)", ClothingCategory.OTHER, true, 0, 0],
  ["P1 Chomba", ClothingCategory.CHOMBA, true, 0, 0],
  ["PDF Cursos", ClothingCategory.OTHER, false, 0, 0],
  ["PDF Resumen", ClothingCategory.OTHER, false, 0, 0],
] as const;

function valid<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === "string" && options.includes(value as T);
}

function amount(value: unknown, label: string) {
  if (value === undefined || value === null || value === "") return 0;
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 0) throw new ApiError(400, label + " debe ser un entero no negativo.");
  return n;
}

function dateValue(value: unknown, label: string): Date | null {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) throw new ApiError(400, label + " no es válida.");
  return date;
}

async function ensureProducts() {
  await prisma.clothingProduct.createMany({
    data: defaults.map(([name, category, trackStock, dtf, garment]) => ({
      name, category, trackStock, defaultUnitPrice: 0,
      defaultUnitDtfCost: dtf, defaultUnitGarmentCost: garment,
    })),
    skipDuplicates: true,
  });
}

async function stockSnapshot() {
  const [rows, orders] = await Promise.all([
    prisma.clothingStock.findMany(),
    prisma.clothingOrder.findMany({
      where: { status: { not: ClothingOrderStatus.CANCELLED } },
      include: { items: true },
    }),
  ]);
  const saved = new Map(rows.map((row) => [row.category + ":" + row.size, row]));
  const sold = new Map<string, number>();
  for (const order of orders) for (const item of order.items) {
    if (!item.trackStock || !item.size) continue;
    const key = item.category + ":" + item.size;
    sold.set(key, (sold.get(key) || 0) + item.quantity);
  }
  return categories.flatMap((category) => sizes.map((size) => {
    const key = category + ":" + size;
    const row = saved.get(key);
    const quantitySold = sold.get(key) || 0;
    const initialQty = row?.initialQty || 0;
    const restockedQty = row?.restockedQty || 0;
    return { category, size, initialQty, restockedQty, sold: quantitySold,
      available: initialQty + restockedQty - quantitySold, notes: row?.notes || "" };
  }));
}

clothingRoutes.use((_req, res, next) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("Cache-Control", "private, no-store");
  next();
});

clothingRoutes.get("/access", authRequired, clothingOwnerOnly, (_req, res) => {
  res.json({ authorized: true });
});
clothingRoutes.use(authRequired, clothingOwnerOnly);

clothingRoutes.get("/", asyncHandler(async (_req, res) => {
  await ensureProducts();
  const [orders, products, stock] = await Promise.all([
    prisma.clothingOrder.findMany({
      orderBy: [{ orderDate: "desc" }, { createdAt: "desc" }],
      include: includeItems, take: 500,
    }),
    prisma.clothingProduct.findMany({ where: { active: true }, orderBy: [{ category: "asc" }, { name: "asc" }] }),
    stockSnapshot(),
  ]);
  const active = orders.filter((o) => o.status !== ClothingOrderStatus.CANCELLED);
  const received = active.reduce((sum, o) => sum + o.receivedAmount, 0);
  const itemCosts = active.reduce((sum, o) => sum + o.items.reduce(
    (s, i) => s + i.quantity * (i.unitDtfCost + i.unitGarmentCost), 0), 0);
  const extraExpenses = active.reduce((sum, o) => sum + o.extraExpenses, 0);
  const totalCost = itemCosts + extraExpenses;
  const totalSales = active.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0), 0);
  const units = active.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const productMap = new Map<string, number>();
  const monthMap = new Map<string, number>();
  for (const order of active) {
    for (const item of order.items) productMap.set(item.productName, (productMap.get(item.productName) || 0) + item.quantity);
    const month = order.orderDate.toISOString().slice(0, 7);
    const cost = order.extraExpenses + order.items.reduce((s, i) => s + i.quantity * (i.unitDtfCost + i.unitGarmentCost), 0);
    monthMap.set(month, (monthMap.get(month) || 0) + order.receivedAmount - cost);
  }
  res.json({
    orders, products, stock,
    stats: {
      orders: active.length, units, totalSales, receivedAmount: received,
      totalCost, profit: received - totalCost,
      pending: active.filter((o) => ![ClothingOrderStatus.FINISHED, ClothingOrderStatus.DISPATCHED].includes(o.status)).length,
    },
    productSales: Array.from(productMap, ([name, quantity]) => ({ name, quantity })).sort((a, b) => b.quantity - a.quantity),
    monthlyProfit: Array.from(monthMap, ([month, profit]) => ({ month, profit })).sort((a, b) => a.month.localeCompare(b.month)),
  });
}));

clothingRoutes.post("/orders", asyncHandler(async (req, res) => {
  const body = req.body || {};
  const clientName = typeof body.clientName === "string" ? body.clientName.trim() : "";
  if (!clientName) throw new ApiError(400, "Ingresá el nombre del cliente.");
  if (!Array.isArray(body.items) || body.items.length === 0) throw new ApiError(400, "Agregá al menos un producto.");
  const status = body.status || ClothingOrderStatus.ORDER_RECEIVED;
  if (!valid(status, statuses)) throw new ApiError(400, "El estado no es válido.");

  const items = body.items.map((item: any) => {
    if (!item || typeof item.productName !== "string" || !item.productName.trim()) throw new ApiError(400, "Cada ítem debe tener un producto.");
    if (!valid(item.category, categories)) throw new ApiError(400, "La categoría no es válida.");
    if (item.size && !valid(item.size, sizes)) throw new ApiError(400, "El talle no es válido.");
    const quantity = Number(item.quantity);
    if (!Number.isSafeInteger(quantity) || quantity < 1) throw new ApiError(400, "La cantidad debe ser al menos 1.");
    return {
      productId: typeof item.productId === "string" && item.productId ? item.productId : null,
      productName: item.productName.trim().slice(0, 200), category: item.category,
      size: item.size || null, quantity,
      unitPrice: amount(item.unitPrice, "El precio"),
      unitDtfCost: amount(item.unitDtfCost, "El costo DTF"),
      unitGarmentCost: amount(item.unitGarmentCost, "El costo de la prenda"),
      trackStock: item.trackStock !== false,
    };
  });

  const order = await prisma.clothingOrder.create({
    data: {
      clientName: clientName.slice(0, 180),
      source: typeof body.source === "string" ? body.source.trim().slice(0, 80) : "",
      status, receivedAmount: amount(body.receivedAmount, "El importe recibido"),
      extraExpenses: amount(body.extraExpenses, "Los gastos adicionales"),
      orderDate: dateValue(body.orderDate, "La fecha de ingreso") || new Date(),
      expectedDate: dateValue(body.expectedDate, "La fecha estimada"),
      notes: typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) : null,
      items: { create: items },
    },
    include: includeItems,
  });
  res.status(201).json({ order });
}));

clothingRoutes.patch("/orders/:id", asyncHandler(async (req, res) => {
  const body = req.body || {};
  const data: any = {};
  if (body.status !== undefined) {
    if (!valid(body.status, statuses)) throw new ApiError(400, "El estado no es válido.");
    data.status = body.status;
    if (body.status === ClothingOrderStatus.FINISHED) data.deliveredAt = new Date();
    if (body.status === ClothingOrderStatus.CANCELLED) data.deliveredAt = null;
  }
  if (body.receivedAmount !== undefined) data.receivedAmount = amount(body.receivedAmount, "El importe recibido");
  if (body.extraExpenses !== undefined) data.extraExpenses = amount(body.extraExpenses, "Los gastos adicionales");
  if (body.notes !== undefined) data.notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) : null;
  if (body.expectedDate !== undefined) data.expectedDate = dateValue(body.expectedDate, "La fecha estimada");
  if (!Object.keys(data).length) throw new ApiError(400, "No hay cambios para guardar.");
  const order = await prisma.clothingOrder.update({ where: { id: req.params.id }, data, include: includeItems });
  res.json({ order });
}));

clothingRoutes.patch("/stock", asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (!valid(body.category, categories) || !valid(body.size, sizes)) throw new ApiError(400, "La categoría o el talle no son válidos.");
  const initialQty = amount(body.initialQty, "El stock inicial");
  const restockedQty = amount(body.restockedQty, "Las reposiciones");
  const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 500) : null;
  const stock = await prisma.clothingStock.upsert({
    where: { category_size: { category: body.category, size: body.size } },
    create: { category: body.category, size: body.size, initialQty, restockedQty, notes },
    update: { initialQty, restockedQty, notes },
  });
  res.json({ stock });
}));

clothingRoutes.post("/products", asyncHandler(async (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) throw new ApiError(400, "Ingresá el nombre del producto.");
  if (!valid(body.category, categories)) throw new ApiError(400, "La categoría no es válida.");
  const product = await prisma.clothingProduct.create({
    data: {
      name: name.slice(0, 200), category: body.category, trackStock: body.trackStock !== false,
      defaultUnitPrice: amount(body.defaultUnitPrice, "El precio"),
      defaultUnitDtfCost: amount(body.defaultUnitDtfCost, "El costo DTF"),
      defaultUnitGarmentCost: amount(body.defaultUnitGarmentCost, "El costo de la prenda"),
    },
  });
  res.status(201).json({ product });
}));

