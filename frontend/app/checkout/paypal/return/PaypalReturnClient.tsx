"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaypalReturnClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    const payerId = searchParams.get("PayerID");

    if (!token) {
      router.replace("/checkout?error=paypal_missing_token");
      return;
    }

    // Acá llamás a tu backend para capturar la orden
    // Ejemplo:
    // apiService.post("/payments/paypal/capture", { orderId: token, payerId })
    //   .then(() => router.replace("/checkout?success=paypal"))
    //   .catch(() => router.replace("/checkout?error=paypal_capture_failed"));

    console.log("PayPal return", { token, payerId });
  }, [searchParams, router]);

  return <div>Procesando pago con PayPal...</div>;
}