-- Conservar todos los presupuestos anteriores en la sección de Fran.
ALTER TABLE "BudgetProposal" ADD COLUMN "producer" TEXT NOT NULL DEFAULT 'fran';
CREATE INDEX "BudgetProposal_producer_updatedAt_idx" ON "BudgetProposal"("producer", "updatedAt");
