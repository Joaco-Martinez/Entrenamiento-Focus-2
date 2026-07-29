"use client"

const gearItems = [
  {
    brand: "Manley",
    name: "Stereo Variable Mu",
    image: "/1.png",
    alt: "Manley Stereo Variable Mu",
  },
  {
    brand: "API",
    name: "2500",
    image: "/2.png",
    alt: "API 2500",
  },
  {
    brand: "Empirical Labs",
    name: "Distressor",
    image: "/3.png",
    alt: "Empirical Labs Distressor",
  },
  {
    brand: "Manley",
    name: "Massive Passive",
    image: "/4.png",
    alt: "Manley Massive Passive",
  },
  {
    brand: "Lynx Studio",
    name: "Aurora",
    image: "/5.png",
    alt: "Lynx Aurora",
  },
  {
    brand: "API",
    name: "Box Console",
    image: "/6.png",
    alt: "API Box Console",
  },
  {
    brand: "Sennheiser",
    name: "HD 600",
    image: "/7.png",
    alt: "Sennheiser HD 600",
  },
  {
    brand: "Eve Audio",
    name: "SC205",
    image: "/8.png",
    alt: "Eve Audio SC205",
  },
]

const tracks = [
  {
    title: "Sin sentido",
    artist: "Yvngmax",
    spotifyId: "13zEy4B7Z35XQLS95BjDbe",
  },
  {
    title: "Cómo tu",
    artist: "Javvi",
    spotifyId: "3E3VcD9UEna4jZceSBcB69",
  },
  {
    title: "Castigo",
    artist: "Alvaro Blas",
    spotifyId: "2yTWfRKfqrNAmxO0grQmNh",
  },
  {
    title: "Kalikush",
    artist: "",
    spotifyId: "46WYni6GLecGcVCUqnhcSO",
  },
  {
    title: "Hace calor",
    artist: "",
    spotifyId: "7Mn4Oc8pjuFKpYQujlZOnu",
  },
  {
    title: "Cumbia TLD",
    artist: "",
    spotifyId: "7KsTiol2cveSpWp1qwQCNi",
  },
  {
    title: "Invicto",
    artist: "Javvi",
    spotifyId: "0Jspipggkoxk1UVlkluuVX",
  },
  {
    title: "Ese lado oscuro",
    artist: "",
    spotifyId: "2mOJH9KHtQUAqyuSYldsmV",
  },
]

