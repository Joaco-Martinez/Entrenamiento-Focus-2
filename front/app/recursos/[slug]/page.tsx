import Image from "next/image"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Gift } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getRecursoBySlug } from "@/lib/ebooks"
import ComprarWhatsAppButton from "./ComprarWhatsAppButton"

export default async function EbookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const ebook = getRecursoBySlug(slug)
  if (!ebook) return notFound()

  return (
    <section className="py-14 px-4 bg-[#0b0b0c]">
      <div className="container max-w-6xl mx-auto">
        {/* Volver */}
        <div className="mb-6">
          <Link
            href="/ebooks"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a ebooks
          </Link>
        </div>

        <Card className="relative overflow-hidden border border-[#d4af37]/20 bg-[#101114] px-6 py-10 md:px-12 md:py-12">
          {/* Glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(212,175,55,0.14),transparent_60%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_85%_25%,rgba(212,175,55,0.10),transparent_55%)]" />

          {/* Título */}
          <header className="relative text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-wide text-[#d4af37] uppercase">
              {ebook.title}
            </h1>

          </header>

          {/* Layout */}
          <div className="relative grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-10 md:gap-12 items-start">
            {/* Derecha: Cover + Precio + CTAs */}
            <aside className="order-1 md:order-2 md:sticky md:top-10">
              <div className="flex flex-col items-center">
                {/* Imagen */}
                <div className="relative w-72 md:w-[380px] aspect-square overflow-hidden rounded-2xl border border-[#d4af37]/15 bg-[#0c0d0f]">
                  <Image
                    src={ebook.coverUrl || "/placeholder.svg"}
                    alt={ebook.title}
                    fill
                    sizes="(max-width: 768px) 288px, 380px"
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Precio */}
                <div className="flex items-baseline gap-3 pt-4">
                  <span className="text-4xl font-bold text-[#d4af37]">
                    USD {ebook.priceUsd}
                  </span>
                  <span className="text-white/50">pago único</span>
                </div>

                {/* Botones */}
                <div className="mt-7 w-full flex flex-col items-center gap-4">
  {/* Texto guía */}
  <p className="text-sm md:text-base text-white/70 flex items-center gap-2">
    Obtenelo al instante desde el siguiente botón
    <span className="text-[#d4af37]"></span>
  </p>

<div className="w-full flex flex-col items-center gap-4">
  {/* Botón ebook */}
  <ComprarWhatsAppButton
    message={ebook.whatsappMessage}
    label="Plantilla de ingresos"
  />

  {/* Botón mentoría (más llamativo) */}
  <Link href="/recursos" className="w-full sm:w-auto">
    <Button
  size="lg"
  className="
    w-full sm:w-auto
    h-auto
    px-8 py-6
    text-base font-semibold
    rounded-full
    bg-[#d4af37]
    text-black
    hover:bg-[#e6c766]
    shadow-[0_0_25px_rgba(212,175,55,0.35)]
    transition
  "
>
  Plantilla de ingresos + Mentoría privada
</Button>
  </Link>
</div>

</div>
              </div>
            </aside>

            {/* Izquierda: Texto + Bonus + Incluye */}
            <div className="order-2 md:order-1 space-y-6">
              {/* {ebook.descriptionShort ? (
                <p className="text-white/70 leading-relaxed text-base md:text-lg">
                  {ebook.descriptionShort}
                </p>
              ) : null} */}

              {ebook.descriptionLong ? (
                <div className="space-y-5 text-white/65 leading-relaxed whitespace-pre-line">
                  {ebook.descriptionLong}
                </div>
              ) : null}

              {/* Bonus */}

              {/* Incluye */}
              {ebook.includes?.length ? (
                <div className="rounded-2xl border border-[#d4af37]/20 bg-[#0c0d0f] p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[#d4af37] font-semibold">
                    <Gift className="h-4 w-4" />
                    Incluye
                  </div>
                  <ul className="list-disc pl-5 text-sm text-white/60 space-y-1.5">
                    {ebook.includes.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="flex items-start gap-3 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-4 text-sm text-white/80">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/20">
                  <Gift className="h-4 w-4 text-[#d4af37]" />
                </span>
                <p className="leading-relaxed">
                  <span className="font-semibold text-white">
                    ¡Bonus especial!
                  </span>{" "}
                  Si entrás a la mentoría por USD 15, la plantillas te las damos {" "}
                  <span className="font-semibold text-[#d4af37]">GRATIS</span>.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
