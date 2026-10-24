"use client";
import { BudgetPresentation } from "@/components/BudgetPresentation";
import { defaultBudget } from "@/services/budgets.service";
export default function AdminBudgetsPage() { return <div><h1>Editor de presupuestos en preparación</h1><BudgetPresentation title="Presupuesto de prueba" clientName="Presentación general" data={defaultBudget}/></div> }