export default function MatiasLedesmaPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#111110] pt-16 text-[#f0ede6]">
      <section className="grid min-h-[calc(100dvh-64px)] grid-cols-1 overflow-hidden border-b border-[#3a3a36] md:grid-cols-2">
        <div className="relative z-10 flex flex-col justify-center px-6 py-16 md:py-20 md:pl-[380px] md:pr-12">
          <h1 className="text-[44px] font-extrabold leading-[1.05] tracking-tight text-[#f0ede6] sm:text-[64px] lg:text-[80px]">
            Matias
            <br />
            <span className="font-normal text-[#c8a84b]">Ledesma</span>
          </h1>

          <p className="mt-8 max-w-[440px] text-[11px] lg:text-[13px] uppercase tracking-[0.24em] text-[#888880]">
            Mix · Mastering · Córdoba, ARG
          </p>

          <div className="mt-10 max-w-[440px] space-y-6 text-[16px] lg:text-[20px] leading-[1.85] text-[#d4cfc0]">
            <p>
              Empecé como músico y eso me enseñó algo que solo te lo da estar
              de ese lado:{" "}
              <strong className="font-medium text-[#c8a84b]">
                entender qué siente el artista.
              </strong>
            </p>

            <p>
              Con más de 15 años especializándome en{" "}
              <strong className="font-medium text-[#c8a84b]">
                mezcla y mastering
              </strong>
              , combino fundamentos técnicos con decisiones artísticas para que
              el resultado final suene exactamente como tiene que sonar.
            </p>
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden bg-[#181816] md:min-h-full">
          <img
            src="/Foto_sub_pagina_Mati.webp"
            alt="Matias Ledesma"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-80"
          />

          <div className="absolute inset-0 bg-[#111110]/35" />

          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(200,168,75,0.08)_0%,transparent_60%)]" />

          <div className="absolute inset-0 opacity-60">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_59px,rgba(200,168,75,0.045)_59px,rgba(200,168,75,0.045)_60px)]" />
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_59px,rgba(200,168,75,0.045)_59px,rgba(200,168,75,0.045)_60px)]" />
          </div>

          <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#c8a84b] to-transparent opacity-40" />
        </div>
      </section>

      <section
        id="equipos"
        className="mx-auto max-w-[1180px] px-6 py-20 sm:px-10 md:py-28 lg:px-12"
      >
        <h2 className="text-[44px] font-light leading-[1.05] tracking-[-0.02em] text-[#f0ede6] md:text-[62px]">
          Equipos
          <br />
          <span className="text-[#c8a84b]">utilizados</span>
        </h2>

        <div className="mt-12 grid grid-cols-2 gap-[3px] md:grid-cols-4">
          {gearItems.map((item) => (
            <article
              key={`${item.brand}-${item.name}`}
              className="group overflow-hidden border border-[#7a6429]/50"
            >
              <div className="flex aspect-square items-center justify-center overflow-hidden bg-[#111110] p-1">
                <img
                  src={item.image}
                  alt={item.alt}
                  className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.05]"
                  onError={(event) => {
                    event.currentTarget.style.display = "none"
                  }}
                />
              </div>

              <div className="flex flex-col gap-1 bg-[#c8a84b] px-3 py-2 md:px-4">
                <span className="text-[8px] uppercase tracking-[0.18em] text-[#111110]/55 md:text-[9px] lg:text-[13px]">
                  {item.brand}
                </span>

                <span className="text-[15px] font-semibold leading-[1.05] text-[#111110] md:text-[17px] lg:text-[20px]">
                  {item.name}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="trabajos"
        className="border-y border-[#c8a84b]/10 bg-[#181816] px-6 py-20 sm:px-10 md:py-24 lg:px-12"
      >
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12">
            <div className="mb-8 flex items-center gap-4 text-[11px] lg:text-[20px] uppercase tracking-[0.3em] text-[#c8a84b]">
              Discografía
              <span className="h-px w-40 max-w-[160px] bg-gradient-to-r from-[#7a6429] to-transparent" />
            </div>

            <h2 className="text-[44px] font-light leading-[1.05] tracking-[-0.02em] text-[#f0ede6] md:text-[62px]">
              Trabajos
              <br />
              <span className="text-[#c8a84b]">recientes</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tracks.map((track) => (
              <article
                key={track.spotifyId}
                className="overflow-hidden rounded-xl border border-white/10 bg-black/40"
              >
                <iframe
                  title={`${track.artist ? `${track.artist} - ` : ""}${
                    track.title
                  }`}
                  src={`https://open.spotify.com/embed/track/${track.spotifyId}?utm_source=generator&theme=0`}
                  width="100%"
                  height="152"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="block w-full rounded-xl"
                  style={{ border: 0 }}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#3a3a36] bg-[#181816] px-6 py-20 text-center md:px-12">
        <p className="mx-auto max-w-[850px] text-[19px] font-semibold leading-[1.5] text-[#f0ede6] md:text-[24px]">
          &quot;No se trata de lo que agregás — sino de lo que lográs que el
          oyente sienta sin saber por qué.&quot;
        </p>
      </section>

      <section
        id="contacto"
        className="mx-auto flex max-w-[1180px] flex-col gap-10 border-t border-[#3a3a36] px-6 py-20 sm:px-10 md:flex-row md:items-center md:justify-between md:py-28 lg:px-12"
      >
        <div>
          <div className="mb-8 flex items-center gap-4 text-[11px] lg:text-[20px] uppercase tracking-[0.3em] text-[#c8a84b]">
            Trabajemos
            <span className="h-px w-32 bg-gradient-to-r from-[#7a6429] to-transparent" />
          </div>

          <h2 className="text-[46px] font-light leading-none tracking-[-0.02em] text-[#f0ede6] md:text-[72px]">
            ¿Tenés un
            <br />
            <span className="text-[#c8a84b]">proyecto?</span>
          </h2>

          <p className="mt-6 max-w-[420px] text-[15px] lg:text-[20px] leading-[1.8] text-[#888880]">
            Trabajo con artistas y productores comprometidos con su música. Si
            llegaste hasta acá, probablemente seas uno.
          </p>
        </div>

        <a
          href="https://api.whatsapp.com/send?phone=543512289357&text=Hola%20Matias%2C%20me%20gustaría%20trabajar%20con%20vos!"
          className="group inline-flex shrink-0 items-center justify-center rounded-xl border border-[#c8a84b]/30 bg-[#111110] px-14 py-5 transition hover:bg-[#c8a84b]"
        >
          <span className="text-[16px] font-bold text-[#f0ede6] transition group-hover:text-[#111110]">
            Contacto →
          </span>
        </a>
      </section>

      <footer className="flex flex-col gap-3 border-t border-[#3a3a36] px-6 py-8 md:flex-row md:items-center md:justify-between md:px-12">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#555550]">
          © 2025 Matias Ledesma · Córdoba, Argentina
        </p>

        <span className="text-[10px] uppercase tracking-[0.18em] text-[#7a6429]">
          Entrenamiento Focus ⚡
        </span>
      </footer>
    </main>
  )
}