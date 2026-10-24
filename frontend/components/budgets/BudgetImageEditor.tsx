"use client";

import { useRef, type PointerEvent } from "react";
import type { BudgetImagePosition } from "@/services/budgets.service";

type Props = {
  label: string;
  url: string;
  position?: BudgetImagePosition;
  aspectRatio: string;
  disabled?: boolean;
  onUrlChange: (url: string) => void;
  onPositionChange: (position: BudgetImagePosition) => void;
  onUpload: (file: File) => void;
};

const rangeClass = "w-full accent-[#e5bd42]";
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const inputClass = "w-full rounded-lg border border-white/15 bg-white/5 p-2 text-sm text-white";

export default function BudgetImageEditor({
  label, url, position, aspectRatio, disabled, onUrlChange, onPositionChange, onUpload
}: Props) {
  const x = clamp(Number(position?.x ?? 50), 0, 100);
  const y = clamp(Number(position?.y ?? 50), 0, 100);
  const zoom = clamp(Number(position?.zoom ?? 1), 1, 2.5);
  const drag = useRef<{ x: number; y: number; posX: number; posY: number; width: number; height: number } | null>(null);

  const handleDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!url || disabled) return;
    drag.current = {
      x: event.clientX, y: event.clientY,
      posX: x, posY: y,
      width: event.currentTarget.clientWidth,
      height: event.currentTarget.clientHeight
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    const value = drag.current;
    if (!value) return;
    const factor = Math.max(zoom, 1.01);
    // El usuario arrastra la imagen hacia el lugar donde quiere verla.
    onPositionChange({
      x: clamp(Math.round(value.posX - ((event.clientX - value.x) / value.width) * 100 / factor), 0, 100),
      y: clamp(Math.round(value.posY - ((event.clientY - value.y) / value.height) * 100 / factor), 0, 100),
      zoom
    });
  };
  const handleUp = () => { drag.current = null; };
  const setAxis = (axis: "x" | "y" | "zoom", value: number) => {
    onPositionChange({ x, y, zoom, [axis]: value });
  };

  return (
    <div className="rounded-xl border border-white/10 p-4">
      <p className="mb-3 text-sm font-semibold text-white/80">{label}</p>
      <div
        className="relative mb-3 w-full overflow-hidden rounded-xl border border-white/10 bg-[#27231b]"
        style={{ aspectRatio, touchAction: url ? "none" : "auto", cursor: url ? "grab" : "default" }}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        aria-label={"Vista de encuadre de " + label}
      >
        {url ? (
          <img
            src={url}
            alt={"Previsualización: " + label}
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
            style={{
              objectPosition: x + "% " + y + "%",
              transformOrigin: x + "% " + y + "%",
              transform: "scale(" + zoom + ")"
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/40">Sin imagen</div>
        )}
      </div>
      <p className="mb-4 text-xs text-white/50">Arrastrá la imagen para encuadrarla. Ajustá la posición y el zoom antes de guardar.</p>
      <div className="grid gap-3">
        <label className="text-xs text-white/70">
          Horizontal · {x}%
          <input disabled={disabled || !url} aria-label={"Posición horizontal de " + label} type="range" min="0" max="100" value={x} className={rangeClass} onChange={e => setAxis("x", Number(e.target.value))} />
        </label>
        <label className="text-xs text-white/70">
          Vertical · {y}%
          <input disabled={disabled || !url} aria-label={"Posición vertical de " + label} type="range" min="0" max="100" value={y} className={rangeClass} onChange={e => setAxis("y", Number(e.target.value))} />
        </label>
        <label className="text-xs text-white/70">
          Zoom · {zoom.toFixed(2)}×
          <input disabled={disabled || !url} aria-label={"Zoom de " + label} type="range" min="1" max="2.5" step=".05" value={zoom} className={rangeClass} onChange={e => setAxis("zoom", Number(e.target.value))} />
        </label>
      </div>
      <button type="button" className="mt-2 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/75 hover:bg-white/10" onClick={() => onPositionChange({x:50,y:50,zoom:1})}>Restablecer encuadre</button>
      <label className="mt-4 block text-xs text-white/70">
        Dirección de la imagen (URL)
        <input className={"mt-2 " + inputClass} type="url" value={url} disabled={disabled} onChange={e => onUrlChange(e.target.value)} placeholder="https://..." />
      </label>
      <label className="mt-3 block cursor-pointer rounded-lg border border-dashed border-white/20 bg-white/5 px-4 py-3 text-center text-xs text-white/75 hover:bg-white/10">
        {disabled ? "Subiendo imagen..." : "Subir o reemplazar imagen (JPG, PNG o WebP)"}
        <input type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled} className="sr-only" onChange={e => {const file=e.target.files?.[0]; if(file) onUpload(file);e.currentTarget.value="";}} />
      </label>
    </div>
  );
}
