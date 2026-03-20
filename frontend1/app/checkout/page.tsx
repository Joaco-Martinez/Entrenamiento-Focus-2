"use client";

import CheckoutPaymentSelector from "@/components/checkout/CheckoutPaymentSelector";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="mx-auto max-w-3xl">
        <CheckoutPaymentSelector />
      </div>
    </main>
  );
}