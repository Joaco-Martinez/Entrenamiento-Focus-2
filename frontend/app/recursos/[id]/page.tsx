"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

type Product = {
  id: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  usdPrice: number;
  arPrice?: number | null;
  isSubscription: boolean;
  requiresPremium: boolean;
  resourceType: "LINK" | "FILE";
};

export default function RecursoDetallePage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`
        );

        const data = await res.json();
        console.log("Fetched product data:", data);
        if (!data.ok) {
          throw new Error("No se pudo cargar el producto");
        }

        setProduct(data.product);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  if (loading)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Cargando recurso...</p>
      </div>
    );

  if (error || !product)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-red-400">{error || "Recurso no encontrado"}</p>
      </div>
    );

  return (
    <section className="px-4 py-24">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">

        {/* Imagen */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-primary/20 bg-muted">
          <Image
            src={product.coverImageUrl || "/placeholder.svg"}
            alt={product.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center space-y-6">

          <h1 className="text-4xl font-bold">
            {product.title}
          </h1>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Precio */}
          <div className="space-y-1">
            <p className="text-3xl font-bold text-primary">
              USD {product.usdPrice.toFixed(2)}
            </p>

            {product.arPrice && (
              <p className="text-sm text-muted-foreground">
                ARS {product.arPrice.toLocaleString("es-AR")}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">

            <button
              onClick={() =>
                addToCart({
                  id: product.id,
                  title: product.title,
                  usdPrice: product.usdPrice,
                  arPrice: product.arPrice,
                  coverImageUrl: product.coverImageUrl || undefined,
                  quantity: 1,
                })
              }
              className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-6 py-3 font-semibold text-primary transition hover:bg-primary/20"
            >
              <ShoppingCart className="h-4 w-4" />

              {isInCart(product.id)
                ? "Agregar otro"
                : "Agregar al carrito"}
            </button>


          </div>
        </div>
      </div>
    </section>
  );
}