import { redirect } from "next/navigation";

// Compatibilidad con el enlace anterior del administrador.
export default function BudgetsIndex() {
  redirect("/admin/presupuestos/fran");
}
