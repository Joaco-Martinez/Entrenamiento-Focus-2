"use client";

import { useEffect, useState } from "react";
import { budgetsService, defaultBudget, type Budget, type BudgetContent } from "@/services/budgets.service";
import { BudgetPresentation } from "@/components/BudgetPresentation";

const inputClass = "w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white";
const btn = "rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20";

export default function AdminBudgetsPage() {
  const [list, setList] = useState<Budget[]>([]);
  const [selected, setSelected] = useState<Budget | null>(null);
  const [content, setContent] = useState<BudgetContent>(() => structuredClone(defaultBudget));
  const [title, setTitle] = useState("Servicio profesional de producción musical");
  const [clientName, setClientName] = useState("Presentación general");
  const [shared, setShared] = useState(false);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const refresh = async () => {
    try {
      const result = await budgetsService.list();
      setList(result.budgets);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudieron cargar los presupuestos");
    }
  };

  useEffect(() => { void refresh(); }, []);

  const patch = (key: keyof BudgetContent, value: any) => {
    setContent(previous => ({ ...previous, [key]: value }));
  };

  const begin = (budget?: Budget) => {
    setSelected(budget ?? null);
    setTitle(budget?.title ?? "Servicio profesional de producción musical");
    setClientName(budget?.clientName ?? "Presentación general");
    setShared(budget?.shared ?? false);
    setContent(structuredClone(budget?.content ?? defaultBudget));
    setNotice("");
    setPreview(false);
  };

  const save = async () => {
    if (!title.trim() || !clientName.trim()) {
      setNotice("Completá el título y destinatario.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const result = selected
        ? await budgetsService.update(selected.id, { title, clientName, shared, content })
        : await budgetsService.create({ title, clientName, content });
      const saved = !selected && shared
        ? (await budgetsService.update(result.budget.id, { title, clientName, content, shared: true })).budget
        : result.budget;
      setSelected(saved);
      setShared(saved.shared);
      setNotice("Presupuesto guardado");
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
      await budgetsService.remove(selected.id);
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
      : name === "packages" ? { name: "Nuevo paquete", description: "", price: 0, installments: 2 }
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
    const value = index === undefined ? content[name] : content.studioImages[index] ?? "";
    return (
      <div className="space-y-2 rounded-xl border border-white/10 p-3">
        <p className="text-sm text-white/70">{description}</p>
        {value && <img src={value} alt="" className="h-32 w-full rounded-lg object-cover" />}
        <input className={inputClass} value={value}
          onChange={e => index === undefined ? patch(name, e.target.value) : patch("studioImages", content.studioImages.map((v, i) => i === index ? e.target.value : v))} />
        <input type="file" accept="image/png,image/jpeg,image/webp" className="w-full text-xs"
          onChange={e => { const file = e.target.files?.[0]; if (file) void upload(file, name, index); }} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-yellow-300">Enlaces privados</p>
          <h1 className="mt-2 text-3xl font-black">Presupuestos</h1>
          <p className="mt-2 text-sm text-white/60">Creá y compartí propuestas personalizadas.</p>
        </div>
        <button className={btn} onClick={() => begin()}>+ Nuevo presupuesto</button>
      </header>
      {notice && <p className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">{notice}</p>}
      <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="space-y-2">
          {list.map(b => (
            <button key={b.id} onClick={() => begin(b)} className={btn + " w-full text-left"}>
              <span className="block font-semibold">{b.clientName}</span>
              <span className="mt-1 block text-xs text-white/50">{b.shared ? "Enlace habilitado" : "Borrador"}</span>
            </button>
          ))}
          {!list.length && <p className="text-sm text-white/50">No hay presupuestos guardados.</p>}
        </aside>
        <div className="min-w-0 space-y-6">
          <div className="flex flex-wrap gap-2">
            <button className={btn} onClick={() => setPreview(v => !v)}>{preview ? "Editar" : "Ver vista previa"}</button>
            <button className={btn} disabled={busy} onClick={save}>{busy ? "Procesando..." : "Guardar"}</button>
            {selected && <button className={btn} onClick={() => navigator.clipboard.writeText(window.location.origin + "/presupuesto/" + selected.shareToken)}>Copiar enlace</button>}
            {selected && <button className={btn} onClick={erase}>Eliminar</button>}
          </div>

          {preview ? (
            <div className="overflow-hidden rounded-2xl">
              <BudgetPresentation data={content} title={title} clientName={clientName} />
            </div>
          ) : (
            <div className="space-y-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <section className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm">Destinatario<input className={inputClass} value={clientName} onChange={e => setClientName(e.target.value)} /></label>
                <label className="space-y-2 text-sm">Título<input className={inputClass} value={title} onChange={e => setTitle(e.target.value)} /></label>
                <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={shared} onChange={e => setShared(e.target.checked)} /> Habilitar enlace al guardar</label>
                <label className="space-y-2 text-sm">Color principal <input type="color" value={content.accent || "#e5bd42"} onChange={e => patch("accent", e.target.value)} /></label>
              </section>
              <section className="grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
                <h2 className="col-span-full text-xl font-bold">Presentación</h2>
                {textInput("brand", "Marca")}
                {textInput("subtitle", "Subtítulo")}
                <div className="sm:col-span-2">{textInput("bio", "Biografía", true)}</div>
                {textInput("instagram", "Instagram")}
                {textInput("email", "Email")}
                {textInput("phone", "Teléfono")}
                {textInput("location", "Ubicación")}
                {textInput("playlistUrl", "Enlace a playlist")}
                {imageInput("heroImage", "Portada")}
                {imageInput("portraitImage", "Foto de presentación")}
              </section>

              <section className="space-y-4 border-t border-white/10 pt-6">
                <h2 className="text-xl font-bold">Servicios y precios</h2>
                {content.services.map((row,i) => (
                  <div key={i} className="grid gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-[1fr_120px]">
                    <input className={inputClass} value={row.label} onChange={e => updateRow("services", i, "label", e.target.value)} />
                    <input type="number" min={0} className={inputClass} value={row.price} onChange={e => updateRow("services", i, "price", Number(e.target.value))} />
                    <textarea rows={2} className={inputClass} value={row.description} onChange={e => updateRow("services", i, "description", e.target.value)} />
                    <button className={btn} onClick={() => removeRow("services", i)}>Quitar</button>
                  </div>
                ))}
                <button className={btn} onClick={() => addRow("services")}>+ Servicio</button>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">Descuento %<input type="number" min={0} max={100} className={inputClass} value={content.discountPercent} onChange={e => patch("discountPercent", Math.min(100, Number(e.target.value)))} /></label>
                  <label className="text-sm">Total manual (opcional)<input type="number" className={inputClass} placeholder="Total automático" value={content.totalOverride ?? ""} onChange={e => patch("totalOverride", e.target.value ? Number(e.target.value) : null)} /></label>
                </div>
                {textInput("note", "Nota")}
              </section>

              <section className="space-y-4 border-t border-white/10 pt-6">
                <h2 className="text-xl font-bold">Paquetes promocionales</h2>
                {content.packages.map((row,i) => (
                  <div key={i} className="grid gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-3">
                    <input className={inputClass} value={row.name} onChange={e => updateRow("packages", i, "name", e.target.value)} />
                    <input type="number" min={0} className={inputClass} value={row.price} onChange={e => updateRow("packages", i, "price", Number(e.target.value))} />
                    <input type="number" min={1} className={inputClass} value={row.installments} onChange={e => updateRow("packages", i, "installments", Math.max(1, Number(e.target.value)))} />
                    <textarea className={inputClass + " sm:col-span-2"} value={row.description} onChange={e => updateRow("packages", i, "description", e.target.value)} />
                    <button className={btn} onClick={() => removeRow("packages", i)}>Quitar</button>
                  </div>
                ))}
                <button className={btn} onClick={() => addRow("packages")}>+ Paquete</button>
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
          )}
        </div>
      </div>
    </div>
  );
}
