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

    setTimeout(() => {
      router.replace("/");
    }, 3000);

    console.log("PayPal return", { token, payerId });
  }, [searchParams, router]);

  return <div>Procesando pago con PayPal...</div>;
}
