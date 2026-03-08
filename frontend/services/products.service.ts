import { apiFetch } from "@/lib/api"

export type ResourceType = "LINK" | "FILE"

export type Product = {
  id: string
  title: string
  description?: string | null
  coverImageUrl?: string | null
  usdPrice: number
  arPrice?: number | null
  isSubscription: boolean
  requiresPremium: boolean
  isActive: boolean
  resourceType: "LINK" | "FILE"
  createdAt: string
}

export type CreateProductDto = Partial<Product> & {
  resourceUrl?: string | null
}

export type UpdateProductDto = Partial<CreateProductDto>

export const productsService = {
  async getAll(): Promise<{ products: Product[] }> {
    const data = await apiFetch(`/products`)
    console.log(data)
    return data
  },
  async getById(id: number): Promise<Product> {
    return apiFetch(`/products/${id}`)
  },
  async getAccess(id: number): Promise<{ resourceUrl: string }> {
    return apiFetch(`/products/${id}/access`)
  },
  async create(dto: CreateProductDto) {
    return apiFetch(`/products`, { method: "POST", body: JSON.stringify(dto) })
  },
  async update(id: number, dto: UpdateProductDto) {
    return apiFetch(`/products/${id}`, { method: "PUT", body: JSON.stringify(dto) })
  },
  async remove(id: number) {
    return apiFetch(`/products/${id}`, { method: "DELETE" })
  },
}
