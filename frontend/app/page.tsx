import Image from "next/image";
import Link from "next/link";

export default function EntrenamientoFocusPage() {
  return (
    <main className="mt-16 min-h-screen bg-[#111110] text-[#f0ede6]">
      {/* Hero mobile: foto arriba, texto abajo, sin superposición */}
      <section className="border-t border-[#c8a84b]/10 sm:hidden">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Image
            src="/hero-cover-mobile.jpg"
            alt="Matias Ledesma y Franco Cano en el estudio"
            fill
            priority
            className="object-cover object-[45%_50%]"
          />
        </div>

        <div className="px-6 py-10">
          <span className="text-[13px] font-bold uppercase tracking-[0.3em] text-[#c8a84b]">
            Quiénes somos
          </span>

          <h1 className="mt-4 text-[34px] font-extrabold leading-[1.05] tracking-tight text-[#f0ede6]">
            Matias Ledesma{" "}
            <span className="font-normal text-[#c8a84b]">·</span> Franco Cano
          </h1>

          <p className="mt-6 text-[17px] leading-[1.5] text-[#f0ede6]/80">
            <span className="font-medium text-[#c8a84b]">Dos obsesionados</span> por la
            producción y el audio.
            <br />
            Nos involucramos de lleno en cada proyecto y compartimos el camino
            detrás de cada resultado.
          </p>
        </div>
      </section>

      {/* Hero desktop: el mismo que ya estaba, sin cambios, solo oculto en mobile */}
      <section className="relative hidden overflow-hidden border-t border-[#c8a84b]/10 sm:block">
        <div className="absolute inset-0">
          <Image
            src="/hero-cover.jpg"
            alt="Matias Ledesma y Franco Cano en el estudio"
            fill
            priority
            className="object-cover object-[center_20%]"
          />

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,17,16,0.78)_0%,rgba(17,17,16,0.55)_35%,rgba(17,17,16,0.22)_65%,rgba(17,17,16,0.04)_100%)]" />
        </div>

        <div className="relative flex min-h-[calc(100dvh-64px)] items-center py-16 pl-[380px] pr-10 lg:pr-12">
          <div className="max-w-[520px]">
            <span className="text-[13px] font-bold uppercase tracking-[0.3em] text-[#c8a84b]">
              Quiénes somos
            </span>

            <h1 className="mt-4 text-[52px] font-extrabold leading-[1.05] tracking-tight text-[#f0ede6]">
              Matias Ledesma{" "}
              <span className="font-normal text-[#c8a84b]">·</span> Franco Cano
            </h1>

            <p className="mt-6 text-[23px] leading-[1.5] text-[#f0ede6]/80">
              <span className="font-medium text-[#c8a84b]">Dos obsesionados</span> por la
              producción y el audio.
              <br />
              Nos involucramos de lleno en cada proyecto y compartimos el camino
              detrás de cada resultado.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[#c8a84b]/10 px-5 py-12 md:px-12 md:py-16">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-11 flex flex-col items-center text-center">
            <p className="max-w-4xl text-[19px] font-semibold leading-[1.5] text-[#f0ede6] sm:text-[24px]">
              &quot;Para que dejes de trabajar solo y empieces a moverte en
              los círculos que realmente te hacen crecer.&quot;
            </p>
          </div>

          <div className="grid grid-cols-2 justify-items-center gap-x-8 gap-y-2 sm:flex sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-10 sm:gap-y-3">
            <Link
              href="/clases"
              className="rounded-full px-3 py-3 text-center text-[14px] font-semibold text-[#f0ede6]/70 underline-offset-4 transition hover:text-[#d8b85b] hover:underline sm:text-[16px]"
            >
              Clases →
            </Link>

            <Link
              href="/servicios"
              className="rounded-full px-3 py-3 text-center text-[14px] font-semibold text-[#f0ede6]/70 underline-offset-4 transition hover:text-[#d8b85b] hover:underline sm:text-[16px]"
            >
              Servicios →
            </Link>

            <Link
              href="/recursos"
              className="rounded-full px-3 py-3 text-center text-[14px] font-semibold text-[#f0ede6]/70 underline-offset-4 transition hover:text-[#d8b85b] hover:underline sm:text-[16px]"
            >
              Productos →
            </Link>

            <Link
              href="/articulos"
              className="rounded-full px-3 py-3 text-center text-[14px] font-semibold text-[#f0ede6]/70 underline-offset-4 transition hover:text-[#d8b85b] hover:underline sm:text-[16px]"
            >
              Artículos →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}