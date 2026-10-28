import { redirect } from "next/navigation";

// Compatibilidad con el acceso anterior del panel.
// Cada moneda tiene su propio editor y enlaces individuales para clientes.
export default function MatiBudgetsPage() {
  redirect("/admin/presupuestos/mati/pesos");
}
