"use client"

const stats = [
  {
    number: "15",
    label: (
      <>
        años de
        <br />
        trayectoria
      </>
    ),
  },
  {
    number: "1.500",
    label: (
      <>
        proyectos
        <br />
        finalizados
      </>
    ),
  },
  {
    number: "20M",
    label: (
      <>
        streams en plataformas
        <br />
        digitales
      </>
    ),
  },
]

const tracks = [
  {
    title: "Sativa",
    spotifyId: "6Vno28wAR8YyHyksiteL7g",
  },
  {
    title: "Eres",
    spotifyId: "2r9itgKulnjzRVuNdpF4rz",
  },
  {
    title: "Fórmula",
    spotifyId: "06QnRFzndyWJni3cEMCMSD",
  },
  {
    title: "Control",
    spotifyId: "0skJ0yl0xuA5cAFC7ikVkQ",
  },
  {
    title: "Otro Millón",
    spotifyId: "2j0CA3TrxQ78vAVMTBdcNV",
  },
  {
    title: "Ojos Vendados",
    spotifyId: "5wQsNoHKGJUerRSUgE1nfn",
  },
  {
    title: "que ganas de tomar contigo",
    spotifyId: "0S37BJ630FC0ktODCoJ8Qd",
  },
  {
    title: "P.O.B.",
    spotifyId: "1BpE4HJ33GeV0bUEJ7WFec",
  },
]

const services = [
  {
    name: "Instrumentales",
    desc: "Desarrollo de instrumentales a partir de ideas o referencias, componiendo armonía y melodía, selección de sonidos, diseño sonoro y arreglos para construir la identidad de cada proyecto.",
  },
  {
    name: "Afinación de Voces",
    desc: "Afinación con herramientas especializadas, aplicada con criterio para lograr correcciones de tono naturales o agresivas, preservando la interpretación.",
  },
  {
    name: "Grabación",
    desc: "Sesiones en salas acústicamente tratadas, con acceso a micrófonos, preamplificadores y conversores de alta gama en EL BRUJO Estudio, Córdoba, Argentina.",
  },
  {
    name: "Mezcla",
    desc: "Limpieza y edición de pistas, balance general, procesamiento dinámico, efectos y automatizaciones para que cada elemento ocupe su espacio y destaque la emoción original del artista.",
  },
  {
    name: "Mastering",
    desc: "Optimización final del balance tonal, la dinámica, el campo estéreo y el loudness, asegurando una correcta traducción en todo tipo de sistemas de reproducción.",
  },
  {
    name: "Servicios Complementarios",
    desc: "Gracias a una red de colaboradores, es posible incorporar músicos, coaches vocales, compositores y arregladores según las necesidades de cada proyecto.",
  },
]

const gearCategories = [
  {
    category: "Micrófonos",
    items: ["Neumann U87", "AKG C414 XLS"],
  },
  {
    category: "Preamplificadores",
    items: ["Focusrite ISA 828", "Avalon VT737sp", "RME UFX"],
  },
  {
    category: "Conversión",
    items: ["RME", "Apollo Twin X Gen 2"],
  },
  {
    category: "Monitoreo",
    items: [
      "Genelec 8330 RAW",
      "Focal Solo6",
      "iLoud MTM MKII",
      "Focal Alpha Twin",
    ],
  },
  {
    category: "Procesamiento",
    items: ["Weiss DS1MK3", "TC Electronic Finalizer Express"],
  },
  {
    category: "Auriculares",
    items: ["Sennheiser HD 600", "Sennheiser HD 650", "Beyerdynamic DT 770 Pro"],
  },
]

