"use client";

import { useEffect, useState } from "react";
import { budgetsService, budgetDefaultFor, cleanMatiTerms, type Budget, type BudgetContent, type BudgetProducer, type BudgetCurrency } from "@/services/budgets.service";
import BudgetImageEditor from "@/components/budgets/BudgetImageEditor";
import type { BudgetImagePosition } from "@/services/budgets.service";
import { Copy, ExternalLink } from "lucide-react";

const inputClass = "w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white";
const btn = "rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20";

export default function BudgetsEditor({ producer, currency = "ARS" }: { producer: BudgetProducer; currency?: BudgetCurrency }) {
  const defaultBudget = budgetDefaultFor(producer, currency);
  const isMati = producer === "mati";
  const currencyName = currency === "USD" ? "dólares" : "pesos";
  const ownerLabel = producer === "fran" ? "Fran" : "Mati";
  const defaultTitle = producer === "fran" ? "Servicio profesional de producción musical" : "Mezcla y mastering profesional · " + currency;
  const [list, setList] = useState<Budget[]>([]);
  const [selected, setSelected] = useState<Budget | null>(null);
  const [content, setContent] = useState<BudgetContent>(() => structuredClone(defaultBudget));
  const [title, setTitle] = useState(defaultTitle);
  const [clientName, setClientName] = useState("Presentación general");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const refresh = async () => {
    try {
      const result = await budgetsService.list(producer);
      setList(producer === "mati"
        ? result.budgets.filter(b => (b.content?.currency === "USD" ? "USD" : "ARS") === currency)
        : result.budgets);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudieron cargar los presupuestos");
    }
  };

  useEffect(() => { void refresh(); }, [producer]);

  const patch = (key: keyof BudgetContent, value: any) => {
    setContent(previous => ({ ...previous, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const begin = (budget?: Budget) => {
    setSelected(budget ?? null);
    setTitle(budget?.title ?? defaultTitle);
    setClientName(budget?.clientName ?? "Presentación general");
    const initialContent = structuredClone(budget?.content ?? defaultBudget);
    // Presupuestos de Fran anteriores: mostrar en el editor su playlist oficial.
    if (producer === "fran" && !initialContent.playlistUrl?.trim()) {
      initialContent.playlistUrl = defaultBudget.playlistUrl;
    }
    if (isMati) {
      initialContent.currency = currency;
      initialContent.terms = cleanMatiTerms(initialContent.terms ?? "");
    }
    setContent(initialContent);
    setNotice("");
    setHasUnsavedChanges(false);
  };

  const save = async () => {
    if (!title.trim() || !clientName.trim()) {
      setNotice("Completá el título y destinatario.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      // Guardar genera/activa automáticamente el enlace privado, sin casilla adicional.
      const currencyContent = isMati ? { ...content, currency, terms: cleanMatiTerms(content.terms ?? "") } : content;
      const result = selected
        ? await budgetsService.update(selected.id, producer, { title, clientName, content: currencyContent, shared: true })
        : await budgetsService.create({ producer, title, clientName, content: currencyContent, shared: true });
      setSelected(result.budget);
      setHasUnsavedChanges(false);
      setNotice(selected?.shared
        ? "Cambios guardados. El enlace del artista ya está actualizado."
        : "Presupuesto guardado. Ya podés copiar el enlace y abrir la vista previa.");
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setBusy(false);
    }
  };

  const erase = async () => {
    if (!selected || !confirm("¿Eliminar este presupuesto?")) return;
    setBusy(true);
    try {
      await budgetsService.remove(selected.id, producer);
      begin();
      await refresh();
      setNotice("Presupuesto eliminado");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Error al eliminar");
    } finally {
      setBusy(false);
    }
  };

  const upload = async (file: File, key: "heroImage" | "portraitImage", index?: number) => {
    setBusy(true);
    try {
      const result = await budgetsService.uploadImage(file);
      if (index === undefined) {
        patch(key, result.url);
      } else {
        patch("studioImages", content.studioImages.map((url, i) => i === index ? result.url : url));
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo subir la imagen");
    } finally {
      setBusy(false);
    }
  };

  const updateRow = (name: "services" | "packages" | "extras", index: number, field: string, value: string | number) => {
    const rows = [...(content[name] as any[])];
    rows[index] = { ...rows[index], [field]: value };
    patch(name, rows);
  };

  const removeRow = (name: "services" | "packages" | "extras", index: number) => {
    patch(name, (content[name] as any[]).filter((_, i) => i !== index));
  };

  const addRow = (name: "services" | "packages" | "extras") => {
    const item = name === "services" ? { label: "Nuevo servicio", description: "", price: 0 }
      : name === "packages" ? { name: producer === "fran" ? "Nuevo paquete" : "Nuevo servicio", description: "", price: 0, installments: producer === "fran" ? 2 : 1 }
      : { label: "Nuevo extra", description: "" };
    patch(name, [...(content[name] as any[]), item]);
  };

  const textInput = (name: keyof BudgetContent, description: string, large = false) => (
    <label className="block space-y-2 text-sm text-white/70" key={name}>
      <span>{description}</span>
      {large ? (
        <textarea rows={4} className={inputClass} value={String(content[name] ?? "")}
          onChange={e => patch(name, e.target.value)} />
      ) : (
        <input className={inputClass} value={String(content[name] ?? "")}
          onChange={e => patch(name, e.target.value)} />
      )}
    </label>
  );

  const imageInput = (name: "heroImage" | "portraitImage", description: string, index?: number) => {
    const key = index === undefined ? name : "studioImage" + index;
    const value = index === undefined ? content[name] : content.studioImages[index] ?? "";
    const aspectRatio = name === "heroImage" && index === undefined ? "16 / 7" : index === undefined ? "4 / 5" : "16 / 9";

    const updatePosition = (position: BudgetImagePosition) =>
      patch("imagePositions", { ...(content.imagePositions ?? {}), [key]: position });

    return (
      <BudgetImageEditor
        key={key}
        label={description}
        url={value}
        aspectRatio={aspectRatio}
        disabled={busy}
        position={content.imagePositions?.[key]}
        onPositionChange={updatePosition}
        onUrlChange={next => index === undefined
          ? patch(name, next)
          : patch("studioImages", content.studioImages.map((url, i) => i === index ? next : url))}
        onUpload={file => {void upload(file, name, index)}}
      />
    );
  };

  // Siempre se abre la versión guardada, igual que la que recibe el artista.
  // No se ofrecen enlaces de presupuestos que todavía son borradores.
  const artistPath = selected?.shared ? "/presupuesto/" + selected.shareToken : null;
  const copyArtistLink = async () => {
    if (!artistPath) return;
    try {
      await navigator.clipboard.writeText(window.location.origin + artistPath);
      setNotice("Enlace para el artista copiado.");
    } catch {
      setNotice("No se pudo copiar el enlace. Podés abrirlo y copiar la dirección desde el navegador.");
    }
  };
  const renderSaveButton = () => (
    <button
      type="button"
      disabled={busy}
      onClick={() => { void save(); }}
      className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#e5bd42] px-4 py-2 text-sm font-bold text-[#191919] transition-colors hover:bg-[#f0cc6b] disabled:cursor-wait disabled:opacity-60"
    >
      {busy ? "Guardando..." : selected?.shared ? "Guardar cambios" : "Guardar y generar enlace"}
    </button>
  );

  const renderArtistActions = () => (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => { void copyArtistLink(); }}
        disabled={!artistPath || busy}
        title={artistPath ? "Copiar el enlace de la versión guardada" : "Primero guardá para generar el enlace"}
        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#e5bd42]/40 bg-[#e5bd42]/10 px-4 py-2 text-sm font-semibold text-[#f4d67d] transition-colors hover:bg-[#e5bd42]/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Copy className="h-4 w-4" aria-hidden="true" />
        Copiar enlace
      </button>
      {artistPath ? (
        <a
          href={artistPath}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir la página del artista, con la última versión guardada"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Vista previa
        </a>
      ) : (
        <button
          type="button"
          disabled
          title="Primero guardá para generar el enlace"
          className="inline-flex min-h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/40"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Vista previa
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-yellow-300">Enlaces privados</p>
          <h1 className="mt-2 text-3xl font-black">Presupuestos {ownerLabel}</h1>
          <p className="mt-2 text-sm text-white/60">{producer === "fran" ? "Gestioná los presupuestos de Fran sin mezclarlos con los de Mati." : "Presupuestos de mezcla y mastering en " + currencyName + ", con sus propios enlaces y tarifas editables."}</p>
        </div>
        <button className={btn} onClick={() => begin()}>+ Nuevo presupuesto</button>
      </header>
      {isMati && (
        <nav aria-label="Elegir moneda del presupuesto" className="flex flex-wrap gap-2">
          <a href="/admin/presupuestos/mati/pesos"
            aria-current={currency === "ARS" ? "page" : undefined}
            className={"rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors " + (currency === "ARS" ? "border-[#e5bd42] bg-[#e5bd42] text-[#171717]" : "border-white/20 bg-white/5 text-white hover:bg-white/15")}>
            <span aria-hidden="true">🇦🇷</span> Presupuestos en pesos
          </a>
          <a href="/admin/presupuestos/mati/dolares"
            aria-current={currency === "USD" ? "page" : undefined}
            className={"rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors " + (currency === "USD" ? "border-[#e5bd42] bg-[#e5bd42] text-[#171717]" : "border-white/20 bg-white/5 text-white hover:bg-white/15")}>
            <span aria-hidden="true">🌎</span> Presupuestos en dólares
          </a>
        </nav>
      )}
      {notice && <p className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">{notice}</p>}
      <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="space-y-2">
          {list.map(b => (
            <button key={b.id} onClick={() => begin(b)} className={btn + " w-full text-left"}>
              <span className="block font-semibold">{b.clientName}</span>
              <span className="mt-1 block text-xs text-white/50">{b.shared ? "Enlace listo para compartir" : "Sin enlace: guardá para activarlo"}</span>
            </button>
          ))}
          {!list.length && <p className="text-sm text-white/50">Todavía no hay presupuestos de {ownerLabel}.</p>}
        </aside>
        <div className="min-w-0 space-y-6">
          <div className="flex flex-wrap gap-2">
            {renderSaveButton()}
            {renderArtistActions()}
            {selected && <button className={btn} onClick={erase}>Eliminar</button>}
          </div>
          <p className="text-xs leading-5 text-white/60">
            {hasUnsavedChanges && selected?.shared
              ? "Tenés cambios sin guardar. La vista previa y el enlace muestran la última versión guardada."
              : selected?.shared
                ? "El enlace ya está listo. Copialo para enviarlo al artista o abrí Vista previa en otra pestaña."
                : "Primero seleccioná Guardar y generar enlace. Después podrás copiarlo o abrir la vista previa."}
          </p>

          <div className="space-y-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <section className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm">Destinatario<input className={inputClass} value={clientName} onChange={e => { setClientName(e.target.value); setHasUnsavedChanges(true); }} /></label>
                <label className="space-y-2 text-sm">Título<input className={inputClass} value={title} onChange={e => { setTitle(e.target.value); setHasUnsavedChanges(true); }} /></label>
                <label className="space-y-2 text-sm">Color principal <input type="color" value={content.accent || "#e5bd42"} onChange={e => patch("accent", e.target.value)} /></label>
              </section>
              <section className="grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
                <h2 className="col-span-full text-xl font-bold">Presentación</h2>
                {textInput("brand", "Marca")}
                <label className="block space-y-2 text-sm text-white/70 sm:col-span-2">Nombre profesional
                  <input className={inputClass} value={content.producerName ?? ""} onChange={e => patch("producerName",e.target.value)}/>
                </label>
                <div className="space-y-3 sm:col-span-2">
                  <p className="text-sm font-semibold text-white/80">Cifras destacadas de la presentación</p>
                  {(content.highlights ?? []).map((item,i)=>(
                    <div key={i} className="grid gap-3 sm:grid-cols-[130px_1fr]">
                      <input aria-label={"Cifra "+(i+1)} className={inputClass} value={item.value} onChange={e=>patch("highlights",(content.highlights??[]).map((v,j)=>i===j?{...v,value:e.target.value}:v))}/>
                      <input aria-label={"Descripción de cifra "+(i+1)} className={inputClass} value={item.label} onChange={e=>patch("highlights",(content.highlights??[]).map((v,j)=>i===j?{...v,label:e.target.value}:v))}/>
                    </div>
                  ))}
                </div>
                {textInput("subtitle", "Subtítulo")}
                <div className="sm:col-span-2">{textInput("bio", "Biografía", true)}</div>
                {textInput("instagram", "Instagram")}
                {textInput("email", "Email")}
                {textInput("phone", "Teléfono")}
                {textInput("location", "Ubicación")}
                {textInput("playlistUrl", producer === "fran" ? "Playlist de Spotify (se actualiza desde Spotify)" : "Enlace a playlist")}
                {imageInput("heroImage", "Portada")}
                {imageInput("portraitImage", "Foto de presentación")}
              </section>

              <section className="space-y-4 border-t border-white/10 pt-6">
                <h2 className="text-xl font-bold">Servicios y precios {isMati ? "· " + currency : ""}</h2>
                {isMati && <p className="text-sm text-white/60">Cada servicio puede abonarse en 2 pagos de igual importe; el cliente verá ambos valores automáticamente.</p>}
                {content.services.map((row,i) => (
                  <div key={i} className="grid gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-[1fr_120px]">
                    <input className={inputClass} value={row.label} onChange={e => updateRow("services", i, "label", e.target.value)} />
                    {(producer === "fran" || currency === "ARS") ? (
                      <label className="text-xs text-white/60">Precio ARS<input aria-label={"Precio ARS de " + row.label} type="number" min={0} className={inputClass} value={row.price} onChange={e => updateRow("services", i, "price", Number(e.target.value))} /></label>
                    ) : (
                      <label className="text-xs text-white/60">Precio USD<input aria-label={"Precio USD de " + row.label} type="number" min={0} className={inputClass} value={row.usdPrice ?? ""} onChange={e => updateRow("services", i, "usdPrice", e.target.value === "" ? 0 : Number(e.target.value))} /></label>
                    )}
                    <textarea rows={2} className={inputClass} value={row.description} onChange={e => updateRow("services", i, "description", e.target.value)} />
                    <button className={btn} onClick={() => removeRow("services", i)}>Quitar</button>
                  </div>
                ))}
                <button className={btn} onClick={() => addRow("services")}>+ Servicio</button>
                {producer === "fran" && <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">Descuento %<input type="number" min={0} max={100} className={inputClass} value={content.discountPercent} onChange={e => patch("discountPercent", Math.min(100, Number(e.target.value)))} /></label>
                  <label className="text-sm">Total manual (opcional)<input type="number" className={inputClass} placeholder="Total automático" value={content.totalOverride ?? ""} onChange={e => patch("totalOverride", e.target.value ? Number(e.target.value) : null)} /></label>
                </div>}
                {textInput("note", "Nota")}
              </section>

              <section className="space-y-4 border-t border-white/10 pt-6">
                <h2 className="text-xl font-bold">Paquetes promocionales{isMati ? " · 4 canciones · " + currency : ""}</h2>
                {isMati && (
                  <p className="text-sm leading-6 text-white/60">
                    Ingresá la tarifa <strong className="text-white/80">por canción</strong>. La página calcula automáticamente el precio total del pack de 4 canciones, el ahorro frente a los precios individuales y los 2 pagos iguales.
                  </p>
                )}
                {content.packages.map((row,i) => (
                  <div key={i} className="grid gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-3">
                    <input className={inputClass} value={row.name} onChange={e => updateRow("packages", i, "name", e.target.value)} />
                    {(producer === "fran" || currency === "ARS") ? (
                      <label className="text-xs text-white/60">Precio por canción ARS<input aria-label={"Precio ARS por cantidad de " + row.name} type="number" min={0} className={inputClass} value={row.price} onChange={e => updateRow("packages", i, "price", Number(e.target.value))} /></label>
                    ) : (
                      <label className="text-xs text-white/60">Precio por canción USD<input aria-label={"Precio USD por cantidad de " + row.name} type="number" min={0} className={inputClass} value={row.usdPrice ?? ""} onChange={e => updateRow("packages", i, "usdPrice", e.target.value === "" ? 0 : Number(e.target.value))} /></label>
                    )}
                    {producer === "fran" && (
                      <input type="number" min={1} className={inputClass} value={row.installments} onChange={e => updateRow("packages", i, "installments", Math.max(1, Number(e.target.value)))} />
                    )}
                    <textarea className={inputClass + " sm:col-span-2"} value={row.description} onChange={e => updateRow("packages", i, "description", e.target.value)} />
                    <button className={btn} onClick={() => removeRow("packages", i)}>Quitar</button>
                  </div>
                ))}
                <button className={btn} onClick={() => addRow("packages")}>+ Paquete promocional</button>
              </section>
              <section className="space-y-4 border-t border-white/10 pt-6">
                <h2 className="text-xl font-bold">Servicios extras</h2>
                {content.extras.map((row,i) => (
                  <div key={i} className="grid gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-2">
                    <input className={inputClass} value={row.label} onChange={e => updateRow("extras", i, "label", e.target.value)} />
                    <button className={btn} onClick={() => removeRow("extras", i)}>Quitar</button>
                    <textarea className={inputClass + " sm:col-span-2"} value={row.description} onChange={e => updateRow("extras", i, "description", e.target.value)} />
                  </div>
                ))}
                <button className={btn} onClick={() => addRow("extras")}>+ Servicio extra</button>
              </section>
              <section className="space-y-4 border-t border-white/10 pt-6">
                <h2 className="text-xl font-bold">Condiciones</h2>
                {textInput("terms", "Términos y condiciones", true)}
                {textInput("paymentMethods", "Métodos de pago", true)}
              </section>
              <section className="space-y-4 border-t border-white/10 pt-6">
                <h2 className="text-xl font-bold">Estudio y equipamiento</h2>
                {textInput("studioName", "Nombre del estudio")}
                {textInput("studioText", "Presentación del estudio", true)}
                <div className="grid gap-3 sm:grid-cols-3">
                  {content.studioImages.map((_,i) => <div key={i}>{imageInput("heroImage", "Imagen del estudio " + (i+1), i)}</div>)}
                </div>
                <label className="block space-y-2 text-sm">Equipamiento (uno por línea)
                  <textarea rows={10} className={inputClass} value={content.equipment.join("\n")} onChange={e => patch("equipment", e.target.value.split("\n"))} />
                </label>
              </section>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <div className="flex flex-wrap items-center gap-2">
              {renderSaveButton()}
              {renderArtistActions()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
