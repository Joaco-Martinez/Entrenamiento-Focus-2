-- CreateEnum
CREATE TYPE "SubscriptionLinkIntentStatus" AS ENUM ('PENDING', 'MATCHED', 'ACTIVATED', 'FAILED', 'EXPIRED');

-- CreateTable
CREATE TABLE "SubscriptionLinkIntent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'MERCADOPAGO',
    "planId" TEXT NOT NULL,
    "checkoutUrl" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "payerEmail" TEXT,
    "status" "SubscriptionLinkIntentStatus" NOT NULL DEFAULT 'PENDING',
    "mpPreapprovalId" TEXT,
    "mpStatus" TEXT,
    "openedAt" TIMESTAMP(3),
    "matchedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "lastWebhookAt" TIMESTAMP(3),
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionLinkIntent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubscriptionLinkIntent_userId_idx" ON "SubscriptionLinkIntent"("userId");

-- CreateIndex
CREATE INDEX "SubscriptionLinkIntent_productId_idx" ON "SubscriptionLinkIntent"("productId");

-- CreateIndex
CREATE INDEX "SubscriptionLinkIntent_provider_idx" ON "SubscriptionLinkIntent"("provider");

-- CreateIndex
CREATE INDEX "SubscriptionLinkIntent_planId_idx" ON "SubscriptionLinkIntent"("planId");

-- CreateIndex
CREATE INDEX "SubscriptionLinkIntent_email_idx" ON "SubscriptionLinkIntent"("email");

-- CreateIndex
CREATE INDEX "SubscriptionLinkIntent_status_idx" ON "SubscriptionLinkIntent"("status");

-- CreateIndex
CREATE INDEX "SubscriptionLinkIntent_mpPreapprovalId_idx" ON "SubscriptionLinkIntent"("mpPreapprovalId");

-- AddForeignKey
ALTER TABLE "SubscriptionLinkIntent" ADD CONSTRAINT "SubscriptionLinkIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionLinkIntent" ADD CONSTRAINT "SubscriptionLinkIntent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
