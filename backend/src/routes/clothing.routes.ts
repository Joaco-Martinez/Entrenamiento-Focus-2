import { Router } from "express";
import {
  ClothingCategory,
  ClothingOrderStatus,
  ClothingSize,
  ClothingStockMovementType,
} from "@prisma/client";
import { prisma } from "../prisma/client";
import { authRequired } from "../common/middlewares/authRequired";
import { clothingOwnerOnly } from "../common/middlewares/clothingOwnerOnly";
import { asyncHandler } from "../common/utils/asyncHandler";
import { ApiError } from "../common/errors/ApiError";

export const clothingRoutes = Router();

const categories = Object.values(ClothingCategory);
const sizes = Object.values(ClothingSize);
const statuses = Object.values(ClothingOrderStatus);
const movementTypes = Object.values(ClothingStockMovementType);
const soldStatuses = [ClothingOrderStatus.DISPATCHED, ClothingOrderStatus.FINISHED];
const includeItems = { items: { orderBy: { createdAt: "asc" as const } } };

const defaults = [
  ['Remera "POR MALVINAS"', ClothingCategory.TSHIRT, true],
  ['Remera "ETERNO 10"', ClothingCategory.TSHIRT, true],
  ['Remera "Huella Argentina"', ClothingCategory.TSHIRT, true],
  ['Buzo "Malvinas Argentinas"', ClothingCategory.HOODIE, true],
  ['Remera "Costumbres Argentinas" Mujer', ClothingCategory.TSHIRT, true],
  ['Remera "Malvinas Argentinas"', ClothingCategory.TSHIRT, true],
  ['Buzo "Malvinas Argentinas Doble estampa"', ClothingCategory.HOODIE, true],
  ['Remera "Tiro Berreta"', ClothingCategory.TSHIRT, true],
  ['Remera "Uno contra la Flota"', ClothingCategory.TSHIRT, true],
  ['Remera "EXOCET"', ClothingCategory.TSHIRT, true],
  ["Pablo Carballo (Grande)", ClothingCategory.OTHER, true],
  ["Pablo Carballo (Chica)", ClothingCategory.OTHER, true],
  ["P1 Chomba", ClothingCategory.CHOMBA, true],
  ["PDF Cursos", ClothingCategory.OTHER, false],
  ["PDF Resumen", ClothingCategory.OTHER, false],
] as const;

function valid<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === "string" && options.includes(value as T);
}

function amount(value: unknown, label: string): number {
  if (value === undefined || value === null || value === "") return 0;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 999999999999.99) {
    throw new ApiError(400, label + " debe ser un importe válido.");
  }
  const rounded = Math.round((n + Number.EPSILON) * 100) / 100;
  if (Math.abs(n - rounded) > 0.000001) {
    throw new ApiError(400, label + " admite hasta dos decimales.");
  }
  return rounded;
}

function integerQuantity(value: unknown, label: string, allowNegative = false): number {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n === 0 || (!allowNegative && n < 0)) {
    throw new ApiError(400, label + (allowNegative ? " debe ser un entero distinto de cero." : " debe ser un entero positivo."));
  }
  return n;
}

function dateValue(value: unknown, label: string): Date | null {
  if (value === undefined) return null;
  if (value === null || value === "") return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) throw new ApiError(400, label + " no es válida.");
  return date;
}

function serializeProduct(product: any) {
  return {
    ...product,
    defaultUnitPrice: Number(product.defaultUnitPrice || 0),
    defaultUnitDtfCost: Number(product.defaultUnitDtfCost || 0),
    defaultUnitGarmentCost: Number(product.defaultUnitGarmentCost || 0),
  };
}

function serializeOrder(order: any) {
  return {
    ...order,
    receivedAmount: Number(order.receivedAmount || 0),
    extraExpenses: Number(order.extraExpenses || 0),
    items: (order.items || []).map((item: any) => ({
      ...item,
      unitPrice: Number(item.unitPrice || 0),
      unitDtfCost: Number(item.unitDtfCost || 0),
      unitGarmentCost: Number(item.unitGarmentCost || 0),
    })),
  };
}

