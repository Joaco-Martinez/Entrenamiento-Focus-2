export default function MentoriaPage() {
  const pillars = [
    "Producción musical",
    "Mezcla",
    "Mastering",
    "Marketing y networking",
    "Organización y hábitos profesionales",
    "Feedback personalizado y soporte cercano",
  ];

  const benefits = [
    "Clases en vivo para hacer preguntas en tiempo real",
    "4 clases por mes, todos los lunes a las 20:00",
    "Cada clase dura 1 hora",
    "Todas las clases quedan grabadas en la plataforma",
    "Soporte directo por WhatsApp durante la semana",
    "Posibilidad de enviar canciones para recibir feedback",
  ];

  const cards = [
    {
      title: "Sin secretos",
      text: "Enseñamos todo lo que no podemos mostrar en reels o tutoriales cortos. Acá profundizamos de verdad.",
    },
    {
      title: "En vivo",
      text: "Podés hacer preguntas en cada clase y resolver dudas reales con acompañamiento directo.",
    },
    {
      title: "Crecimiento real",
      text: "No trabajamos solo lo técnico: también vemos marketing, contactos, ingresos, hábitos y desarrollo profesional.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_45%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-1 text-sm font-medium text-[#f4d97c]">
                Mentoría privada
              </span>

              <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                Entrenamiento Focus
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 md:text-lg">
                Una mentoría privada donde vas a aprender de dos mentores sobre
                producción, mezcla y mastering. Acá enseñamos todo lo que no
                podemos enseñar en reels o tutoriales. Profundizamos de verdad y
                compartimos conocimientos reales, sin guardarnos secretos.
              </p>

              <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
                Nuestro objetivo es que puedas destacar dentro de la industria,
                con clases en vivo, acompañamiento cercano y una formación que va
                mucho más allá de lo técnico.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#cupos"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
                >
                  Quiero sumarme
                </a>
                <a
                  href="#modalidad"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                >
                  Ver modalidad
                </a>
              </div>
            </div>

            <div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
                <div className="rounded-[24px] border border-[#D4AF37]/20 bg-black/30 p-6">
                  <p className="text-sm uppercase tracking-[0.25em] text-[#D4AF37]">
                    Qué trabajamos
                  </p>
                  <div className="mt-6 grid gap-3">
                    {pillars.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
                        <p className="text-sm text-white/85 md:text-base">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-12">
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/70">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#D4AF37]">
                Más que clases técnicas
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                Trabajamos lo que realmente te hace crecer.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">
                Además de producción, mezcla y mastering, también vemos marketing
                para que puedas crear nuevas redes de contacto e ingresos,
                desarrollo profesional, sistemas de organización, hábitos,
                invitados especiales y herramientas concretas para crecer dentro
                de la industria.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#D4AF37]/20 bg-[#D4AF37]/8 p-8">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#f4d97c]">
                Acompañamiento
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-white">
                Soporte real durante toda la semana.
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/75">
                Vas a tener soporte directo por WhatsApp para resolver dudas y
                también la posibilidad de enviar canciones para recibir feedback,
                sentirte acompañado y avanzar con una guía cercana.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="modalidad" className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#D4AF37]">
            Modalidad
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Simple, clara y pensada para que avances de verdad.
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {benefits.map((item) => (
            <div
              key={item}
              className="rounded-[24px] border border-white/10 bg-[#101015] p-6"
            >
              <p className="text-base leading-7 text-white/80">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-base leading-8 text-white/75">
            Esta mentoría es ideal si ya tenés una base sólida y necesitás
            conocimiento nuevo desde un nivel intermedio a avanzado. Es una
            suscripción mensual y podés cancelar cuando quieras.
          </p>
        </div>
      </section>

      <section id="cupos" className="pb-20">
        <div className="mx-auto max-w-5xl px-6 md:px-10 lg:px-12">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#16161d] to-[#0d0d11] p-8 text-center shadow-2xl md:p-12">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#D4AF37]">
              Cupos limitados
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              Si podés realizar el pago, todavía quedan lugares disponibles.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/70">
              Si hacés clic en el botón de abajo y todavía tenés la posibilidad de
              pagar, significa que aún hay cupos dentro de Entrenamiento Focus.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-2xl bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
              >
                Unirme ahora
              </a>
              <a
                href="https://wa.me/"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
