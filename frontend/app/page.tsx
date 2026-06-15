import Image from "next/image";
import Link from "next/link";

export default function EntrenamientoFocusPage() {
  return (
    <main className="mt-16 min-h-screen bg-[#111110] text-[#f0ede6]">
      <section className="grid grid-cols-1 items-center gap-8 border-t border-[#c8a84b]/10 px-5 py-12 md:grid-cols-2 md:gap-16 md:px-12 md:py-16">
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-[#111110]">
          <Image
            src="/matifran.png"
            alt="Franco Cano y Matias Ledesma en el estudio"
            fill
            priority
            className="object-contain object-left"
          />

          <div className="absolute inset-0 bg-linear-to-t from-[#111110]/40 to-transparent" />
        </div>

        <div className="flex flex-col gap-5">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c8a84b]">
            Quiénes somos
          </span>

          <h1 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-[#f0ede6] md:text-4xl">
            Matias Ledesma{" "}
            <span className="font-normal text-[#c8a84b]">·</span> Franco Cano
          </h1>

          <p className="max-w-130 text-sm leading-8 text-[#888880] md:text-[15px]">
            Productor e ingeniero de mezcla y mastering.{" "}
            <span className="text-[#c8a84b]">Dos obsesionados</span> por el
            aprendizaje constante y con un objetivo claro: compartir todo lo
            que sabemos. Pensamos primero en la música desde lo artístico, y
            luego la traducimos en decisiones claras dentro de la arquitectura
            técnica del sonido.
          </p>
        </div>
      </section>

      <section className="border-t border-[#c8a84b]/10 px-5 py-12 md:px-12 md:py-16">
        <div className="mb-11 flex flex-col items-center text-center">
          <p className="max-w-4xl text-lg italic leading-relaxed text-[#c8a84b] md:text-[22px]">
            &quot;Para que dejes de trabajar solo y empieces a moverte en los
            círculos que realmente te hacen crecer.&quot;
          </p>
        </div>

        <div className="grid overflow-hidden rounded-md border border-[#c8a84b]/10 md:grid-cols-3">
          <Link
            href="/entrenamiento-focus"
            className="group relative min-h-30 cursor-pointer border-b border-[#c8a84b]/10 bg-[#111110] p-8 transition hover:bg-[#c8a84b] md:border-b-0 md:border-r"
          >
            <h2 className="text-[22px] font-extrabold text-[#f0ede6] transition group-hover:text-[#111110] md:text-[26px]">
              Mentoría
            </h2>

            <span className="absolute bottom-6 right-6 text-xl text-[#c8a84b] transition group-hover:text-[#111110]">
              →
            </span>
          </Link>

          <Link
            href="/servicios"
            className="group relative min-h-30 cursor-pointer border-b border-[#c8a84b]/10 bg-[#111110] p-8 transition hover:bg-[#c8a84b] md:border-b-0 md:border-r"
          >
            <h2 className="text-[22px] font-extrabold text-[#f0ede6] transition group-hover:text-[#111110] md:text-[26px]">
              Servicios
            </h2>

            <span className="absolute bottom-6 right-6 text-xl text-[#c8a84b] transition group-hover:text-[#111110]">
              →
            </span>
          </Link>

          <Link
            href="/recursos"
            className="group relative min-h-30 cursor-pointer bg-[#111110] p-8 transition hover:bg-[#c8a84b]"
          >
            <h2 className="text-[22px] font-extrabold text-[#f0ede6] transition group-hover:text-[#111110] md:text-[26px]">
              Productos
            </h2>

            <span className="absolute bottom-6 right-6 text-xl text-[#c8a84b] transition group-hover:text-[#111110]">
              →
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}