function normalizeItems(rawItems: unknown) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new ApiError(400, "Agregá al menos un producto al pedido.");
  }
  return rawItems.map((item: any) => {
    if (!item || typeof item.productName !== "string" || !item.productName.trim()) {
      throw new ApiError(400, "Cada artículo debe tener un producto.");
    }
    if (!valid(item.category, categories)) throw new ApiError(400, "La categoría no es válida.");
    if (item.size && !valid(item.size, sizes)) throw new ApiError(400, "El talle no es válido.");
    const quantity = Number(item.quantity);
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      throw new ApiError(400, "La cantidad debe ser un entero mayor a cero.");
    }
    return {
      productId: typeof item.productId === "string" && item.productId ? item.productId : null,
      productName: item.productName.trim().slice(0, 200),
      category: item.category,
      size: item.size || null,
      quantity,
      unitPrice: amount(item.unitPrice, "El precio unitario"),
      unitDtfCost: amount(item.unitDtfCost, "El costo DTF"),
      unitGarmentCost: amount(item.unitGarmentCost, "El costo de la prenda"),
      trackStock: item.trackStock !== false,
    };
  });
}

async function ensureProducts() {
  // Los productos históricos se crean sin precios ni costos supuestos.
  // Los importes se completan desde el catálogo o al cargar cada pedido.
  await prisma.clothingProduct.createMany({
    data: defaults.map(([name, category, trackStock]) => ({
      name,
      category,
      trackStock,
      defaultUnitPrice: 0,
      defaultUnitDtfCost: 0,
      defaultUnitGarmentCost: 0,
    })),
    skipDuplicates: true,
  });
}

