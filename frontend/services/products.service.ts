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
  /**
   * List public products. This endpoint hides the resourceUrl.
   */
  async getAll(): Promise<{ products: Product[] }> {
    const data = await apiFetch(`/products`);
    return data as { products: Product[] };
  },

  /**
   * List products for admin. Requires admin credentials.
   */
  async adminList(): Promise<{ products: Product[] }> {
    const data = await apiFetch(`/products/admin/products`);
    return data as { products: Product[] };
  },

  async getSubscriptionProducts() {
    return apiFetch("/products/subscriptions/options");
  },
  
  async getById(id: number | string): Promise<Product> {
    return apiFetch(`/products/${id}`);
  },

  async getAccess(id: number | string): Promise<{ resourceUrl: string }> {
    return apiFetch(`/products/${id}/access`);
  },

  /**
   * Create a new product (admin only).
   */
  async create(dto: CreateProductDto) {
    return apiFetch(`/products/admin/products`, { method: "POST", body: JSON.stringify(dto) });
  },

  /**
   * Update a product (admin only).
   */
  async update(id: number | string, dto: UpdateProductDto) {
    return apiFetch(`/products/admin/products/${id}`, { method: "PUT", body: JSON.stringify(dto) });
  },

  /**
   * Remove a product (admin only).
   */
  async remove(id: number | string) {
    return apiFetch(`/products/admin/products/${id}`, { method: "DELETE" });
  },
};
