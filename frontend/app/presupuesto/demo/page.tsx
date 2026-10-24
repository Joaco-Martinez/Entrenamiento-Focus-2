import { BudgetPresentation } from "@/components/BudgetPresentation";
import { defaultBudget } from "@/services/budgets.service";
// Ruta de demostración únicamente para la rama de prueba.
// Quitar este archivo antes de fusionar la funcionalidad en producción.
export default function DemoBudgetPage() {
  return <BudgetPresentation title="Servicio profesional de producción musical" clientName="Presentación general" data={defaultBudget} />;
}