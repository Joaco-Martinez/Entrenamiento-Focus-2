"use client"

const teamMembers = [
  {
    name: "Franco Cano",
    image: "/Foto_Franco_Cano.webp",
    alt: "Franco Cano",
    button: "Ver perfil de Franco →",
    href: "/franco-cano",
  },
  {
    name: "Matias Ledesma",
    image: "/Imagen_principal.webp",
    alt: "Matias Ledesma",
    button: "Ver perfil de Matias →",
    href: "/matias-ledesma",
  },
]

export default function ServiciosPage() {
  return (
    <main className="min-h-screen bg-[#111110] px-4 pb-16 pt-28 text-[#e8e6e0] sm:px-6 md:px-8">
      <div className="mx-auto max-w-[960px]">
        <header className="mb-8">
          <h1 className="max-w-[720px] text-[38px] font-extrabold leading-[1.05] tracking-[-0.03em] text-white md:text-[52px]">
            Sumanos a tu <span className="text-[#c8a84b]">equipo.</span>
          </h1>

          <div className="mt-4 mb-5 h-[2px] w-9 bg-[#c8a84b]" />

          <p className="text-[15px] lg:text-[20px] font-light leading-[1.7] text-[#a09e98]">
            Trabajamos con artistas que se toman en serio su música.
          </p>

          <p className="text-[15px] lg:text-[20px] font-light leading-[1.7] text-[#a09e98]">
            <strong className="font-semibold text-[#e8e6e0]">
              Si sos uno de ellos, podemos ayudarte.
            </strong>
          </p>
        </header>

        <section className="mb-4 grid grid-cols-2 gap-3 sm:gap-4">
          {teamMembers.map((member) => (
            <article
              key={member.name}
              className="overflow-hidden rounded-xl bg-[#1a1a18]"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-[#222]">
                <img
                  src={member.image}
                  alt={member.alt}
                  onError={(event) => {
                    event.currentTarget.style.display = "none"
                  }}
                  className="h-full w-full object-cover brightness-[0.8]"
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-3 pt-10 sm:px-4 sm:pb-4">
                  <a
                    href={member.href}
                    className="block w-full rounded-md border border-[#c8a84b]/60 bg-white/[0.05] px-2 py-2 text-center text-[8px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur transition hover:border-[#c8a84b] hover:bg-[#c8a84b] hover:text-[#111110] sm:rounded-lg sm:px-4 sm:py-3 sm:text-[11px] lg:text-[14px] sm:tracking-[0.14em]"
                  >
                    {member.button}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="relative min-h-[320px] overflow-hidden rounded-xl">
          <div
            className="absolute inset-0 bg-cover bg-center brightness-[0.35]"
            style={{
              backgroundImage: "url('/pack-focus.jpg')",
            }}
          />

          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(17,17,16,0.6)_0%,rgba(17,17,16,0.2)_100%)]" />

          <div className="relative z-10 flex min-h-[320px] flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
            <div className="flex-1">
              <div className="mb-3 inline-flex items-center gap-1 rounded-full border border-[#c8a84b]/35 bg-[#c8a84b]/15 px-3 py-1 text-[10px] lg:text-[14px] font-semibold uppercase tracking-[0.08em] text-[#c8a84b]">
                ⚡ Más elegido
              </div>

              <p className="mb-2 text-[10px] lg:text-[14px] font-medium uppercase tracking-[0.18em] text-white/45">
                Franco Cano + Matias Ledesma
              </p>

              <h2 className="mb-3 text-[38px] font-extrabold leading-none tracking-[-0.03em] text-white sm:text-[40px]">
                Pack Focus
              </h2>

              <p className="max-w-[480px] text-[14px] lg:text-[18px] font-light leading-[1.7] text-white/65">
                Tu canción, de principio a fin, con los dos.{" "}
                <strong className="font-medium text-white">
                  Un criterio unificado desde la producción hasta el master
                </strong>{" "}
                — sin que nada se pierda en el camino.
              </p>
            </div>

            <a
              href="https://wa.link/p6iugi"
              target="_blank"
              rel="noreferrer"
              className="w-full shrink-0 rounded-lg bg-[#c8a84b] px-7 py-4 text-center text-[11px] lg:text-[16px] font-bold uppercase tracking-[0.14em] text-[#111110] transition hover:opacity-90 sm:w-auto"
            >
              Consultar Pack →
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}