"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BudgetPresentation } from "@/components/BudgetPresentation";
import { budgetsService, Budget } from "@/services/budgets.service";
import { useNavTheme } from "@/context/NavThemeContext";
export default function SharedBudgetPage() {
  useNavTheme("light");
  const params = useParams();
  const [budget, setBudget] = useState<Pick<Budget, "title"|"clientName"|"content"> | null>(null);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{let active=true;budgetsService.getShared(String(params.token)).then(r=>{if(active)setBudget(r.budget)}).catch(()=>{if(active)setBudget(null)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[params.token]);
  if(loading)return <main className="flex min-h-screen items-center justify-center bg-[#f7f6f2] text-[#222]">Cargando propuesta...</main>;
  if(!budget)return <main className="flex min-h-screen items-center justify-center bg-[#f7f6f2] px-6 text-center text-[#222]"><div><h1 className="text-2xl font-bold">Presupuesto no disponible</h1><p className="mt-3 text-[#777]">Comprobá el enlace o contactá con quien te lo compartió.</p></div></main>;
  return <BudgetPresentation title={budget.title} clientName={budget.clientName} data={budget.content}/>;
}