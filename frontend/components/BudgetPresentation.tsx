import type { CSSProperties } from "react";
import { AnimatedHighlights } from "@/components/budgets/AnimatedHighlights";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Banknote,
  CalendarDays,
  Check,
  CircleCheck,
  CreditCard,
  FileText,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Wallet,
  WalletCards,
} from "lucide-react";
import type { BudgetContent } from "@/services/budgets.service";

type Props = {
  data: BudgetContent;
  title: string;
  clientName: string;
  showFloatingWhatsApp?: boolean;
};

const money = (value: number) =>
  "$" + (Number(value) || 0).toLocaleString("es-AR", { maximumFractionDigits: 0 });

// Resalta únicamente el inicio de la descripción sin alterar el contenido editable.
function splitDescriptionLead(description: string): [string, string] {
  const value = description || "";
  const firstStop = value.search(/[.!?](?=\s|$)/);
  if (firstStop >= 0 && firstStop < 65) {
    return [value.slice(0, firstStop + 1), value.slice(firstStop + 1)];
  }
  const match = value.match(/^(\S+(?:\s+\S+){0,6})([\s\S]*)$/);
  return match ? [match[1], match[2]] : [value, ""];
}

// Separar únicamente enumeraciones de servicios sin alterar su contenido.
function includedServices(description: string): string[] {
  const text = description.trim().replace(/\.\s*$/, "");
  if (!text) return [];
  const parts: string[] = [];
  let current = "";
  let parentheses = 0;
  for (const char of text) {
    if (char === "(") parentheses++;
    if (char === ")") parentheses = Math.max(0, parentheses - 1);
    if (char === "," && parentheses === 0) {
      if (current.trim()) parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts.flatMap(part =>
    /^mezcla y mastering$/i.test(part) ? ["Mezcla", "Mastering"] : [part]
  );
}

function WhatsAppLogo() {
  return (
    <svg
            viewBox="0 0 24 24"
            className="relative h-7 w-7 fill-white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M20.52 3.48A11.78 11.78 0 0 0 12.05 0C5.5 0 .18 5.32.18 11.87c0 2.09.55 4.13 1.6 5.93L0 24l6.39-1.67a11.83 11.83 0 0 0 5.66 1.45h.01c6.55 0 11.87-5.32 11.87-11.87 0-3.17-1.23-6.14-3.41-8.43zM12.06 21.3h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.79.99 1.01-3.69-.22-.38a9.4 9.4 0 0 1-1.45-5.02c0-5.21 4.24-9.45 9.45-9.45 2.52 0 4.88.98 6.66 2.76a9.36 9.36 0 0 1 2.77 6.67c0 5.21-4.24 9.45-9.44 9.45zm5.2-7.08c-.28-.14-1.65-.81-1.91-.9-.26-.1-.45-.14-.64.14-.19.28-.73.9-.89 1.09-.17.19-.33.21-.61.07-.28-.14-1.17-.43-2.23-1.37-.82-.73-1.37-1.63-1.53-1.91-.16-.28-.02-.43.12-.57.12-.12.28-.31.42-.47.14-.17.19-.28.28-.47.1-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.55-.47-.47-.64-.48h-.55c-.19 0-.5.07-.76.35-.26.28-1 1-1 2.43 0 1.43 1.03 2.81 1.17 3 .14.19 2.02 3.08 4.9 4.32.68.29 1.2.46 1.61.59.68.22 1.3.19 1.79.12.55-.08 1.65-.67 1.88-1.32.23-.66.23-1.22.16-1.33-.07-.12-.26-.19-.55-.33z"/>
          </svg>
  );
}

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

const safeNumber = (value: number | undefined, fallback: number, min: number, max: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};

// Esta transformación se resuelve en SSR; el navegador solo aplica estilos CSS.
function positionStyle(data: BudgetContent, key: string): CSSProperties {
  const crop = data.imagePositions?.[key];
  if (!crop) return {};
  const x = safeNumber(crop.x, 50, 0, 100);
  const y = safeNumber(crop.y, 50, 0, 100);
  const zoom = safeNumber(crop.zoom, 1, 1, 2.5);
  return { objectPosition: x + "% " + y + "%", transformOrigin: x + "% " + y + "%", transform: "scale(" + zoom + ")" };
}

function StudioImage({ url, index, featured = false, style }: { url: string; index: number; featured?: boolean; style?: CSSProperties }) {
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
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={style}
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

export function BudgetPresentation({ data, title, clientName, showFloatingWhatsApp = true }: Props) {
  // Solo la presentación divide el texto: los términos originales siguen editables
  // en el panel de administración, sin duplicarlos en otro campo.
  const termsText = data.terms ?? "";
  const secondTermStart = termsText.search(/Los servicios de grabaci[oó]n\b/i);
  const paymentTerms = secondTermStart > 0
    ? [
        { kind: "two", title: "En dos pagos", description: termsText.slice(0, secondTermStart).trim() },
        { kind: "one", title: "En un solo pago", description: termsText.slice(secondTermStart).trim() },
      ]
    : [{ kind: "general", title: "Condiciones de contratación", description: termsText.trim() }];
  const paymentMethods = (data.paymentMethods ?? "")
    .split(/[,;\n]+/)
    .map(method => method.trim().replace(/\.$/, ""))
    .filter(Boolean);
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
  // El WhatsApp pertenece al productor indicado en este presupuesto, no a Focus.
  const phoneDigits = (data.phone || "").replace(/\D/g, "");
  const whatsappHref = phoneDigits.length >= 10 && phoneDigits.length <= 15
    ? "https://wa.me/" + phoneDigits
    : null;
  const firstName = (data.producerName || "Franco").trim().split(/\s+/)[0] || "Franco";
  const whatsappLink = (message: string) =>
    whatsappHref ? whatsappHref + "?text=" + encodeURIComponent(message) : undefined;
  const generalWhatsappLink = whatsappLink(
    "Hola " + firstName + ", estuve viendo tu presupuesto y quisiera hacerte una consulta."
  );
  const showClient = clientName.trim() && clientName.toLowerCase() !== "presentación general";
  const theme = { "--budget-accent": data.accent || "#e5bd42" } as CSSProperties;

  return (
    <main className="min-h-screen bg-[#f7f6f2] font-sans text-[#171717]" style={theme}>
      <header className="relative isolate overflow-hidden bg-[#131311] text-[#f8f6f0]">
        {data.heroImage && (
          <img
            src={data.heroImage}
            alt=""
            style={positionStyle(data, "heroImage")}
            decoding="async"
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
                <img src={data.portraitImage} alt="Fotografía de presentación del productor" style={positionStyle(data, "portraitImage")} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover"/>
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

        <section
          id="paquetes"
          className="scroll-mt-24 py-14 sm:py-20"
        >
          <SectionHeading
            number="02"
            eyebrow="Opciones disponibles"
            title="Paquetes promocionales"
            description="Compará los servicios incluidos y elegí la alternativa que mejor se adapte a tu proyecto."
          />

          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            {packages.map((pack, index) => (
              <article
                key={index}
                className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-[#d5cfc3] bg-white/95 p-6 shadow-[0_10px_35px_rgba(39,31,15,0.035)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-[#b79956] hover:shadow-[0_22px_46px_rgba(39,31,15,0.10)] motion-reduce:transform-none motion-reduce:transition-none sm:p-8"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-[#d8ac43] transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none"
                />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#1a1a18] text-lg font-black text-[#e4bd5c] transition-colors duration-300 group-hover:text-[#f5d582] sm:h-12 sm:w-12">
                      {pack.name}
                    </span>
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-[#665943] transition-colors duration-300 group-hover:text-[#8c6721]">
                      Paquete {pack.name}
                    </span>
                  </div>
                  <div className="min-w-0 text-right">
                    <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8d7953] sm:text-[10px]">Precio promocional</p>
                    <p className="text-[27px] font-black leading-none tracking-[-0.045em] text-[#98701f] tabular-nums transition-colors duration-300 group-hover:text-[#795518] sm:text-[34px]">
                      {money(pack.price)}
                    </p>
                    {pack.installments > 1 && (
                      <p className="mt-2 text-[12px] font-medium text-[#6d685e] tabular-nums">
                        {pack.installments} pagos de {money(pack.price / pack.installments)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="my-6 h-px bg-[#26221e]/10" />
                <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#96783c]">
                  Servicios incluidos
                </p>
                <ul className="mt-4 grid flex-1 content-start gap-x-4 gap-y-3 sm:grid-cols-2">
                  {includedServices(pack.description).map((service, serviceIndex) => (
                    <li key={serviceIndex} className="flex items-start gap-2.5 text-[14px] font-medium leading-[1.55] text-[#34312b]">
                      <span className="mt-[3px] flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border border-[#e5d2a7] bg-[#f4e7c9] text-[#91691d] transition-[background-color,border-color] duration-300 group-hover:border-[#d8b56c] group-hover:bg-[#f0dfb3]">
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span>{service}</span>
                    </li>
                  ))}
                </ul>
                {whatsappHref && (
                  <a
                    href={whatsappLink("Hola " + firstName + ", quiero contratar el paquete " + pack.name + " de producción musical.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#d5bb84] px-4 py-2 text-xs font-bold text-[#8e6b2a] transition-[color,background-color,border-color] duration-200 hover:border-[#b99a56] hover:bg-[#f5ecd8] hover:text-[#60430f]"
                  >
                    Consultar paquete {pack.name} <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
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
          <div className="rounded-[24px] border border-[#242019]/10 bg-white">
            <div className="hidden grid-cols-[minmax(0,1.15fr)_minmax(0,2.3fr)_minmax(125px,0.8fr)] gap-5 rounded-t-[23px] bg-[#191918] px-7 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white/75 md:grid">
              <span>Servicio</span>
              <span>Descripción</span>
              <span className="text-right">Precio</span>
            </div>
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative z-0 border-b border-[#242019]/10 bg-white px-5 py-6 transition-[transform,box-shadow,background-color] duration-300 ease-out last:rounded-b-[23px] last:border-0 hover:z-10 hover:bg-[#faf8f1] hover:shadow-[0_12px_28px_rgba(31,26,17,0.12)] motion-safe:md:hover:scale-[1.012] motion-reduce:transform-none sm:px-7 md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,2.3fr)_minmax(125px,0.8fr)] md:items-start md:gap-5"
              >
                <div className="flex items-start justify-between gap-4 md:block">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-[11px] font-bold tabular-nums text-[#a79c86]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-[16px] font-bold leading-6 text-[#20201d] transition-colors duration-300 group-hover:text-[#986c22]">
                      {whatsappHref ? (
                        <a
                          href={whatsappLink("Hola " + firstName + ", quiero contratar el servicio de " + service.label + ".")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#986c22]"
                          aria-label={"Consultar por WhatsApp el servicio de " + service.label}
                        >
                          {service.label}
                        </a>
                      ) : service.label}
                    </h3>
                  </div>
                  <p className="shrink-0 font-bold tabular-nums text-[#916822] md:hidden">
                    {money(service.price)}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#69645d] transition-colors duration-300 group-hover:text-[#35322e] md:mt-0">
                  <strong className="font-semibold text-[#39352e]">{splitDescriptionLead(service.description)[0]}</strong>
                  {splitDescriptionLead(service.description)[1]}
                </p>
                <div className="hidden text-right md:block">
                  <p className="text-[16px] font-bold tabular-nums text-[#916822]">
                    {money(service.price)}
                  </p>
                  {whatsappHref && (
                    <a
                      href={whatsappLink("Hola " + firstName + ", quiero contratar el servicio de " + service.label + ".")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#8e6b2a] underline-offset-4 hover:text-[#684c1c] hover:underline"
                    >
                      Consultar <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                {whatsappHref && (
                  <a
                    href={whatsappLink("Hola " + firstName + ", quiero contratar el servicio de " + service.label + ".")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[#8e6b2a] underline-offset-4 hover:underline md:hidden"
                  >
                    Consultar este servicio <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-5 rounded-[24px] bg-[#1a1a18] px-6 py-7 text-white sm:px-8">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                {total < subtotal ? "Producción completa · precio promocional" : "Resumen de servicios"}
              </p>
              {total < subtotal ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-white/60">Total por separado</span>
                  <span className="text-lg font-semibold text-white/55 line-through decoration-[#d8ab55] decoration-2 tabular-nums">
                    {money(subtotal)}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-white/65">Subtotal: {money(subtotal)}</p>
              )}
              {data.totalOverride == null && discountPercent > 0 && (
                <p className="text-sm text-white/65">Descuento: {discountPercent}%</p>
              )}
              {total < subtotal && <p className="text-xs text-white/55">Precio por contratación conjunta de los servicios</p>}
            </div>
            <div>
              <p className="text-xs text-white/55">{total < subtotal ? "Precio promocional" : "Total"}</p>
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
                  style={positionStyle(data, "studioImage" + index)}
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
              <article key={index} className="rounded-[20px] border border-[#242019]/10 bg-white p-6 transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out hover:border-[#c9b184] hover:bg-[#f6f0e5] hover:shadow-[0_12px_28px_rgba(48,36,14,0.08)] motion-safe:hover:-translate-y-1 motion-reduce:transition-none">
                <h3 className="text-[16px] font-bold text-[#20201d]">{extra.label}</h3>
                <p className="mt-3 text-sm leading-6 text-[#6d675f]">{extra.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="condiciones" className="scroll-mt-24 border-t border-[#242019]/10 py-14 sm:py-20">
          <SectionHeading number="06" eyebrow="Información importante" title="Condiciones y formas de pago" />
          <div className="grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-12">
            <div>
              <div className="flex items-center gap-3">
                <FileText aria-hidden="true" className="h-6 w-6 text-[#a67c27]" strokeWidth={1.8}/>
                <h3 className="text-xl font-bold tracking-[-0.02em] text-[#24211d]">Términos y condiciones</h3>
              </div>
              <div className="mt-4 h-[3px] w-11 rounded-full bg-[#a67c27]"/>
              <div className="mt-6 space-y-4">
                {paymentTerms.map((item, index) => (
                  <div
                    key={index}
                    className="group -mx-3 flex gap-3 rounded-2xl px-3 py-3 transition-[background-color,transform] duration-300 ease-out hover:bg-[#f0e8d9]/60 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"
                  >
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0e5cc] text-[#956d20] transition-[background-color,transform] duration-300 group-hover:bg-[#e9d6ac] motion-safe:group-hover:scale-105 motion-reduce:transform-none">
                      {item.kind === "two" ? <CalendarDays aria-hidden="true" className="h-5 w-5" strokeWidth={1.8}/> : item.kind === "one" ? <CircleCheck aria-hidden="true" className="h-5 w-5" strokeWidth={1.8}/> : <FileText aria-hidden="true" className="h-5 w-5" strokeWidth={1.8}/>}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-[15px] font-bold text-[#28241e]">{item.title}</h4>
                      <p className="mt-1 whitespace-pre-wrap text-[14px] leading-7 text-[#6a645b]">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:border-l md:border-[#29241c]/10 md:pl-10">
              <div className="flex items-center gap-3">
                <Wallet aria-hidden="true" className="h-6 w-6 text-[#a67c27]" strokeWidth={1.8}/>
                <h3 className="text-xl font-bold tracking-[-0.02em] text-[#24211d]">Métodos de pago</h3>
              </div>
              <div className="mt-4 h-[3px] w-11 rounded-full bg-[#a67c27]"/>
              <ul className="mt-6">
                {paymentMethods.map((method, index) => (
                  <li key={index} className="border-b border-[#29241c]/10 last:border-b-0">
                    <div className="group -mx-3 flex items-center gap-3 rounded-xl px-3 py-3.5 transition-[background-color,transform] duration-300 ease-out hover:bg-[#f0e8d9]/60 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0e5cc] text-[#956d20] transition-[background-color,transform] duration-300 group-hover:bg-[#e9d6ac] motion-safe:group-hover:scale-105 motion-reduce:transform-none">
                        {/efectivo/i.test(method) ? <Banknote aria-hidden="true" className="h-5 w-5" strokeWidth={1.8}/> : /transferencia|bancaria/i.test(method) ? <Landmark aria-hidden="true" className="h-5 w-5" strokeWidth={1.8}/> : /billetera|virtual/i.test(method) ? <WalletCards aria-hidden="true" className="h-5 w-5" strokeWidth={1.8}/> : <CreditCard aria-hidden="true" className="h-5 w-5" strokeWidth={1.8}/>}
                      </span>
                      <span className="text-[15px] font-medium text-[#39342e]">{method}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {showFloatingWhatsApp && generalWhatsappLink && (
        <a
          href={generalWhatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={"Consultar por WhatsApp a " + (data.producerName || "Franco")}
          title={"Contactar por WhatsApp a " + (data.producerName || "Franco")}
          className="group fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-[transform,box-shadow] duration-300 hover:scale-110 hover:shadow-[0_0_28px_rgba(37,211,102,0.45)] motion-reduce:transform-none"
        >
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366]/30 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
          <WhatsAppLogo />
        </a>
      )}

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
            {generalWhatsappLink && (
              <a href={generalWhatsappLink} target="_blank" rel="noopener noreferrer"
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
