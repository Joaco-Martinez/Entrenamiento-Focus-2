"use client"

import { Music, Zap, MessageCircle, ArrowRight, Check } from "lucide-react"

export default function EntrenamientoFocusPage() {
  const benefits = [
    {
      icon: Music,
      title: "Mezcla y Mastering",
      text: "Clases sobre proyectos reales, de manera ordenada y profundizada. Algo distinto a lo que vemos en redes sociales.",
      highlight: ["reales"],
    },
    {
      icon: Zap,
      title: "Visión y Criterio",
      text: "Aprenderás a tomar decisiones más rápido, sin dudar en el proceso.",
      highlight: ["más rápido"],
    },
    {
      icon: MessageCircle,
      title: "Feedback y Conexiones",
      text: "Soporte directo con el mentor para resolver dudas y recibir feedback de canciones.",
      highlight: ["Conexiones"],
    },
  ]

  const extras = [
      {
          image:
          "https://res.cloudinary.com/deb7jg37j/image/upload/v1776441791/Cuadrado_5_inryct.png",
          title: "Traemos invitados especiales",
          text: "aportando distintos puntos de vista y conocimientos.",
        },
        {
          image:
            "https://res.cloudinary.com/deb7jg37j/image/upload/v1776441781/Cuadrado_4_foutob.png",
          title: "Recibirás material para practicar",
          text: "todo lo visto en clases.",
        },
    {
      image:
        "https://res.cloudinary.com/deb7jg37j/image/upload/v1776441793/Cuadrado_06_uycw7g.png",
      title: "Clases de desarrollo personal y marketing",
      text: "para no descuidar esa área tan importante.",
    },
  ]

  const bullets = [
    {
      start: "4 clases al mes",
      rest: " por Zoom — ",
      accent: "Lunes 20:00",
      end: " (Argentina)",
    },
    {
      start: "Todas las clases",
      rest: " quedan grabadas en la plataforma para que las veas cuando quieras desde cualquier dispositivo.",
      accent: "",
      end: "",
    },
    {
      start: "El pago se renueva automáticamente cada mes.",
      rest: " Podés cancelar cuando quieras.",
      accent: "",
      end: "",
    },
  ]

  return (
    <main className="min-h-screen bg-[#050505] pt-16 text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 bg-cover bg-no-repeat opacity-80"
          style={{
            backgroundImage: `
              linear-gradient(
                180deg,
                rgba(5,5,5,0.35) 0%,
                rgba(5,5,5,0.55) 28%,
                rgba(5,5,5,0.88) 68%,
                rgba(5,5,5,1) 100%
              ),
              linear-gradient(
                90deg,
                rgba(5,5,5,0.92) 0%,
                rgba(5,5,5,0.74) 32%,
                rgba(5,5,5,0.38) 58%,
                rgba(5,5,5,0.75) 100%
              ),
              url('https://res.cloudinary.com/deb7jg37j/image/upload/v1776440143/Imagen_principal_c1vw7k.png')
            `,
            backgroundPosition: "center 14%",
          }}
        />

        <div className="relative mx-auto max-w-[1280px] px-6 py-14 md:px-10 lg:px-12 lg:py-20">
          <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-[760px]">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-px w-12 bg-[#D4AF37]" />
                <span className="text-[13px] uppercase tracking-[0.32em] text-[#D4AF37]">
                  Entrenamiento Focus
                </span>
              </div>

              <h1 className="text-[46px] font-light leading-[0.96] tracking-[-0.05em] sm:text-[72px] lg:text-[104px]">
                Entrenamiento
                <span className="block text-white/92">Profesional</span>
                <span className="block text-[#D4AF37]">en Mezcla &amp; Mastering</span>
              </h1>

              <div className="mt-8 grid max-w-[900px] gap-6 lg:grid-cols-[1fr_220px] lg:items-end">
                <p className="text-[20px] leading-[1.55] text-white/74 sm:text-[24px]">
                  No es un curso grabado.{" "}
                  <span className="text-[#D4AF37]">
                    Es un entrenamiento constante
                  </span>{" "}
                  para definir tu criterio profesional y crecer con una guía real.
                </p>

                <div className="rounded-[24px] border border-[#D4AF37]/20 bg-[#D4AF37]/8 px-5 py-4">
                  <p className="text-[12px] uppercase tracking-[0.22em] text-[#D4AF37]">
                    Liderado por
                  </p>
                  <p className="mt-2 text-[20px] font-medium text-white">
                    Matías Ledesma
                  </p>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#precio"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-7 py-4 text-[15px] font-semibold text-black transition hover:scale-[1.02]"
                >
                  Entrar al entrenamiento
                  <ArrowRight className="h-4 w-4" />
                </a>

                <a
                  href="#modalidad"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-7 py-4 text-[15px] font-semibold text-white transition hover:bg-white/[0.06]"
                >
                  Ver modalidad
                </a>
              </div>
            </div>

            <div className="lg:pb-2">
              <div className="grid gap-4">
                <div className="rounded-[30px] border border-white/10 bg-black/35 p-6 backdrop-blur-md">
                  <p className="text-[12px] uppercase tracking-[0.28em] text-[#D4AF37]">
                    Para quién es
                  </p>
                  <p className="mt-4 text-[18px] leading-[1.7] text-white/78">
                    Para productores que ya no quieren seguir consumiendo contenido
                    superficial y necesitan profundidad, criterio y acompañamiento.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
                    <p className="text-[12px] uppercase tracking-[0.22em] text-[#D4AF37]">
                      Formato
                    </p>
                    <p className="mt-3 text-[22px] font-medium leading-tight">
                      En vivo
                    </p>
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
                    <p className="text-[12px] uppercase tracking-[0.22em] text-[#D4AF37]">
                      Acceso
                    </p>
                    <p className="mt-3 text-[22px] font-medium leading-tight">
                      Grabaciones
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
              <p className="text-[13px] uppercase tracking-[0.24em] text-[#D4AF37]">
                Objetivo
              </p>
              <p className="mt-3 text-[18px] leading-[1.65] text-white/74">
                Que tomes decisiones mejores, más rápido y con fundamento.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
              <p className="text-[13px] uppercase tracking-[0.24em] text-[#D4AF37]">
                Enfoque
              </p>
              <p className="mt-3 text-[18px] leading-[1.65] text-white/74">
                Casos reales, criterio profesional y profundidad de verdad.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
              <p className="text-[13px] uppercase tracking-[0.24em] text-[#D4AF37]">
                Acompañamiento
              </p>
              <p className="mt-3 text-[18px] leading-[1.65] text-white/74">
                Soporte cercano para resolver dudas y recibir feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 lg:px-12 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-[13px] uppercase tracking-[0.3em] text-[#D4AF37]">
              Qué vas a conseguir
            </p>
            <h2 className="mt-5 text-[38px] font-light leading-[1.02] tracking-[-0.04em] sm:text-[58px]">
              Tres beneficios
              <span className="block text-[#D4AF37]">claros.</span>
            </h2>
            <p className="mt-6 max-w-[420px] text-[18px] leading-[1.75] text-white/68">
              Una estructura simple, visual y fuerte para mostrar rápido qué se
              obtiene al entrar.
            </p>
          </div>

          <div className="grid gap-5">
            {benefits.map((item, index) => {
              const Icon = item.icon
              return (
                <article
                  key={item.title}
                  className="group relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:border-[#D4AF37]/25 hover:bg-white/[0.05] sm:p-8"
                >
                  <div className="absolute right-5 top-5 text-[70px] font-light leading-none text-white/[0.04] sm:text-[92px]">
                    0{index + 1}
                  </div>

                  <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10">
                      <Icon className="h-6 w-6 text-[#D4AF37]" strokeWidth={1.8} />
                    </div>

                    <div className="max-w-[620px]">
                      <h3 className="text-[26px] font-medium tracking-[-0.03em] text-white sm:text-[32px]">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-[17px] leading-[1.8] text-white/72 sm:text-[18px]">
                        {item.text.split(item.highlight[0]).map((part, idx, arr) => (
                          <span key={idx}>
                            {part}
                            {idx < arr.length - 1 && (
                              <span className="font-medium text-[#D4AF37]">
                                {item.highlight[0]}
                              </span>
                            )}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 lg:px-12 lg:py-28">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[13px] uppercase tracking-[0.3em] text-[#D4AF37]">
                Además
              </p>
              <h2 className="mt-4 text-[38px] font-light leading-[1.02] tracking-[-0.04em] sm:text-[58px]">
                La formación no termina
                <span className="block text-[#D4AF37]">en lo técnico.</span>
              </h2>
            </div>

            <p className="max-w-[420px] text-[17px] leading-[1.75] text-white/66">
              Sumamos práctica, invitados y desarrollo profesional para que el
              proceso sea más completo.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="group overflow-hidden rounded-[34px] border border-white/10 bg-black">
              <div className="relative h-[520px] overflow-hidden">
                <img
                  src={extras[0].image}
                  alt={extras[0].title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                <div className="absolute bottom-0 left-0 max-w-[620px] p-7 sm:p-9">
                  <p className="text-[26px] font-medium leading-[1.2] text-[#D4AF37] sm:text-[34px]">
                    {extras[0].title}
                  </p>
                  <p className="mt-3 text-[18px] leading-[1.7] text-white/78 sm:text-[20px]">
                    {extras[0].text}
                  </p>
                </div>
              </div>
            </article>

            <div className="grid gap-5">
              {extras.slice(1).map((item) => (
                <article
                  key={item.title}
                  className="group overflow-hidden rounded-[34px] border border-white/10 bg-black"
                >
                  <div className="relative h-[248px] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 sm:p-7">
                      <p className="max-w-[420px] text-[22px] font-medium leading-[1.25] text-[#D4AF37]">
                        {item.title}
                      </p>
                      <p className="mt-2 max-w-[420px] text-[16px] leading-[1.7] text-white/76">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
  id="modalidad"
  className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 lg:px-12 lg:py-28"
>
  <div className="mb-12 max-w-[760px]">
    <p className="text-[13px] uppercase tracking-[0.3em] text-[#D4AF37]">
      Modalidad
    </p>

    <h2 className="mt-4 text-[40px] font-light leading-[1] tracking-[-0.05em] sm:text-[64px]">
      Una estructura clara
      <span className="block text-[#D4AF37]">para avanzar de verdad.</span>
    </h2>

    <p className="mt-6 max-w-[640px] text-[18px] leading-[1.8] text-white/68 sm:text-[20px]">
      No se trata de acumular información. Se trata de sostener un proceso con
      clases en vivo, acceso a grabaciones y una dinámica pensada para que no
      pierdas continuidad.
    </p>
  </div>

  <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
    <div className="rounded-[34px] border border-white/10 bg-white/[0.03] p-7 sm:p-8">
      <div className="space-y-6">
        <div>
          <p className="text-[12px] uppercase tracking-[0.24em] text-[#D4AF37]">
            Frecuencia
          </p>
          <p className="mt-2 text-[34px] font-light leading-none text-white sm:text-[46px]">
            4 clases
          </p>
          <p className="mt-2 text-[16px] text-white/58">por mes, en vivo por Zoom</p>
        </div>

        <div className="h-px bg-white/10" />

        <div>
          <p className="text-[12px] uppercase tracking-[0.24em] text-[#D4AF37]">
            Día y horario
          </p>
          <p className="mt-2 text-[28px] font-light leading-tight text-white sm:text-[38px]">
            Lunes 20:00
          </p>
          <p className="mt-2 text-[16px] text-white/58">Horario Argentina</p>
        </div>

        <div className="h-px bg-white/10" />

        <div>
          <p className="text-[12px] uppercase tracking-[0.24em] text-[#D4AF37]">
            Acceso
          </p>
          <p className="mt-2 text-[22px] leading-[1.6] text-white/76">
            Todas las clases quedan grabadas para que las veas cuando quieras.
          </p>
        </div>
      </div>
    </div>

    <div className="grid gap-4">
      {bullets.map((bullet, idx) => (
        <article
          key={idx}
          className="group rounded-[28px] border border-white/10 bg-[#0b0b0b] p-6 transition duration-300 hover:border-[#D4AF37]/20 hover:bg-white/[0.03] sm:p-7"
        >
          <div className="flex gap-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 text-[13px] font-semibold text-[#D4AF37]">
              0{idx + 1}
            </div>

            <div>
              <p className="text-[18px] leading-[1.8] text-white/78 sm:text-[20px]">
                <span className="font-medium text-white">{bullet.start}</span>
                {bullet.rest}
                {bullet.accent && (
                  <span className="font-medium text-[#D4AF37]">{bullet.accent}</span>
                )}
                {bullet.end}
              </p>
            </div>
          </div>
        </article>
      ))}

      <div className="rounded-[28px] border border-[#D4AF37]/20 bg-[#D4AF37]/7 p-6 sm:p-7">
        <p className="text-[12px] uppercase tracking-[0.22em] text-[#D4AF37]">
          En pocas palabras
        </p>
        <p className="mt-3 text-[18px] leading-[1.8] text-white/78 sm:text-[20px]">
          Una membresía pensada para que tengas{" "}
          <span className="text-[#D4AF37]">constancia, profundidad y seguimiento</span>,
          no solo contenido suelto.
        </p>
      </div>
    </div>
  </div>
</section>

<section
  id="precio"
  className="mx-auto max-w-[1280px] px-6 pb-24 md:px-10 lg:px-12 lg:pb-32"
>
  <div className="overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,#0d0d0f_0%,#070707_100%)]">
    <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="p-8 sm:p-10 lg:p-12">
        <p className="text-[13px] uppercase tracking-[0.3em] text-[#D4AF37]">
          Te espero adentro
        </p>

        <h2 className="mt-4 text-[42px] font-light leading-[0.98] tracking-[-0.05em] sm:text-[64px]">
          Sumate a
          <span className="block text-[#D4AF37]">Entrenamiento Focus</span>
        </h2>

        <p className="mt-6 max-w-[560px] text-[18px] leading-[1.85] text-white/68 sm:text-[20px]">
          Accedé a clases en vivo, grabaciones, feedback y una estructura que
          te ayude a crecer con más claridad y criterio profesional.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="#"
            className="inline-flex items-center justify-center rounded-full bg-[#D4AF37] px-7 py-4 text-[15px] font-semibold text-black transition hover:scale-[1.02]"
          >
            Quiero entrar ahora
          </a>

          <a
            href="https://wa.me/5493518736207?text=Hola%2C+quiero+consultar+por+Entrenamiento+Focus"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-7 py-4 text-[15px] font-semibold text-white transition hover:bg-white/[0.06]"
          >
            Consultar por WhatsApp
          </a>
        </div>

        <p className="mt-8 max-w-[580px] text-[14px] leading-[1.9] text-white/50 sm:text-[15px]">
          <span className="font-medium text-[#D4AF37]">Importante:</span> el correo
          de tu cuenta de Entrenamiento Focus tiene que coincidir con el correo de
          PayPal o Mercado Pago.
        </p>
      </div>

      <div className="border-t border-white/10 p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
        <div className="space-y-4">
          <article className="rounded-[30px] border border-[#D4AF37]/20 bg-[#D4AF37]/8 p-6">
            <p className="text-[12px] uppercase tracking-[0.22em] text-[#D4AF37]">
              Pago internacional
            </p>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-[18px] text-white/60">USD</span>
              <span className="text-[52px] font-light leading-none text-white sm:text-[68px]">
                15
              </span>
            </div>
            <p className="mt-3 text-[16px] text-white/70">PayPal</p>
          </article>

          <article className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-[12px] uppercase tracking-[0.22em] text-[#D4AF37]">
              Pago Argentina
            </p>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-[18px] text-white/60">ARS</span>
              <span className="text-[52px] font-light leading-none text-white sm:text-[68px]">
                19.500
              </span>
            </div>
            <p className="mt-3 text-[16px] text-white/70">MercadoPago</p>
          </article>

          <div className="pt-3">
            <p className="text-[15px] leading-[1.8] text-white/58">
              El pago se renueva automáticamente cada mes. Podés cancelar cuando quieras.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
    </main>
  )
}