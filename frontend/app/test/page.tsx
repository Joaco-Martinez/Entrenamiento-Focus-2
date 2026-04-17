import { Music, Zap, MessageCircle } from "lucide-react"
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
        "https://res.cloudinary.com/deb7jg37j/image/upload/v1776441781/Cuadrado_4_foutob.png",
      title: "Recibirás material para practicar",
      text: "todo lo visto en clases.",
    },
    {
      image:
        "https://res.cloudinary.com/deb7jg37j/image/upload/v1776441791/Cuadrado_5_inryct.png",
      title: "Traemos invitados especiales",
      text: "aportando distintos puntos de vista y conocimientos.",
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
    <main className="min-h-screen bg-black text-white mt-16">
      <section className="relative overflow-hidden border-b border-[#22180d]">
        <div className="absolute inset-0 bg-black/30" />
        <div
  className="absolute inset-0 bg-cover bg-no-repeat"
  style={{
    backgroundImage: `
      linear-gradient(
        90deg,
        rgba(0,0,0,0.96) 0%,
        rgba(0,0,0,0.85) 35%,
        rgba(0,0,0,0.5) 65%,
        rgba(0,0,0,0.3) 100%
      ),
      url('https://res.cloudinary.com/deb7jg37j/image/upload/v1776440143/Imagen_principal_c1vw7k.png')
    `,
    backgroundPosition: "center 15%", // 🔥 CLAVE
  }}
/>

        <div className="relative mx-auto flex min-h-[760px] max-w-[1180px] items-center px-6 py-16 md:px-10 lg:px-12">
          <div className="max-w-[520px] pt-6 md:pt-0">
            <h1 className="text-[42px] font-light leading-[1.05] tracking-[-0.03em] sm:text-[56px] lg:text-[68px]">
              <span className="block">Entrenamiento</span>
              <span className="block">Profesional en</span>
              <span className="block text-[#e2a650]">Mezcla &amp; Mastering</span>
            </h1>

            <p className="mt-8 text-[24px] leading-[1.5] text-white/75 sm:text-[28px]">
              No es un curso grabado.
              <br />
              <span className="font-medium text-[#e2a650]">Es un entrenamiento constante,</span>
              <br />
              para definir tu criterio profesional.
            </p>

            <button className="mt-10 rounded-full bg-[#e3ae68] px-8 py-4 text-[22px] font-semibold text-black transition hover:scale-[1.02] hover:bg-[#efbb77]">
              Entrar al entrenamiento
            </button>

            <p className="mt-10 text-[18px] uppercase tracking-[0.08em] text-white/60">
              Liderado por <span className="font-semibold text-[#e2a650]">Matías Ledesma</span>
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 py-16 md:px-10 lg:px-12 lg:py-24">
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          <div className="h-px flex-1 max-w-[260px] bg-[#aa7b2a]" />
          <div className="text-center">
            <h2 className="text-[34px] font-light sm:text-[54px]">Qué vas a conseguir</h2>
            <p className="mt-3 text-[18px] text-white/75 sm:text-[28px]">
              Tres beneficios <span className="font-semibold text-[#e2a650]">claros, sin vueltas.</span>
            </p>
          </div>
          <div className="h-px flex-1 max-w-[260px] bg-[#aa7b2a]" />
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3 lg:gap-7">
{benefits.map((item) => {
  const Icon = item.icon

  return (
    <article
      key={item.title}
      className="rounded-[22px] border border-[#5c3f18] bg-black px-6 py-7 text-center transition-all duration-300"
    >
      <div className="mb-4 flex justify-center">
        <Icon className="h-7 w-7 text-[#e2a650]" strokeWidth={1.9} />
      </div>

      <h3 className="text-[20px] font-light leading-tight tracking-[-0.02em] text-white sm:text-[24px]">
        {item.title}
      </h3>

      <p className="mt-3 text-[15px] leading-[1.7] text-white/72 sm:text-[17px]">
        {item.text.split(item.highlight[0]).map((part, index, arr) => (
          <span key={index}>
            {part}
            {index < arr.length - 1 && (
              <span className="font-medium text-[#e2a650]">
                {item.highlight[0]}
              </span>
            )}
          </span>
        ))}
      </p>
    </article>
  )
})}

        </div>
      </section>

<section className="mx-auto max-w-[1180px] px-6 pb-16 md:px-10 lg:px-12 lg:pb-24">
  <h2 className="mb-8 text-center text-[34px] font-medium tracking-[-0.03em] text-[#e2a650] sm:mb-10 sm:text-[46px]">
    Además
  </h2>

  <div className="grid gap-5 md:grid-cols-3 lg:gap-7">
    {extras.map((item) => (
      <article
        key={item.title}
        className="group overflow-hidden rounded-[26px] border border-[#6f4f1d] bg-black"
      >
        <div className="relative h-[320px] overflow-hidden sm:h-[390px]">
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            style={{ objectPosition: item.position || "center" }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 px-5 pb-5 sm:px-6 sm:pb-6">
            <p className="max-w-[92%] text-[17px] leading-[1.45] text-white/82 sm:text-[18px]">
              <span className="font-semibold text-[#e2a650]">{item.title}</span>{" "}
              {item.highlight ? (
                <>
                  <span className="font-semibold text-[#e2a650]">{item.highlight}</span>
                  {item.text}
                </>
              ) : (
                item.text
              )}
            </p>
          </div>
        </div>
      </article>
    ))}
  </div>
</section>

      <section className="mx-auto max-w-[1180px] px-6 py-16 md:px-10 lg:px-12 lg:py-24">
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          <div className="h-px flex-1 max-w-[260px] bg-[#aa7b2a]" />
          <h2 className="text-center text-[42px] font-medium tracking-[0.08em] text-[#dfaa53] sm:text-[72px]">
            MODALIDAD:
          </h2>
          <div className="h-px flex-1 max-w-[260px] bg-[#aa7b2a]" />
        </div>

        <div className="mx-auto mt-14 max-w-[980px] space-y-10 sm:space-y-14">
          {bullets.map((bullet, idx) => (
            <div key={idx} className="flex items-start gap-4 sm:gap-8">
              <div className="pt-1 text-[28px] text-[#e2a650] sm:text-[38px]">✓</div>
              <p className="text-[24px] leading-[1.55] text-white/90 sm:text-[34px]">
                <span className="font-semibold text-white">{bullet.start}</span>
                {bullet.rest}
                {bullet.accent && <span className="text-[#e2a650]">{bullet.accent}</span>}
                {bullet.end}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 flex items-center justify-center gap-4 sm:gap-8">
          <div className="h-px flex-1 max-w-[260px] bg-[#aa7b2a]" />
          <div className="flex items-center gap-4 text-center text-[28px] tracking-[0.04em] text-[#e2a650] sm:text-[46px]">
            <span>↓</span>
            <span>TE ESPERO ADENTRO</span>
            <span>↓</span>
          </div>
          <div className="h-px flex-1 max-w-[260px] bg-[#aa7b2a]" />
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:gap-8">
          <article className="rounded-[34px] border border-[#d79d35] px-8 py-12 text-center sm:px-10 sm:py-14">
            <div className="text-[48px] font-medium text-[#e2a650] sm:text-[74px]">$15 USD</div>
            <p className="mt-4 text-[22px] text-white/88 sm:text-[34px]">
              pago por <span className="font-semibold text-white">PayPal</span>
            </p>
          </article>

          <article className="rounded-[34px] border border-[#d79d35] px-8 py-12 text-center sm:px-10 sm:py-14">
            <div className="text-[48px] font-medium text-[#e2a650] sm:text-[74px]">$19.500 ARG</div>
            <p className="mt-4 text-[22px] text-white/88 sm:text-[34px]">
              pago por <span className="font-semibold text-white">MercadoPago</span>
            </p>
          </article>
        </div>

        <p className="mx-auto mt-16 max-w-[980px] text-center text-[20px] leading-[1.8] text-white/82 sm:mt-20 sm:text-[28px]">
          <span className="font-semibold text-[#e2a650]">Importante:</span> el correo de tu cuenta de Entrenamiento Focus tiene que coincidir con el correo de PayPal o Mercado Pago.
        </p>
      </section>

      <a
        href="#"
        className="fixed bottom-6 right-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[#22c55e] text-[30px] shadow-[0_0_30px_rgba(34,197,94,0.45)] transition hover:scale-105"
        aria-label="WhatsApp"
      >
        💬
      </a>
    </main>
  )
}
