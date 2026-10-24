import { notFound } from "next/navigation";
import { BudgetPresentation } from "@/components/BudgetPresentation";
import type { BudgetContent } from "@/services/budgets.service";

// Los presupuestos son privados por enlace: renderizado SSR sin almacenamiento
// intermedio y sin exponer los datos del cliente en componentes interactivos.
export const dynamic = "force-dynamic";
export const revalidate = 0;

type SharedBudget = {
  title: string;
  clientName: string;
  content: BudgetContent;
};

export default async function SharedBudgetPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  // Los enlaces se generan con crypto.randomBytes(24).toString("hex").
  if (!/^[a-f\d]{48}$/i.test(token)) notFound();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!apiUrl) throw new Error("La dirección de la API no está configurada");

  const response = await fetch(`${apiUrl}/budgets/share/${encodeURIComponent(token)}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("No se pudo obtener el presupuesto");

  const payload: { budget?: SharedBudget } = await response.json();
  if (!payload.budget || !payload.budget.content) notFound();

  return (
    <BudgetPresentation
      title={payload.budget.title}
      clientName={payload.budget.clientName}
      data={payload.budget.content}
    />
  );
}
