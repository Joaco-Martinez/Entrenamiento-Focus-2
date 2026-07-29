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
        <div className="flex flex-col justify-center px-6 py-16 md:py-20 md:pl-[380px] md:pr-12">
          <p className="mb-5 text-[10px] lg:text-[12px] font-semibold uppercase tracking-[0.2em] text-[#888888]">
            Franco Cano
          </p>

          <h1 className="text-[44px] font-extrabold leading-[1.05] tracking-tight text-[#E8E8E8] sm:text-[64px] lg:text-[80px]">
            Prod
            <br />
            <span className="text-[#C9A84C]">ByKNNO</span>
          </h1>

          <p className="mt-6 flex max-w-[440px] flex-wrap gap-x-2 gap-y-1 text-[11px] lg:text-[13px] uppercase tracking-[0.24em] text-[#888888]">
            <span>Instrumentales</span>
            <span className="text-white/20">·</span>
            <span>Grabación</span>
            <span className="text-white/20">·</span>
            <span>Mezcla</span>
            <span className="text-white/20">·</span>
            <span>Mastering</span>
          </p>

          <p className="mt-8 max-w-[440px] text-[16px] lg:text-[20px] leading-[1.85] text-[#AAAAAA]">
            Mi objetivo es que cada canción alcance su máximo potencial,
            buscando destacar la emoción y la intención original del artista.
            Desde la creación del instrumental, la grabación, la mezcla y el
            mastering, acompaño cada etapa del proceso enfocado en transformar
            tus ideas en una canción terminada y lista para competir en la
            industria.
          </p>

          <div className="mt-8 max-w-[440px] space-y-5">
            {stats.map((stat) => (
              <div
                key={stat.number}
                className="flex items-center gap-5 border-b border-white/10 pb-5"
              >
                <div className="h-px w-8 shrink-0 bg-[#C9A84C]" />

                <div>
                  <div className="text-[30px] lg:text-[36px] font-extrabold text-[#E8E8E8]">
                    {stat.number}
                  </div>

                  <div className="mt-0.5 text-[12px] lg:text-[20px] leading-[1.4] text-[#888888]">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}

            <p className="text-[13px] lg:text-[20px] italic text-[#888888]">
              Especializado en música urbana y latina, pop y electrónica.
            </p>
          </div>
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

      <section
        id="portfolio"
        className="border-y border-[#C9A84C]/10 bg-[#111111] px-6 py-20 md:px-12 md:py-24"
      >
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12">
            <div className="mb-8 flex items-center gap-4 text-[11px] lg:text-[20px] uppercase tracking-[0.3em] text-[#C9A84C]">
              Discografía
              <span className="h-px w-40 max-w-[160px] bg-gradient-to-r from-[#7a6429] to-transparent" />
            </div>

            <h2 className="text-[44px] font-light leading-[1.05] tracking-[-0.02em] text-[#E8E8E8] md:text-[62px]">
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

      <section id="servicios" className="px-6 py-16 sm:px-10 md:py-24 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <p className="mb-10 flex items-center gap-3 text-[10px] lg:text-[20px] font-semibold uppercase tracking-[0.2em] text-[#C9A84C]">
            Qué ofrezco
            <span className="h-px w-10 bg-[#C9A84C]" />
          </p>

          <h2 className="mb-12 text-[42px] font-extrabold leading-none tracking-[-0.02em] text-[#E8E8E8] md:text-[56px]">
            Servicios
          </h2>

          <div className="grid border border-white/10 md:grid-cols-2">
            {services.map((service) => (
              <article
                key={service.name}
                className="border-b border-white/10 p-8 transition hover:bg-[#161616] md:border-r md:p-10"
              >
                <p className="mb-4 text-[13px] lg:text-[16px] font-semibold uppercase tracking-[0.16em] text-[#C9A84C]">
                  {service.name}
                </p>

                <p className="text-[16px] leading-[1.6] lg:text-[20px] text-[#999999]">
                  {service.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="equipos"
        className="bg-[#111111] px-6 py-16 sm:px-10 md:py-24 lg:px-12"
      >
        <div className="mx-auto max-w-[1180px]">
          <h2 className="mb-12 text-center text-[42px] font-extrabold leading-none tracking-[-0.02em] text-[#E8E8E8] md:text-[56px]">
            Equipos utilizados
          </h2>

          <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-x-24 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {gearCategories.map((gear) => (
              <div key={gear.category}>
                <p className="mb-3 border-b border-white/10 pb-3 text-[13px] lg:text-[16px] font-semibold uppercase tracking-[0.16em] text-[#C9A84C]">
                  {gear.category}
                </p>

                <div className="space-y-1 text-[16px] leading-[1.6] lg:text-[20px] text-[#999999]">
                  {gear.items.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#161616] px-6 py-20 text-center sm:px-10 md:py-24 lg:px-12">
        <p className="mx-auto max-w-[850px] text-[19px] font-semibold leading-[1.5] text-[#E8E8E8] md:text-[24px]">
          &quot;Mi objetivo es que cada canción alcance su{" "}
          <span className="text-[#C9A84C]">máximo potencial</span>,
          <br className="hidden md:block" />
          destacando la emoción y la intención original del artista.&quot;
        </p>
      </section>

      <section
        id="contacto"
        className="mx-auto grid max-w-[1180px] items-center gap-10 px-6 py-20 sm:px-10 md:py-24 lg:grid-cols-[1fr_auto] lg:px-12"
      >
        <div>
          <p className="mb-5 flex items-center gap-3 text-[10px] lg:text-[20px] font-semibold uppercase tracking-[0.2em] text-[#C9A84C]">
            Trabajemos
            <span className="h-px w-10 bg-[#C9A84C]" />
          </p>

          <h2 className="text-[46px] font-light leading-none tracking-[-0.02em] text-[#E8E8E8] md:text-[72px]">
            ¿Tenés un
            <br />
            <span className="text-[#C9A84C]">proyecto?</span>
          </h2>

          <p className="mt-4 max-w-[500px] text-[15px] lg:text-[20px] text-[#888888]">
            Desde el instrumental hasta el master. Si buscás a alguien que
            acompañe todo el proceso, hablemos.
          </p>
        </div>

        <a
          href="https://wa.link/xrw6yw"
          target="_blank"
          rel="noreferrer"
          className="group inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-[#C9A84C]/30 bg-[#0A0A0A] px-14 py-5 transition hover:bg-[#C9A84C]"
        >
          <span className="text-[16px] font-bold text-[#E8E8E8] transition group-hover:text-[#0A0A0A]">
            Contacto →
          </span>
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