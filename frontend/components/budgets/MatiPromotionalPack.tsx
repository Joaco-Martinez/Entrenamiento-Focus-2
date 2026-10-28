import { ArrowUpRight, Check, CreditCard } from "lucide-react";
import type { BudgetCurrency, BudgetPackage, BudgetRow } from "@/services/budgets.service";

type Props = {
  pack: BudgetPackage;
  regular?: BudgetRow;
  currency: BudgetCurrency;
  priceText: (ars: number, usd?: number) => string;
  whatsappUrl?: string;
};

export function MatiPromotionalPack({ pack, regular, currency, priceText, whatsappUrl }: Props) {
  // Los precios editados en administración son tarifas por canción.
  // El ejemplo de cuatro temas y su ahorro se calculan en SSR, nunca quedan desactualizados.
  const perSong = currency === "USD" ? pack.usdPrice : pack.price;
  const regularPerSong = regular ? (currency === "USD" ? regular.usdPrice : regular.price) : undefined;
  const validPrice = typeof perSong === "number" && Number.isFinite(perSong) && perSong > 0;
  const validRegular = typeof regularPerSong === "number" && Number.isFinite(regularPerSong) && regularPerSong > 0;
  const packageTotal = validPrice ? perSong * 4 : 0;
  const regularTotal = validRegular ? regularPerSong * 4 : 0;
  const saving = validPrice && validRegular && regularTotal > packageTotal ? regularTotal - packageTotal : 0;
  const fmt = (amount: number) => currency === "USD" ? priceText(0, amount) : priceText(amount);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-[#d5cfc3] bg-white/95 p-6 shadow-[0_10px_35px_rgba(39,31,15,0.035)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-[#b79956] hover:shadow-[0_22px_46px_rgba(39,31,15,0.10)] motion-reduce:transform-none motion-reduce:transition-none sm:p-8">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-[#c59d45]" />
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#1a1a18] text-sm font-black text-[#e4bd5c]">4</span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#98752c]">Pack promocional · 4 canciones</p>
          <h3 className="mt-1 text-lg font-extrabold leading-tight tracking-[-0.025em] text-[#25221d]">{pack.name}</h3>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-[#f8f5ec] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.11em] text-[#756c5c]">Precio total del pack</p>
        {saving > 0 && (
          <p className="mt-2 text-sm font-semibold text-[#898075] line-through decoration-[#b7a582]">
            Antes: {fmt(regularTotal)}
          </p>
        )}
        <p className="mt-2 break-words text-[31px] font-black leading-tight tracking-[-0.04em] text-[#956d20] tabular-nums sm:text-[36px]">
          {validPrice ? fmt(packageTotal) : "A cotizar"}
        </p>
        {saving > 0 && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#e8f0e1] px-3 py-2 text-[13px] font-bold text-[#486a38]">
            <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true"/>
            Ahorrás {fmt(saving)}
          </p>
        )}
      </div>

      <div className="mt-5 flex items-start gap-2.5 text-[#655c4c]">
        <CreditCard aria-hidden="true" className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#99732c]" strokeWidth={1.8}/>
        <div>
          <p className="text-sm font-semibold text-[#35302a]">
            {validPrice ? "O en 2 pagos de " + fmt(packageTotal / 2) : "Podés pagar en 2 veces"}
          </p>
          <p className="mt-1 text-xs leading-5 text-[#786f60]">
            {validPrice ? "Equivale a " + fmt(perSong) + " por canción." : "Consultá el valor de tu proyecto."}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-[#272019]/10 pt-4">
        <p className="text-[13px] leading-6 text-[#6c665e]">{pack.description}</p>
        <p className="mt-2 text-xs font-medium leading-5 text-[#80776b]">Para más de 4 canciones se mantiene la tarifa promocional por canción.</p>
      </div>

      <div className="mt-auto pt-6">
        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#c7a86c] bg-[#f9f0dc] px-5 py-2.5 text-[13px] font-bold text-[#77531a] transition-colors hover:bg-[#f2dfb6]">
            Consultar este pack <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}
