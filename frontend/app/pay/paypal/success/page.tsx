"use client";

import { useSearchParams } from "next/navigation";

export default function PaypalSuccessClient() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const subscriptionId = searchParams.get("subscription_id");
  const baToken = searchParams.get("ba_token");

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full rounded-2xl border p-6 shadow">
        <h1 className="text-2xl font-bold mb-4">Pago exitoso</h1>

        <div className="space-y-2 text-sm">
          <p><strong>Token:</strong> {token || "-"}</p>
          <p><strong>Subscription ID:</strong> {subscriptionId || "-"}</p>
          <p><strong>Billing Agreement Token:</strong> {baToken || "-"}</p>
        </div>
      </div>
    </main>
  );
}