// src/services/products.service.ts
import { apiClient } from "./apiClient"

export type ResourceType = "LINK" | "FILE"

export type Product = {
  id: number
  name: string
  description?: string

  // ✅ precios como los valida tu backend (según el error)
  // (los devuelvo como number | null por si alguno viene vacío)
  priceUsd: number
  priceArs: number | null

  isSubscription: boolean

  requiresPremium: boolean
  coverImageUrl: string | null
  resourceType: ResourceType
}

export type ProductsPaginatedResponse = {
  data: Product[]
  total: number
  page: number
  limit: number
  pages: number
}

export type CreateProductDto = {
  name: string
  description?: string

  // ✅ nombres correctos
  priceUsd: number
  priceArs?: number

  isSubscription?: boolean

  requiresPremium?: boolean
  coverImageUrl?: string
  resourceType?: ResourceType
  resourceUrl?: string // solo admin (no se devuelve en response)
}

export type UpdateProductDto = Partial<CreateProductDto>

export const productsService = {
  getAll: async (page = 1, limit = 10) => {
    return apiClient<ProductsPaginatedResponse>(`/products?page=${page}&limit=${limit}`, {
      method: "GET",
    })
  },

  getById: async (id: number | string) => {
    return apiClient<Product>(`/products/${id}`, {
      method: "GET",
    })
  },

  create: async (dto: CreateProductDto) => {
    const body: any = {
      ...dto,
      isSubscription: dto.isSubscription ?? false,
      requiresPremium: dto.requiresPremium ?? false,
      resourceType: dto.resourceType ?? "LINK",
    }

    // ✅ no mandar NaN / undefined “sucio”
    if (body.priceArs === undefined) delete body.priceArs
    if (body.coverImageUrl === undefined) delete body.coverImageUrl
    if (body.resourceUrl === undefined) delete body.resourceUrl
    if (body.description === undefined) delete body.description

    return apiClient<Product>("/products", {
      method: "POST",
      body,
    })
  },

  update: async (id: number | string, dto: UpdateProductDto) => {
    const body: any = { ...dto }

    // ✅ limpia opcionales (muy importante para class-validator)
    if (body.priceArs === undefined) delete body.priceArs
    if (body.coverImageUrl === undefined) delete body.coverImageUrl
    if (body.resourceUrl === undefined) delete body.resourceUrl
    if (body.description === undefined) delete body.description
    if (body.isSubscription === undefined) delete body.isSubscription
    if (body.requiresPremium === undefined) delete body.requiresPremium
    if (body.resourceType === undefined) delete body.resourceType
    if (body.priceUsd === undefined) delete body.priceUsd

    return apiClient<Product>(`/products/${id}`, {
      method: "PATCH",
      body,
    })
  },

  remove: async (id: number | string) => {
    return apiClient<{ message: string }>(`/products/${id}`, { method: "DELETE" })
  },

  // 🔐 endpoint especial para acceso al recurso
  getAccess: async (id: number | string) => {
    return apiClient<{
      allowed: boolean
      productId: number
      resourceType: ResourceType
      resourceUrl: string
    }>(`/products/${id}/access`, {
      method: "GET",
    })
  },
}
