import type { MetadataRoute } from "next";

// El sitio permanece indexable, pero los presupuestos por enlace y el editor no.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/presupuesto/", "/admin/"] }
    ],
  };
}
