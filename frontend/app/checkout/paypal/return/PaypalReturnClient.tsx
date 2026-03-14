"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "../../../../lib/api";

type Status = "processing" | "success" | "error";

export default function PaypalReturnClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("processing");

  useEffect(() => {
    const token = searchParams.get("token");
    const payerId = searchParams.get("PayerID");

    if (!token) {
      router.replace("/checkout?error=paypal_missing_token");
      return;
    }

    const capture = async () => {
      try {
        await apiFetch("/paypal_checkout/capture", {
          method: "POST",
          body: JSON.stringify({
            paypalOrderId: token,
            payerId,
          }),
        });

        setStatus("success");

        setTimeout(() => {
          router.replace("/panel");
        }, 3000);
      } catch (err) {
        console.error("Error capturando pago PayPal", err);
        setStatus("error");

        setTimeout(() => {
          router.replace("/checkout?error=paypal_capture_failed");
        }, 3000);
      }
    };

    capture();
  }, [searchParams, router]);

  if (status === "processing") {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>Procesando pago con PayPal...</h2>
        <p>Estamos confirmando tu pago. Esto puede tardar unos segundos.</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>✅ Pago procesado correctamente</h2>
        <p>
          Tu compra fue confirmada. Podrás ver tus recursos comprados desde el
          panel de usuario.
        </p>
        <p>Serás redirigido automáticamente...</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h2>❌ Hubo un problema con el pago</h2>
      <p>No pudimos confirmar tu pago. Intentá nuevamente.</p>
    </div>
  );
}