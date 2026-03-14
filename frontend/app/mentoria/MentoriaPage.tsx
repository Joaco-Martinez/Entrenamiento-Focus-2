export default function MentoriaPage() {
  const benefits = [
    "Sesión 1 a 1 personalizada",
    "Plan de acción claro y aplicable",
    "Revisión de tu proyecto, marca o negocio",
    "Seguimiento estratégico para avanzar más rápido",
  ];

  const steps = [
    {
      title: "Completás tu solicitud",
      description:
        "Me contás en qué punto estás, qué necesitás resolver y cuál es tu objetivo principal.",
    },
    {
      title: "Analizamos tu situación",
      description:
        "Reviso tu caso para que la mentoría sea directa, útil y enfocada en resultados reales.",
    },
    {
      title: "Tenemos la sesión",
      description:
        "Trabajamos sobre estrategia, bloqueos, decisiones y próximos pasos concretos.",
    },
    {
      title: "Te llevás un plan claro",
      description:
        "Terminás con prioridad, enfoque y un camino definido para ejecutar.",
    },
  ];

  const cards = [
    {
      title: "Emprendedores",
      text: "Si querés ordenar tu idea, vender mejor o destrabar tu negocio.",
    },
    {
      title: "Creadores",
      text: "Si necesitás claridad para monetizar, posicionarte o armar una oferta más fuerte.",
    },
    {
      title: "Freelancers",
      text: "Si querés mejorar tu propuesta, cerrar más clientes y crecer con estrategia.",
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
                Mentoría personalizada
              </span>

              <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                Convertí tus ideas en un plan claro y ejecutable.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-white/70 md:text-lg">
                Una mentoría pensada para ayudarte a tomar mejores decisiones,
                ordenar tu estrategia y avanzar con claridad en tu proyecto,
                marca o negocio.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#reservar"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
                >
                  Reservar mentoría
                </a>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                >
                  Ver cómo funciona
                </a>
              </div>
            </div>

            <div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
                <div className="rounded-[24px] border border-[#D4AF37]/20 bg-black/30 p-6">
                  <p className="text-sm uppercase tracking-[0.25em] text-[#D4AF37]">
                    Qué incluye
                  </p>
                  <div className="mt-6 space-y-4">
                    {benefits.map((item) => (
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

      <section
        id="como-funciona"
        className="border-y border-white/10 bg-white/[0.02]"
      >
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-12">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#D4AF37]">
              Cómo funciona
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Un proceso simple, directo y enfocado.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-[24px] border border-white/10 bg-[#101015] p-6"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37] text-sm font-bold text-black">
                  0{index + 1}
                </span>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-8">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#D4AF37]">
              Para quién es
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Para personas que quieren dejar de improvisar.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">
              Esta mentoría es ideal si sentís que tenés potencial, pero te falta
              estructura, enfoque o una estrategia real para avanzar. Trabajamos
              sobre tu caso puntual, sin vueltas y con una mirada práctica.
            </p>
          </div>

          <div className="rounded-[28px] border border-[#D4AF37]/20 bg-[#D4AF37]/8 p-8">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#f4d97c]">
              Resultado
            </p>
            <h3 className="mt-4 text-2xl font-semibold text-white">
              Más claridad. Mejor estrategia. Próximos pasos concretos.
            </h3>
            <p className="mt-4 text-sm leading-7 text-white/75">
              La idea no es llenarte de teoría. La idea es que salgas sabiendo qué
              hacer, qué corregir y cómo avanzar de forma más inteligente.
            </p>
          </div>
        </div>
      </section>

      <section id="reservar" className="pb-20">
        <div className="mx-auto max-w-5xl px-6 md:px-10 lg:px-12">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#16161d] to-[#0d0d11] p-8 text-center shadow-2xl md:p-12">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#D4AF37]">
              Reservá tu lugar
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              Una mentoría para avanzar de verdad.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/70">
              Si querés, podés conectar este bloque con un formulario, WhatsApp o
              checkout para tomar reservas directamente desde la página.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="https://wa.me/"
                className="inline-flex items-center justify-center rounded-2xl bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
              >
                Reservar por WhatsApp
              </a>
              <a
                href="mailto:tuemail@correo.com"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Consultar por email
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