async function stockSnapshot() {
  const [rows, orders, allMovements, recentMovements] = await Promise.all([
    prisma.clothingStock.findMany(),
    prisma.clothingOrder.findMany({
      where: { status: { not: ClothingOrderStatus.CANCELLED } },
      include: { items: true },
    }),
    prisma.clothingStockMovement.findMany(),
    prisma.clothingStockMovement.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  const saved = new Map(rows.map((row) => [row.category + ":" + row.size, row]));
  const sold = new Map<string, number>();
  const movementNet = new Map<string, number>();

  // Un pedido solo descuenta unidades cuando se despacha o se finaliza.
  // PAYMENT_RECEIVED, ORDER_RECEIVED y estados intermedios no consumen stock.
  for (const order of orders) {
    if (!soldStatuses.includes(order.status)) continue;
    for (const item of order.items) {
      if (!item.trackStock || !item.size) continue;
      const key = item.category + ":" + item.size;
      sold.set(key, (sold.get(key) || 0) + item.quantity);
    }
  }

  for (const movement of allMovements) {
    const key = movement.category + ":" + movement.size;
    const delta =
      movement.type === ClothingStockMovementType.IN
        ? movement.quantity
        : movement.type === ClothingStockMovementType.OUT
        ? -movement.quantity
        : movement.quantity;
    movementNet.set(key, (movementNet.get(key) || 0) + delta);
  }

  return {
    rows: categories.flatMap((category) =>
      sizes.map((size) => {
        const key = category + ":" + size;
        const row = saved.get(key);
        const quantitySold = sold.get(key) || 0;
        const initialQty = row?.initialQty || 0;
        const restockedQty = row?.restockedQty || 0;
        const manualMovements = movementNet.get(key) || 0;
        return {
          category,
          size,
          initialQty,
          restockedQty,
          movementNet: manualMovements,
          sold: quantitySold,
          available: initialQty + restockedQty + manualMovements - quantitySold,
          notes: row?.notes || "",
        };
      })
    ),
    movements: recentMovements,
  };
}

clothingRoutes.use((_req, res, next) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Pragma", "no-cache");
  next();
});

clothingRoutes.get("/access", authRequired, clothingOwnerOnly, (_req, res) => {
  res.json({ authorized: true });
});

clothingRoutes.use(authRequired, clothingOwnerOnly);

clothingRoutes.get("/", asyncHandler(async (_req, res) => {
  await ensureProducts();
  const [ordersRaw, productsRaw, stockResult] = await Promise.all([
    prisma.clothingOrder.findMany({
      orderBy: [{ orderDate: "desc" }, { createdAt: "desc" }],
      include: includeItems,
    }),
    prisma.clothingProduct.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    stockSnapshot(),
  ]);

  const orders = ordersRaw.map(serializeOrder);
  const products = productsRaw.map(serializeProduct);
  const activeOrders = orders.filter((order) => order.status !== ClothingOrderStatus.CANCELLED);
  const soldOrders = activeOrders.filter((order) => soldStatuses.includes(order.status));

  const salesForOrder = (order: any) =>
    order.items.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0);
  const costsForOrder = (order: any) =>
    order.extraExpenses + order.items.reduce(
      (sum: number, item: any) =>
        sum + item.quantity * (item.unitDtfCost + item.unitGarmentCost),
      0
    );

  const receivedAmount = activeOrders.reduce((sum, order) => sum + order.receivedAmount, 0);
  const totalSales = activeOrders.reduce((sum, order) => sum + salesForOrder(order), 0);
  const totalCost = activeOrders.reduce((sum, order) => sum + costsForOrder(order), 0);
  const unitsSold = soldOrders.reduce(
    (sum, order) => sum + order.items.reduce((items: number, item: any) => items + item.quantity, 0),
    0
  );

  const productMap = new Map<string, number>();
  const monthMap = new Map<string, number>();
  for (const order of activeOrders) {
    const month = new Date(order.orderDate).toISOString().slice(0, 7);
    monthMap.set(month, (monthMap.get(month) || 0) + salesForOrder(order) - costsForOrder(order));
  }
  for (const order of soldOrders) {
    for (const item of order.items) {
      productMap.set(item.productName, (productMap.get(item.productName) || 0) + item.quantity);
    }
  }

  res.json({
    orders,
    products,
    stock: stockResult.rows,
    movements: stockResult.movements,
    stats: {
      orders: activeOrders.length,
      units: unitsSold,
      totalSales,
      receivedAmount,
      totalCost,
      profit: totalSales - totalCost,
      balanceDue: totalSales - receivedAmount,
      pending: activeOrders.filter(
        (order) => !soldStatuses.includes(order.status)
      ).length,
    },
    productSales: Array.from(productMap, ([name, quantity]) => ({ name, quantity })).sort(
      (a, b) => b.quantity - a.quantity
    ),
    monthlyProfit: Array.from(monthMap, ([month, profit]) => ({ month, profit })).sort(
      (a, b) => a.month.localeCompare(b.month)
    ),
  });
}));

clothingRoutes.post("/orders", asyncHandler(async (req, res) => {
  const body = req.body || {};
  const clientName = typeof body.clientName === "string" ? body.clientName.trim() : "";
  if (!clientName) throw new ApiError(400, "Ingresá el nombre del cliente.");
  if (!valid(body.status || ClothingOrderStatus.ORDER_RECEIVED, statuses)) {
    throw new ApiError(400, "El estado no es válido.");
  }

  const items = normalizeItems(body.items);
  const productIds = items.map((item) => item.productId).filter(Boolean) as string[];
  if (productIds.length) {
    const found = await prisma.clothingProduct.findMany({
      where: { id: { in: productIds }, active: true },
      select: { id: true },
    });
    if (found.length !== new Set(productIds).size) {
      throw new ApiError(400, "Uno de los productos no existe o está desactivado.");
    }
  }

  const order = await prisma.clothingOrder.create({
    data: {
      clientName: clientName.slice(0, 180),
      source: typeof body.source === "string" ? body.source.trim().slice(0, 80) : "",
      status: body.status || ClothingOrderStatus.ORDER_RECEIVED,
      receivedAmount: amount(body.receivedAmount, "El importe recibido"),
      extraExpenses: amount(body.extraExpenses, "Los gastos adicionales"),
      orderDate: dateValue(body.orderDate, "La fecha del pedido") || new Date(),
      expectedDate: dateValue(body.expectedDate, "La fecha estimada"),
      notes: typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) : null,
      items: { create: items },
    },
    include: includeItems,
  });
  res.status(201).json({ order: serializeOrder(order) });
}));

