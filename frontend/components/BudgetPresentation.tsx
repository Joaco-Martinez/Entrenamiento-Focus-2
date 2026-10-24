"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import type { BudgetContent } from "@/services/budgets.service";

type Props = {
  data: BudgetContent;
  title: string;
  clientName: string;
};

const money = (value: number) =>
  "$" + (Number(value) || 0).toLocaleString("es-AR", { maximumFractionDigits: 0 });

function safeWebLink(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

// Solo enlazamos perfiles reales de Instagram; el nombre se toma del editor.
function instagramProfileUrl(handle: string) {
  const trimmed = handle.trim();
  if (!trimmed) return null;

  let username = trimmed.replace(/^@/, "");
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (!["instagram.com", "www.instagram.com"].includes(url.hostname.toLowerCase())) return null;
      username = url.pathname.split("/").filter(Boolean)[0] || "";
    } catch {
      return null;
    }
  } else {
    username = username.replace(/^(?:www\.)?instagram\.com\//i, "").replace(/\/$/, "");
  }

  return /^[A-Za-z0-9._]{1,30}$/.test(username)
    ? "https://www.instagram.com/" + username + "/"
    : null;
}

function AnimatedHighlights({ items }: { items: NonNullable<BudgetContent["highlights"]> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }

    let frame = 0;
    let started = false;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some(entry => entry.isIntersecting) || started) return;
      started = true;
      const start = performance.now();
      const step = (now: number) => {
        const elapsed = Math.min(1, (now - start) / 1150);
        setProgress(1 - Math.pow(1 - elapsed, 3));
        if (elapsed < 1) frame = requestAnimationFrame(step);
        else observer.disconnect();
      };
      frame = requestAnimationFrame(step);
    }, { threshold: 0.2 });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  const animatedValue = (value: string) => {
    // Preservar métricas editables como "20 M+" y textos no numéricos.
    const parsed = value.match(/^(\d[\d.,]*)(.*)$/);
    if (!parsed) return value;
    const count = Number(parsed[1].replace(/[.,]/g, ""));
    if (!Number.isFinite(count)) return value;
    return Math.round(count * progress).toLocaleString("es-AR") + parsed[2];
  };

  return (
    <div
      ref={containerRef}
      aria-label="Trayectoria profesional"
      className="mt-8 grid grid-cols-2 overflow-hidden rounded-[24px] border border-[#302a22] bg-[#191918] shadow-[0_22px_46px_rgba(31,26,17,0.13)] md:grid-cols-4"
    >
      {items.map((item, index) => (
        <div
          key={index}
          role="group"
          aria-label={item.value + " " + item.label}
          className={
            "group relative min-w-0 px-5 py-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white/[0.06] hover:shadow-[0_12px_28px_rgba(229,189,66,0.09)] motion-reduce:transform-none motion-reduce:transition-none sm:px-7 sm:py-8 " +
            (index % 2 === 0 ? "border-r border-white/10 md:border-r-0 " : "") +
            (index < 2 ? "border-b border-white/10 md:border-b-0 " : "") +
            (index < items.length - 1 ? "md:border-r md:border-white/10 " : "")
          }
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
            style={{ background: "radial-gradient(circle at 50% 20%, rgba(229,189,66,0.12), transparent 72%)" }}
          />
          <div className="relative">
            <p
              aria-hidden="true"
              className="whitespace-nowrap text-[32px] font-black leading-none tracking-[-0.045em] text-[#e5bd42] transition-[color,filter] duration-300 group-hover:text-[#f5d779] group-hover:drop-shadow-[0_0_12px_rgba(229,189,66,0.3)] sm:text-[40px]"
            >
              {animatedValue(item.value)}
            </p>
            <div className="mt-4 h-[2px] w-7 rounded-full bg-[#e5bd42]/45 transition-all duration-300 group-hover:w-12 group-hover:bg-[#e5bd42]" />
            <p className="mt-3 max-w-[190px] text-[12px] leading-5 text-[#d8d2c5] sm:text-[13px]">
              {item.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({
  number,
  eyebrow,
  title,
  description,
}: {
  number: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.23em] text-[#98752c]">
          <span className="mr-3 text-[#a9a49c]">{number}</span>
          {eyebrow}
        </p>
        <h2 className="text-[30px] font-bold leading-[1.1] tracking-[-0.035em] text-[#171717] sm:text-4xl">
          {title}
        </h2>
      </div>
      {description && (
        <p className="max-w-sm text-sm leading-6 text-[#736f67] md:text-right">
          {description}
        </p>
      )}
    </div>
  );
}

function StudioImage({ url, index, featured = false }: { url: string; index: number; featured?: boolean }) {
  return (
    <div
      className={
        "group relative overflow-hidden rounded-2xl bg-[#252522] " +
        (featured ? "min-h-[280px] md:row-span-2 md:min-h-[440px]" : "min-h-[205px]")
      }
    >
      {url ? (
        <img
          src={url}
          alt={"Fotografía del estudio " + index}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_65%_30%,#484138,transparent_52%),linear-gradient(145deg,#292826,#151515)] px-5 text-center">
          <AudioLines className="h-9 w-9 text-[#dbb65c]/45" strokeWidth={1} />
          <span className="text-xs tracking-[0.18em] text-white/40">
            FOTO DEL ESTUDIO {String(index).padStart(2, "0")}
          </span>
        </div>
      )}
      <span className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-[#111]/45 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur">
        {String(index).padStart(2, "0")}
      </span>
    </div>
  );
}

export function BudgetPresentation({ data, title, clientName }: Props) {
  const services = data.services ?? [];
  const packages = data.packages ?? [];
  const extras = data.extras ?? [];
  const equipment = data.equipment ?? [];
  const photos = (data.studioImages ?? []).slice(0, 3);
  const subtotal = services.reduce((sum, service) => sum + (Number(service.price) || 0), 0);
  const discountPercent = Number(data.discountPercent) || 0;
  const total =
    data.totalOverride != null
      ? Number(data.totalOverride)
      : Math.max(0, Math.round(subtotal * (1 - discountPercent / 100)));
  const brandParts = (data.brand || "PROD BY KNNO").trim().split(/\s+/);
  const brandLast = brandParts.pop() || "KNNO";
  const brandFirst = brandParts.join(" ");
  const playlistHref = safeWebLink(data.playlistUrl || "");
  const instagramHref = instagramProfileUrl(data.instagram || "");
  const mapsHref = data.location?.trim()
    ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(data.location.trim())
    : null;
  const bioText = (data.bio || "").replace(/^Hola,\s*soy\s+Franco\s+Cano\s+y\s+/i, "");
  const cleanBio = bioText ? bioText.charAt(0).toUpperCase() + bioText.slice(1) : "";
  const phoneDigits = (data.phone || "").replace(/\D/g, "");
  const whatsappHref = phoneDigits.length >= 10 ? "https://wa.me/" + phoneDigits : null;
  const showClient = clientName.trim() && clientName.toLowerCase() !== "presentación general";
  const theme = { "--budget-accent": data.accent || "#e5bd42" } as CSSProperties;

  return (
    <main className="min-h-screen bg-[#f7f6f2] font-sans text-[#171717]" style={theme}>
      <header className="relative isolate overflow-hidden bg-[#131311] text-[#f8f6f0]">
        {data.heroImage && (
          <img
            src={data.heroImage}
            alt=""
            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35"
          />
        )}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(10,10,10,0.97)_5%,rgba(10,10,10,0.78)_65%,rgba(10,10,10,0.4)_100%)]" />
        <div className="pointer-events-none absolute -right-28 top-3 -z-10 h-72 w-72 rounded-full bg-[#d6af49]/10 blur-[90px]" />
        <div className="pointer-events-none absolute right-0 top-0 hidden h-full items-end gap-[7px] pr-12 opacity-20 md:flex">
          {[42, 85, 130, 67, 175, 105, 218, 146, 91, 160, 60, 119].map((height, i) => (
            <span key={i} className="mb-10 w-[6px] rounded-full bg-[#e5bd42]" style={{ height }} />
          ))}
        </div>

        <div className="mx-auto max-w-6xl px-5 pb-12 pt-10 sm:px-8 md:pb-16 md:pt-14">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.29em] text-white/55">
              Propuesta de producción musical
            </p>
            {playlistHref && (
              <a
                href={playlistHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-white/80 transition hover:text-[#e5bd42]"
              >
                Escuchar playlist <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </div>

          <div className="max-w-3xl pt-11 md:pt-14">
            <div className="mb-6 h-1 w-14 rounded-full" style={{ backgroundColor: "var(--budget-accent)" }} />
            <p className="text-[40px] font-black leading-none tracking-[-0.055em] sm:text-[58px] md:text-[78px]">
              {brandFirst}
              <span className="mt-1 block" style={{ color: "var(--budget-accent)" }}>
                {brandLast}
              </span>
            </p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
              {data.subtitle}
            </p>
            <h1 className="mt-8 max-w-2xl text-[24px] font-medium leading-[1.2] tracking-[-0.03em] text-white/95 sm:text-[31px]">
              {title || "Producción musical profesional"}
            </h1>
            {showClient && (
              <p className="mt-4 text-sm font-medium text-white/65">
                Preparado para <span className="text-white">{clientName}</span>
              </p>
            )}
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#paquetes"
                className="inline-flex min-h-12 items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-[#1a1711] transition hover:brightness-110"
                style={{ backgroundColor: "var(--budget-accent)" }}
              >
                Ver promociones <ArrowDown className="h-4 w-4" />
              </a>
              <a
                href="#servicios"
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Servicios individuales <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <nav aria-label="Secciones del presupuesto" className="sticky top-0 z-30 border-b border-[#25231f]/10 bg-[#f7f6f2]/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl gap-7 overflow-x-auto px-5 py-4 text-[12px] font-semibold text-[#666159] sm:px-8 sm:text-sm">
          <a className="whitespace-nowrap transition hover:text-[#151515]" href="#trayectoria">Presentación</a>
          <a className="whitespace-nowrap transition hover:text-[#151515]" href="#paquetes">Promociones</a>
          <a className="whitespace-nowrap transition hover:text-[#151515]" href="#servicios">Servicios</a>
          <a className="whitespace-nowrap transition hover:text-[#151515]" href="#estudio">Estudio</a>
          <a className="whitespace-nowrap transition hover:text-[#151515]" href="#condiciones">Condiciones</a>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <section id="trayectoria" className="scroll-mt-24 py-14 sm:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#98752c]">01 / Quién está detrás</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#181816] sm:text-[42px]">Hola, soy {data.producerName || "Franco Cano"}.</h2>
              <p className="mt-2 text-[16px] font-medium text-[#777168]">Producción, composición, grabación, mezcla y mastering.</p>
            </div>
            {playlistHref && <a href={playlistHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#242019]/15 px-5 py-3 text-sm font-semibold text-[#26231e] hover:bg-white">Escuchar trabajos <ArrowUpRight className="h-4 w-4"/></a>}
          </div>
          <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
            <div className="relative min-h-[265px] overflow-hidden rounded-[24px] bg-[#191917]">
              {data.portraitImage ? (
                <img src={data.portraitImage} alt="Fotografía de presentación del productor" className="absolute inset-0 h-full w-full object-cover"/>
              ) : (
                <div className="flex h-full min-h-[265px] flex-col justify-end bg-[radial-gradient(circle_at_75%_20%,#4f432b,transparent_55%),linear-gradient(145deg,#292825,#111110)] p-8">
                  <AudioLines className="mb-auto h-9 w-9 text-[#e5bd42]/70" strokeWidth={1}/>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">PROD BY</p>
                  <p className="mt-3 text-5xl font-black tracking-[-0.04em]" style={{color:"var(--budget-accent)"}}>{brandLast}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <div className="space-y-4">
                {cleanBio.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚ])/).reduce<string[]>((acc, sentence, index) => {
                  const group = Math.floor(index / 2);
                  acc[group] = acc[group] ? acc[group] + " " + sentence : sentence;
                  return acc;
                }, []).map((paragraph,index)=>(
                  <p key={index} className={"text-[15px] leading-[1.85] text-[#5d5851] sm:text-[17px] " + (index===0 ? "font-medium text-[#34312d]" : "")}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#242019]/10 pt-5 text-[13px] text-[#736d63]">
                {data.instagram && (instagramHref ? (
                  <a href={instagramHref} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md transition-colors hover:text-[#98752c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#98752c]">
                    {data.instagram}<ArrowUpRight className="h-3.5 w-3.5"/>
                  </a>
                ) : <span>{data.instagram}</span>)}
                {data.location && (mapsHref ? (
                  <a href={mapsHref} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md transition-colors hover:text-[#98752c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#98752c]">
                    <MapPin className="h-4 w-4"/>{data.location}<ArrowUpRight className="h-3.5 w-3.5"/>
                  </a>
                ) : <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4"/>{data.location}</span>)}
              </div>
            </div>
          </div>
          {!!data.highlights?.length && <AnimatedHighlights items={data.highlights} />}
        </section>

        <section id="paquetes" className="scroll-mt-24 py-14 sm:py-20">
          <SectionHeading
            number="02"
            eyebrow="Opciones disponibles"
            title="Paquetes promocionales"
            description="Compará los servicios incluidos y elegí la alternativa que mejor se adapte a tu proyecto."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {packages.map((pack, index) => (
              <article
                key={index}
                className="group flex h-full flex-col rounded-[24px] border border-[#242019]/10 bg-white p-6 shadow-[0_10px_32px_rgba(31,26,16,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-[#c5a058]/45 hover:shadow-[0_15px_40px_rgba(31,26,16,0.09)] sm:p-8"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#181816] text-xl font-black text-white">
                    {pack.name}
                  </div>
                  <div className="min-w-0 text-right">
                    <p className="text-[27px] font-black tracking-[-0.04em] text-[#181816] sm:text-[33px]">
                      {money(pack.price)}
                    </p>
                    {pack.installments > 1 && (
                      <p className="mt-1 text-xs font-medium text-[#857c6d]">
                        {pack.installments} pagos de {money(pack.price / pack.installments)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-7 h-px bg-[#1b1b19]/10" />
                <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-[#978561]">
                  Servicios incluidos
                </p>
                <p className="mt-3 flex-1 text-[15px] leading-7 text-[#514e48]">
                  {pack.description}
                </p>
                <div className="mt-7 h-[3px] w-14 rounded-full" style={{ backgroundColor: "var(--budget-accent)" }} />
              </article>
            ))}
          </div>
        </section>

        <section id="servicios" className="scroll-mt-24 border-t border-[#242019]/10 py-14 sm:py-20">
          <SectionHeading
            number="03"
            eyebrow="Precios detallados"
            title="Servicios individuales"
            description="Cada etapa del proceso, con su descripción y su valor por separado."
          />
          <div className="overflow-hidden rounded-[24px] border border-[#242019]/10 bg-white">
            <div className="hidden grid-cols-[minmax(0,1.15fr)_minmax(0,2.3fr)_minmax(125px,0.8fr)] gap-5 bg-[#191918] px-7 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white/75 md:grid">
              <span>Servicio</span>
              <span>Descripción</span>
              <span className="text-right">Precio</span>
            </div>
            {services.map((service, index) => (
              <div
                key={index}
                className="border-b border-[#242019]/10 px-5 py-6 last:border-0 sm:px-7 md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,2.3fr)_minmax(125px,0.8fr)] md:items-start md:gap-5"
              >
                <div className="flex items-start justify-between gap-4 md:block">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-[11px] font-bold tabular-nums text-[#a79c86]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-[16px] font-bold leading-6 text-[#20201d]">
                      {service.label}
                    </h3>
                  </div>
                  <p className="shrink-0 font-bold tabular-nums text-[#20201d] md:hidden">
                    {money(service.price)}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#69645d] md:mt-0">
                  {service.description}
                </p>
                <p className="hidden text-right text-[16px] font-bold tabular-nums text-[#20201d] md:block">
                  {money(service.price)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-5 rounded-[24px] bg-[#1a1a18] px-6 py-7 text-white sm:px-8">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                Resumen de servicios
              </p>
              <p className="text-sm text-white/65">Subtotal: {money(subtotal)}</p>
              {discountPercent > 0 && (
                <p className="text-sm text-white/65">Descuento: {discountPercent}%</p>
              )}
            </div>
            <div>
              <p className="text-xs text-white/55">Total</p>
              <p className="mt-1 text-[34px] font-black tracking-[-0.04em] sm:text-[42px]" style={{ color: "var(--budget-accent)" }}>
                {money(total)}
              </p>
            </div>
          </div>
          {data.note && (
            <p className="mt-4 text-sm leading-6 text-[#78746c]">{data.note}</p>
          )}
        </section>

        <section id="estudio" className="scroll-mt-24 border-t border-[#242019]/10 py-14 sm:py-20">
          <SectionHeading
            number="04"
            eyebrow="Espacio de trabajo"
            title={data.studioName || "Estudio"}
            description={data.studioText}
          />
          <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
            <div className="grid gap-3 sm:grid-cols-2 sm:grid-rows-2">
              {photos.map((url, index) => (
                <StudioImage
                  key={index}
                  url={url}
                  index={index + 1}
                  featured={index === 0}
                />
              ))}
            </div>
            {equipment.length > 0 && (
              <div className="rounded-[24px] border border-[#242019]/10 bg-white px-6 py-7 sm:px-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.19em] text-[#98752c]">
                  Equipamiento profesional
                </p>
                <h3 className="mt-3 text-[22px] font-bold tracking-[-0.02em]">
                  Equipo disponible
                </h3>
                <ul className="mt-6 grid gap-0 sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-1">
                  {equipment.map((item, index) => (
                    <li key={index} className="border-t border-[#23201b]/10 py-3 text-sm leading-5 text-[#5b5650]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section id="extras" className="border-t border-[#242019]/10 py-14 sm:py-20">
          <SectionHeading number="05" eyebrow="Servicios complementarios" title="Servicios extras" />
          <div className="grid gap-3 sm:grid-cols-2">
            {extras.map((extra, index) => (
              <article key={index} className="rounded-[20px] border border-[#242019]/10 bg-white p-6">
                <h3 className="text-[16px] font-bold text-[#20201d]">{extra.label}</h3>
                <p className="mt-3 text-sm leading-6 text-[#6d675f]">{extra.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="condiciones" className="scroll-mt-24 border-t border-[#242019]/10 py-14 sm:py-20">
          <SectionHeading number="06" eyebrow="Información importante" title="Condiciones y formas de pago" />
          <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
            <article className="rounded-[24px] border border-[#242019]/10 bg-white p-6 sm:p-8">
              <h3 className="text-lg font-bold">Términos y condiciones</h3>
              <p className="mt-4 whitespace-pre-wrap text-[14px] leading-7 text-[#666158]">
                {data.terms}
              </p>
            </article>
            <article className="rounded-[24px] border border-[#242019]/10 bg-white p-6 sm:p-8">
              <h3 className="text-lg font-bold">Métodos de pago</h3>
              <p className="mt-4 whitespace-pre-wrap text-[14px] leading-7 text-[#666158]">
                {data.paymentMethods}
              </p>
            </article>
          </div>
        </section>
      </div>

      <footer className="bg-[#171715] px-5 py-12 text-[#f8f6f0] sm:px-8 md:py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em]" style={{ color: "var(--budget-accent)" }}>
              Contacto
            </p>
            <p className="mt-4 text-[26px] font-bold leading-tight tracking-[-0.035em] sm:text-3xl">
              ¿Tenés alguna consulta sobre esta propuesta?
            </p>
            <p className="mt-3 text-sm text-white/55">
              {data.brand}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-[#1a1711] transition hover:brightness-110"
                style={{ backgroundColor: "var(--budget-accent)" }}>
                <Phone className="h-4 w-4" /> WhatsApp <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
            {data.email && (
              <a href={"mailto:" + data.email}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                <Mail className="h-4 w-4" /> Correo
              </a>
            )}
          </div>
        </div>
        <div className="mx-auto mt-9 flex max-w-6xl flex-wrap justify-between gap-3 border-t border-white/15 pt-5 text-xs text-white/40">
          <span>{data.brand}</span>
          <span>{data.location}</span>
        </div>
      </footer>
    </main>
  );
}
