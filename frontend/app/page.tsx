import Image from "next/image";
import Link from "next/link";

export default function EntrenamientoFocusPage() {
  return (
    <main className="mt-16 min-h-screen bg-[#111110] text-[#f0ede6]">
      <section className="relative overflow-hidden border-t border-[#c8a84b]/10">
        <div className="absolute inset-0">
          <Image
            src="/hero-cover.jpg"
            alt="Matias Ledesma y Franco Cano en el estudio"
            fill
            priority
            className="object-cover object-[72%_10%] sm:object-[center_20%]"
          />

          <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(17,17,16,0.97)_0%,rgba(17,17,16,0.88)_35%,rgba(17,17,16,0.62)_65%,rgba(17,17,16,0.32)_100%)] sm:block" />

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,17,16,0.96)_0%,rgba(17,17,16,0.82)_42%,rgba(17,17,16,0.48)_72%,rgba(17,17,16,0.20)_100%)] sm:hidden" />

          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#111110] via-[#111110]/90 to-transparent sm:hidden" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100dvh-64px)] max-w-[1180px] items-start px-6 pb-14 pt-24 sm:items-center sm:px-10 sm:py-16 lg:px-12">
          <div className="max-w-[520px] pt-2 sm:pt-6 md:pt-0">
            <span className="text-[13px] font-bold uppercase tracking-[0.3em] text-[#c8a84b]">
              Quiénes somos
            </span>

            <h1 className="mt-4 text-[38px] font-extrabold leading-[1.05] tracking-tight text-[#f0ede6] sm:text-[52px]">
              Matias Ledesma{" "}
              <span className="font-normal text-[#c8a84b]">·</span> Franco
              Cano
            </h1>

            <p className="mt-6 text-[19px] leading-[1.5] text-[#f0ede6]/80 sm:text-[23px]">
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
            <p className="max-w-4xl text-[19px] leading-[1.5] text-[#c8a84b] sm:text-[23px]">
              &quot;Para que dejes de trabajar solo y empieces a moverte en
              los círculos que realmente te hacen crecer.&quot;
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-10 sm:flex-row">
            <Link
              href="/servicios"
              className="group w-full max-w-[360px] rounded-xl border border-[#c8a84b]/30 bg-[#111110] px-14 py-5 text-center transition hover:bg-[#c8a84b] sm:w-auto"
            >
              <span className="text-[16px] font-bold text-[#f0ede6] transition group-hover:text-[#111110]">
                Servicios →
              </span>
            </Link>

            <Link
              href="/recursos"
              className="group w-full max-w-[360px] rounded-xl border border-[#c8a84b]/30 bg-[#111110] px-14 py-5 text-center transition hover:bg-[#c8a84b] sm:w-auto"
            >
              <span className="text-[16px] font-bold text-[#f0ede6] transition group-hover:text-[#111110]">
                Productos →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}