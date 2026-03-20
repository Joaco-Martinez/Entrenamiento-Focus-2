import { Suspense } from "react";
import PaypalReturnClient from "./PaypalReturnClient";

function PaypalReturnFallback() {
  return <div>Procesando retorno de PayPal...</div>;
}

export default function PaypalReturnPage() {
  return (
    <Suspense fallback={<PaypalReturnFallback />}>
      <PaypalReturnClient />
    </Suspense>
  );
}