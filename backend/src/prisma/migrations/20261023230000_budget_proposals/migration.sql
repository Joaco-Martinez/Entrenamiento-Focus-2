CREATE TABLE "BudgetProposal" (
  "id" TEXT NOT NULL,
  "shareToken" TEXT NOT NULL,
  "clientName" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "shared" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BudgetProposal_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BudgetProposal_shareToken_key" ON "BudgetProposal"("shareToken");
CREATE INDEX "BudgetProposal_updatedAt_idx" ON "BudgetProposal"("updatedAt");