clothingRoutes.patch("/orders/:id", asyncHandler(async (req, res) => {
  const body = req.body || {};
  const existing = await prisma.clothingOrder.findUnique({
    where: { id: req.params.id },
    include: { items: true },
  });
  if (!existing) throw new ApiError(404, "No se encontró el pedido.");

  const data: any = {};
  if (body.clientName !== undefined) {
    if (typeof body.clientName !== "string" || !body.clientName.trim()) {
      throw new ApiError(400, "Ingresá el nombre del cliente.");
    }
    data.clientName = body.clientName.trim().slice(0, 180);
  }
  if (body.source !== undefined) {
    if (typeof body.source !== "string") throw new ApiError(400, "El canal no es válido.");
    data.source = body.source.trim().slice(0, 80);
  }
  if (body.orderDate !== undefined) {
    data.orderDate = dateValue(body.orderDate, "La fecha del pedido");
    if (!data.orderDate) throw new ApiError(400, "La fecha del pedido es obligatoria.");
  }
  if (body.status !== undefined) {
    if (!valid(body.status, statuses)) throw new ApiError(400, "El estado no es válido.");
    data.status = body.status;
    if (body.status === ClothingOrderStatus.FINISHED) data.deliveredAt = new Date();
    if (body.status === ClothingOrderStatus.CANCELLED) data.deliveredAt = null;
  }
  if (body.receivedAmount !== undefined) {
    data.receivedAmount = amount(body.receivedAmount, "El importe recibido");
  }
  if (body.extraExpenses !== undefined) {
    data.extraExpenses = amount(body.extraExpenses, "Los gastos adicionales");
  }
  if (body.notes !== undefined) {
    data.notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) : null;
  }
  if (body.expectedDate !== undefined) {
    data.expectedDate = dateValue(body.expectedDate, "La fecha estimada");
  }

  const hasItems = body.items !== undefined;
  const nextStatus = data.status || existing.status;
  if (soldStatuses.includes(existing.status) && !soldStatuses.includes(nextStatus)) {
    throw new ApiError(409, "Un pedido despachado o finalizado no puede volver a un estado anterior. Si hubo una devolución, registrá el ingreso correspondiente en el stock.");
  }
  if (hasItems && soldStatuses.includes(nextStatus)) {
    throw new ApiError(
      409,
      "Para modificar las prendas de un pedido despachado o finalizado, primero corregí su estado y revisá el stock."
    );
  }

  if (!Object.keys(data).length && !hasItems) {
    throw new ApiError(400, "No hay cambios para guardar.");
  }

  let order: any;
  if (hasItems) {
    const items = normalizeItems(body.items);
    const productIds = items.map((item) => item.productId).filter(Boolean) as string[];
    if (productIds.length) {
      const found = await prisma.clothingProduct.findMany({
        where: { id: { in: productIds } },
        select: { id: true },
      });
      if (found.length !== new Set(productIds).size) {
        throw new ApiError(400, "Uno de los productos no existe.");
      }
    }
    order = await prisma.$transaction(async (tx) => {
      await tx.clothingOrderItem.deleteMany({ where: { orderId: req.params.id } });
      return tx.clothingOrder.update({
        where: { id: req.params.id },
        data: { ...data, items: { create: items } },
        include: includeItems,
      });
    });
  } else {
    order = await prisma.clothingOrder.update({
      where: { id: req.params.id },
      data,
      include: includeItems,
    });
  }

  res.json({ order: serializeOrder(order) });
}));

