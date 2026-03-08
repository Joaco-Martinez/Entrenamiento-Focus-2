export type RecursoItem = {
  slug: string
  title: string
  subtitle: string
  descriptionShort: string
  descriptionLong: string
  priceUsd: number
  coverUrl: string
  badge?: "Bonus" | "Nuevo" | "Pack"
  includes?: string[]
  whatsappMessage: string
}

export const RECURSOS: RecursoItem[] = [
  // {
  //   slug: "entrenamiento-focus",
  //   title: "Entrenamiento Focus",
  //   subtitle: "Producción, mezcla y mastering",
  //   descriptionShort: "Guía completa con técnicas profesionales para mejorar tus mixes.",
  //   descriptionLong:
  //     "Todo lo que necesitás para producir, mezclar y masterizar con un enfoque profesional. Explicado claro, con ejemplos y una ruta paso a paso para mejorar tu sonido.",
  //   priceUsd: 10,
  //   coverUrl:
  //     "https://res.cloudinary.com/deb7jg37j/image/upload/v1768012046/01_Ebook_-_Gadgets_-_Entrenamiento_Focus_d3rlid.jpg",
  //   badge: "Bonus",
  //   includes: ["Checklist de mezcla", "Cadena de mastering sugerida", "Tips de gain staging"],
  //   whatsappMessage: "Hola! Quiero comprar el ebook Entrenamiento Focus (Producción, mezcla y mastering).",
  // },
   {
    slug: "organizacion-focus",
    title: "Organización Focus",
    subtitle: "Organización financiera y control del negocio",
descriptionShort:
  "Plantilla profesional para ordenar ingresos, egresos y entender qué estrategias hacen crecer tu negocio.",
    descriptionLong:
  "Te ofrecemos una plantilla de organización de finanzas para registrar tus ingresos y egresos, y dividir en porcentajes tu dinero para reforzar la educación financiera. Vas a lograr una estructura estable. Pero esta plantilla es más que eso.\n\nLa plantilla te permite registrar a detalle tu negocio, entender qué es lo que más funciona, cuáles son las estrategias más rentables y de dónde viene cada cliente, para saber hacia dónde conviene direccionar tus próximos pasos y que tu negocio crezca de verdad, sin fórmulas mágicas.\n\nTambién vas a encontrar meses de esfuerzo y dedicación para tener un registro a fondo de cada rincón de tu negocio. No es una plantilla que se pueda recrear con ChatGPT ni con herramientas nuevas. Cuando adquieras la tuya, vas a entender de lo que hablamos: no vimos nada similar en ningún lado."
    ,
    priceUsd: 10,
    coverUrl:
      "https://res.cloudinary.com/deb7jg37j/image/upload/v1768750449/Captura_de_pantalla_2026-01-18_a_la_s_12.56.47_a._m._utvv9f.png",
    badge: "Bonus",
    includes: ["Clase completa del sistema de finanzas", "Plantilla Completa de finanzas", "Plantilla extra de métricas y estrategia en redes sociales para Productores e Ing. De Mezcla y Mastering"],
    whatsappMessage: "Hola! Quiero comprar el ebook Entrenamiento Focus (Producción, mezcla y mastering).",
  },
]

export function getRecursoBySlug(slug: string) {
  return RECURSOS.find((e) => e.slug === slug)
}