export default function FrancoCanoPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0A0A0A] pt-16 text-[#E8E8E8]">
      <section
        id="sobre"
        className="grid min-h-[calc(100dvh-64px)] grid-cols-1 overflow-hidden border-b border-white/10 md:grid-cols-2"
      >
        <div className="flex flex-col justify-center px-6 py-16 md:px-12 md:py-20">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#888888]">
            Franco Cano
          </p>

          <h1 className="font-['Barlow'] text-[58px] font-black leading-[0.92] tracking-[-0.02em] text-[#E8E8E8] sm:text-[78px] lg:text-[96px]">
            Prod
            <br />
            <span className="text-[#C9A84C]">ByKNNO</span>
          </h1>

          <p className="mt-6 flex flex-wrap gap-x-2 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-[#888888]">
            <span>Instrumentales</span>
            <span className="text-white/20">·</span>
            <span>Grabación</span>
            <span className="text-white/20">·</span>
            <span>Mezcla</span>
            <span className="text-white/20">·</span>
            <span>Mastering</span>
          </p>

          <p className="mt-8 max-w-[440px] text-[14px] leading-[1.75] text-[#AAAAAA]">
            Mi objetivo es que cada canción alcance su máximo potencial,
            buscando destacar la emoción y la intención original del artista.
            Desde la creación del instrumental, la grabación, la mezcla y el
            mastering, acompaño cada etapa del proceso enfocado en transformar
            tus ideas en una canción terminada y lista para competir en la
            industria.
          </p>
        </div>

        <div className="relative min-h-[420px] overflow-hidden bg-[#161616] md:min-h-full">
          <img
            src="/franco-cano.png"
            alt="Franco Cano"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-85"
          />

          <div className="absolute inset-0 bg-[#0A0A0A]/25" />

          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(201,168,76,0.12)_0%,transparent_60%)]" />

          <div className="absolute inset-0 opacity-50">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_59px,rgba(201,168,76,0.04)_59px,rgba(201,168,76,0.04)_60px)]" />
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_59px,rgba(201,168,76,0.04)_59px,rgba(201,168,76,0.04)_60px)]" />
          </div>

          <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#C9A84C] to-transparent opacity-40" />
        </div>
      </section>

      <section className="grid border-b border-white/10 border-t border-white/10 px-6 md:grid-cols-2 md:px-12 lg:grid-cols-[repeat(3,1fr)_auto]">
        {stats.map((stat) => (
          <div
            key={stat.number}
            className="flex items-center gap-5 border-b border-white/10 py-9 md:border-r md:last:border-r-0 lg:border-b-0"
          >
            <div className="h-px w-8 bg-[#C9A84C]" />

            <div>
              <div className="font-['Barlow'] text-[28px] font-extrabold text-[#E8E8E8]">
                {stat.number}
              </div>

              <div className="mt-0.5 text-[11px] leading-[1.4] text-[#888888]">
                {stat.label}
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center py-8 md:col-span-2 lg:col-span-1 lg:pl-12">
          <p className="max-w-[260px] text-[12px] italic text-[#888888]">
            Especializado en música urbana y latina, pop y electrónica.
          </p>
        </div>
      </section>

      <section
        id="portfolio"
        className="border-y border-[#C9A84C]/10 bg-[#111111] px-6 py-20 md:px-12 md:py-24"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-12">
            <div className="mb-8 flex items-center gap-4 font-['Barlow'] text-[11px] uppercase tracking-[0.3em] text-[#C9A84C]">
              Discografía
              <span className="h-px w-40 max-w-[160px] bg-gradient-to-r from-[#7a6429] to-transparent" />
            </div>

            <h2 className="font-['Barlow'] text-[44px] font-light leading-[1.05] tracking-[-0.02em] text-[#E8E8E8] md:text-[62px]">
              Portfolio
              <br />
              <em className="text-[#C9A84C]">producciones</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tracks.map((track) => (
              <article
                key={track.spotifyId}
                className="overflow-hidden rounded-xl border border-white/10 bg-black/40"
              >
                <iframe
                  title={track.title}
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

      <section id="servicios" className="px-6 py-16 md:px-12 md:py-24">
        <p className="mb-10 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A84C]">
          Qué ofrezco
          <span className="h-px w-10 bg-[#C9A84C]" />
        </p>

        <h2 className="mb-12 font-['Barlow'] text-[42px] font-extrabold leading-none tracking-[-0.02em] text-[#E8E8E8] md:text-[56px]">
          Servicios
        </h2>

        <div className="grid border border-white/10 md:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.name}
              className="border-b border-white/10 p-8 transition hover:bg-[#161616] md:border-r md:p-10"
            >
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C9A84C]">
                {service.name}
              </p>

              <p className="text-[13px] leading-[1.7] text-[#999999]">
                {service.desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="equipos"
        className="bg-[#111111] px-6 py-16 md:px-12 md:py-24"
      >
        <p className="mb-10 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A84C]">
          El Arsenal
          <span className="h-px w-10 bg-[#C9A84C]" />
        </p>

        <h2 className="mb-12 font-['Barlow'] text-[42px] font-extrabold leading-none tracking-[-0.02em] text-[#E8E8E8] md:text-[56px]">
          Equipos utilizados
        </h2>

        <div className="grid max-w-[900px] grid-cols-1 gap-x-14 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {gearCategories.map((gear) => (
            <div key={gear.category}>
              <p className="mb-3 border-b border-white/10 pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C9A84C]">
                {gear.category}
              </p>

              <div className="space-y-1 text-[13px] leading-8 text-[#999999]">
                {gear.items.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#161616] px-6 py-20 text-center md:px-12 md:py-24">
        <p className="mx-auto max-w-[800px] font-['Barlow'] text-[24px] font-semibold leading-[1.4] text-[#E8E8E8] md:text-[30px]">
          &quot;Mi objetivo es que cada canción alcance su{" "}
          <span className="text-[#C9A84C]">máximo potencial</span>,
          <br className="hidden md:block" />
          destacando la emoción y la intención original del artista.&quot;
        </p>
      </section>

      <section
        id="contacto"
        className="grid items-center gap-10 px-6 py-20 md:px-12 md:py-24 lg:grid-cols-[1fr_auto]"
      >
        <div>
          <p className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A84C]">
            Trabajemos
            <span className="h-px w-10 bg-[#C9A84C]" />
          </p>

          <h2 className="font-['Barlow'] text-[42px] font-black leading-none tracking-[-0.02em] text-[#E8E8E8] md:text-[64px]">
            ¿Tenés un <span className="text-[#C9A84C]">proyecto?</span>
          </h2>

          <p className="mt-4 max-w-[500px] text-[14px] text-[#888888]">
            Desde el instrumental hasta el master. Si buscás a alguien que
            acompañe todo el proceso, hablemos.
          </p>
        </div>

        <a
          href="https://wa.link/xrw6yw"
          target="_blank"
          rel="noreferrer"
          className="inline-flex whitespace-nowrap rounded bg-[#C9A84C] px-8 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition hover:-translate-y-0.5 hover:bg-[#E2C06A]"
        >
          Contacto
        </a>
      </section>

      <footer className="flex flex-col items-center justify-between gap-3 border-t border-white/10 px-6 py-7 text-center md:flex-row md:px-12">
        <p className="text-[11px] text-[#888888]">
          © 2025 Franco Cano · Prod by KNNO · Córdoba, Argentina
        </p>

        <a
          href="#"
          className="text-[11px] uppercase tracking-[0.1em] text-[#C9A84C]"
        >
          Entrenamiento Focus ⚡
        </a>
      </footer>
    </main>
  )
}