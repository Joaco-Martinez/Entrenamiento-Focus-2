import { Suspense } from "react";
import RegisterPageClient from "./RegisterPageClient";

function RegisterFallback() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] grid place-items-center text-white">
      <p className="text-white/70">Cargando...</p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterPageClient />
    </Suspense>
  );
}