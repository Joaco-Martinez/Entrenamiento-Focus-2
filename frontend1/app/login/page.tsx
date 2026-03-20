import { Suspense } from "react";
import LoginPageClient from "./LoginPageClient";

function LoginFallback() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] grid place-items-center text-white">
      <p className="text-white/70">Cargando...</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageClient />
    </Suspense>
  );
}