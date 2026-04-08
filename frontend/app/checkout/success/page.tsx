import { Suspense } from "react";
import CheckoutSuccessClient from "./CheckoutSuccessClient";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070707] text-white flex items-center justify-center">Cargando resultado del pago...</div>}>
      <CheckoutSuccessClient />
    </Suspense>
  );
}