clothingRoutes.patch("/stock", asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (!valid(body.category, categories) || !valid(body.size, sizes)) {
    throw new ApiError(400, "La categoría o el talle no son válidos.");
  }
  const initialQty = Number(body.initialQty);
  const restockedQty = Number(body.restockedQty);
  if (!Number.isSafeInteger(initialQty) || initialQty < 0 ||
      !Number.isSafeInteger(restockedQty) || restockedQty < 0) {
    throw new ApiError(400, "El stock debe ser un número entero no negativo.");
  }
  const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 500) : null;
  const stock = await prisma.clothingStock.upsert({
    where: { category_size: { category: body.category, size: body.size } },
    create: { category: body.category, size: body.size, initialQty, restockedQty, notes },
    update: { initialQty, restockedQty, notes },
  });
  res.json({ stock });
}));

clothingRoutes.post("/stock/movements", asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (!valid(body.category, categories) || !valid(body.size, sizes)) {
    throw new ApiError(400, "La categoría o el talle no son válidos.");
  }
  if (!valid(body.type, movementTypes)) throw new ApiError(400, "El tipo de movimiento no es válido.");
  const quantity = integerQuantity(
    body.quantity,
    "La cantidad",
    body.type === ClothingStockMovementType.ADJUSTMENT
  );
  if (body.type === ClothingStockMovementType.ADJUSTMENT && quantity < 0) {
    // A negative adjustment is allowed to record a verified stock shortage.
  }
  const movement = await prisma.clothingStockMovement.create({
    data: {
      category: body.category,
      size: body.size,
      type: body.type,
      quantity,
      notes: typeof body.notes === "string" ? body.notes.trim().slice(0, 500) : null,
    },
  });
  res.status(201).json({ movement });
}));

clothingRoutes.post("/products", asyncHandler(async (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) throw new ApiError(400, "Ingresá el nombre del producto.");
  if (!valid(body.category, categories)) throw new ApiError(400, "La categoría no es válida.");
  const product = await prisma.clothingProduct.create({
    data: {
      name: name.slice(0, 200),
      category: body.category,
      trackStock: body.trackStock !== false,
      active: true,
      defaultUnitPrice: amount(body.defaultUnitPrice, "El precio"),
      defaultUnitDtfCost: amount(body.defaultUnitDtfCost, "El costo DTF"),
      defaultUnitGarmentCost: amount(body.defaultUnitGarmentCost, "El costo de la prenda"),
    },
  });
  res.status(201).json({ product: serializeProduct(product) });
}));

clothingRoutes.patch("/products/:id", asyncHandler(async (req, res) => {
  const body = req.body || {};
  const data: any = {};
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) throw new ApiError(400, "Ingresá el nombre del producto.");
    data.name = body.name.trim().slice(0, 200);
  }
  if (body.category !== undefined) {
    if (!valid(body.category, categories)) throw new ApiError(400, "La categoría no es válida.");
    data.category = body.category;
  }
  if (body.trackStock !== undefined) {
    if (typeof body.trackStock !== "boolean") throw new ApiError(400, "La opción de stock no es válida.");
    data.trackStock = body.trackStock;
  }
  if (body.active !== undefined) {
    if (typeof body.active !== "boolean") throw new ApiError(400, "El estado del producto no es válido.");
    data.active = body.active;
  }
  if (body.defaultUnitPrice !== undefined) data.defaultUnitPrice = amount(body.defaultUnitPrice, "El precio");
  if (body.defaultUnitDtfCost !== undefined) data.defaultUnitDtfCost = amount(body.defaultUnitDtfCost, "El costo DTF");
  if (body.defaultUnitGarmentCost !== undefined) data.defaultUnitGarmentCost = amount(body.defaultUnitGarmentCost, "El costo de la prenda");
  if (!Object.keys(data).length) throw new ApiError(400, "No hay cambios para guardar.");
  const product = await prisma.clothingProduct.update({
    where: { id: req.params.id },
    data,
  });
  res.json({ product: serializeProduct(product) });
}));
