"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Check, ShoppingCart } from "lucide-react";

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
        const data = await res.json();

        if (!data.ok) {
          throw new Error("No se pudo cargar el producto");
        }

        setProduct(data.product);
      } catch (err: any) {
        setError(err.message || "Error al cargar el recurso");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const parsedDescription = useMemo(() => {
    if (!product?.description) {
      return {
        intro: "",
        features: [],
      };
    }

    let raw = product.description.replace(/\r/g, " ").trim();

    raw = raw
      .replace(/INCLUYE:/gi, "\nINCLUYE:\n")
      .replace(/Incluye:/gi, "\nIncluye:\n")
      .replace(/✅/g, "\n✅ ")
      .replace(/✔️/g, "\n✔️ ")
      .replace(/☑️/g, "\n☑️ ")
      .replace(/\n{2,}/g, "\n")
      .trim();

    const lines = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const introParts: string[] = [];
    const features: string[] = [];
    let includesMode = false;

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (/^incluye:?$/i.test(line)) {
        includesMode = true;
        continue;
      }

      const isBullet = /^([\-•*]|✅|✔️|☑️)/.test(line);

      if (includesMode || isBullet) {
        const cleaned = line
          .replace(/^([\-•*]|✅|✔️|☑️)\s*/, "")
          .replace(/^incluye:\s*/i, "")
          .trim();

        if (cleaned) features.push(cleaned);
        continue;
      }

      introParts.push(line);
    }

    const intro = introParts
      .join(" ")
      .replace(/\s*INCLUYE:\s*$/i, "")
      .replace(/\s+/g, " ")
      .trim();

    return {
      intro,
      features,
    };
  }, [product?.description]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Cargando recurso...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex h-[60vh] items-center justify-center px-4">
        <p className="text-sm text-red-400">{error || "Recurso no encontrado"}</p>
      </div>
    );
  }

  return (
    <section className="px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="w-full">
            <div className="relative flex items-center justify-center overflow-hidden rounded-[22px]">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={product.coverImageUrl || "/placeholder.svg"}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 52vw"
                  className="object-contain p-6"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="space-y-5">
              <h1 className="text-balance text-3xl font-extrabold leading-tight text-white md:text-5xl">
                {product.title}
              </h1>

              {parsedDescription.intro ? (
                <p className="text-[17px] leading-9 text-white/80 md:text-lg">
                  {parsedDescription.intro}
                </p>
              ) : null}

              {parsedDescription.features.length > 0 ? (
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm md:p-7">
                  <div className="space-y-5">
                    <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-primary/90">
                      Incluye
                    </h2>

                    <div className="space-y-4">
                      {parsedDescription.features.map((feature, index) => (
                        <div key={`${feature}-${index}`} className="flex items-start gap-3">
                          <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                            <Check className="h-3.5 w-3.5 text-primary" />
                          </div>

                          <p className="text-sm leading-8 text-white/85 md:text-base">
                            {feature}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-8 border-t border-white/10 pt-8">
              <div className="space-y-2">
                <p className="text-4xl font-extrabold leading-none text-primary md:text-5xl">
                  USD {Number.isInteger(product.usdPrice) ? product.usdPrice : product.usdPrice.toFixed(2)}
                </p>

                {product.arPrice != null ? (
                  <p className="text-base text-white/65 md:text-lg">
                    ARS {product.arPrice.toLocaleString("es-AR")}
                  </p>
                ) : (
                  <p className="text-base text-white/65 md:text-lg">
                    {product.isSubscription ? "Suscripción mensual" : "Pago único"}
                  </p>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
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
                  className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(255,190,0,0.18)] transition hover:scale-[1.01] hover:opacity-95"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {isInCart(product.id) ? "Agregar otro al carrito" : "Agregar al carrito"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}