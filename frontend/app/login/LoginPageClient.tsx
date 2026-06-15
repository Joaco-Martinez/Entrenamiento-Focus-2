"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuth, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = useMemo(
    () => searchParams.get("redirect") || "",
    [searchParams]
  );

  useEffect(() => {
    if (!authLoading && isAuth) {
      router.replace(redirectTo || "/dashboard");
    }
  }, [authLoading, isAuth, router, redirectTo]);

  const validate = () => {
    if (!email.trim()) return "Ingresá tu email.";
    if (!email.includes("@")) return "Email inválido.";
    if (!password || password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    try {
      setSubmitting(true);
      const data = await login(email.trim(), password);

      if (redirectTo) {
        router.replace(redirectTo);
        return;
      }

      if (String(data.user.role).toUpperCase() === "ADMIN") {
        router.replace("/admin");
        return;
      }

      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message || "No se pudo iniciar sesión. Revisá tus datos.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#111110] text-[#f0ede6]">
        <p className="text-[#f0ede6]/70">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111110] text-[#f0ede6]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#c8a84b]/10 blur-[120px]" />
        <div className="absolute bottom-[-120px] right-[-120px] h-[420px] w-[420px] rounded-full bg-[#c8a84b]/5 blur-[120px]" />
      </div>

      <header className="relative z-10 border-b border-[#3a3a36] bg-[#111110]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="text-sm font-semibold tracking-[0.25em] text-[#f0ede6]">
            ENTRENAMIENTO <span className="text-[#c8a84b]">FOCUS</span>
          </div>

          <nav className="hidden gap-8 text-sm text-[#f0ede6]/70 md:flex">
            <a
              className="transition hover:text-[#c8a84b]"
              href="/"
            >
              Inicio
            </a>
            <a
              className="transition hover:text-[#c8a84b]"
              href="/servicios"
            >
              Servicios
            </a>
            <a
              className="transition hover:text-[#c8a84b]"
              href="/recursos"
            >
              Recursos
            </a>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight text-[#f0ede6] md:text-6xl">
            Iniciá sesión y{" "}
            <span className="text-[#c8a84b]">accedé</span>
            <br />a tu{" "}
            <span className="text-[#c8a84b]">contenido</span>
          </h1>

          <div className="mt-6 h-[3px] w-16 rounded-full bg-[#c8a84b]" />

          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#f0ede6]/70">
            Entrá con tu cuenta para ver cursos, recursos y beneficios. Si tenés
            suscripción activa, vas a ver el contenido premium automáticamente.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-[#f0ede6]/70">
            <span className="rounded-full border border-[#3a3a36] bg-[#181816] px-3 py-1">
              Acceso premium
            </span>

            <span className="rounded-full border border-[#3a3a36] bg-[#181816] px-3 py-1">
              Suscripción mensual
            </span>

            <span className="rounded-full border border-[#3a3a36] bg-[#181816] px-3 py-1">
              Recursos exclusivos
            </span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-[#c8a84b]/20 bg-[#181816]/80 p-6 shadow-[0_0_0_1px_rgba(200,168,75,0.06),0_20px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-[#f0ede6]">Ingresar</h2>

              <p className="mt-1 text-sm text-[#f0ede6]/60">
                Usá tu email y contraseña.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#f0ede6]/85">
                  Email
                </label>

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@example.com"
                  className="w-full rounded-xl border border-[#3a3a36] bg-[#111110] px-4 py-3 text-[#f0ede6] outline-none transition placeholder:text-[#f0ede6]/35 focus:border-[#c8a84b]/60 focus:ring-2 focus:ring-[#c8a84b]/15"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#f0ede6]/85">
                  Contraseña
                </label>

                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  className="w-full rounded-xl border border-[#3a3a36] bg-[#111110] px-4 py-3 text-[#f0ede6] outline-none transition placeholder:text-[#f0ede6]/35 focus:border-[#c8a84b]/60 focus:ring-2 focus:ring-[#c8a84b]/15"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8a84b] px-4 py-3 font-bold text-[#111110] transition hover:bg-[#d8b85b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Ingresando..." : "Quiero entrar"}

                <span className="transition group-hover:translate-x-0.5">
                  →
                </span>
              </button>

              <div className="flex items-center justify-between pt-2 text-sm">
                <a
                  href="/register"
                  className="text-[#f0ede6]/70 underline decoration-[#c8a84b]/70 underline-offset-4 transition hover:text-[#f0ede6]"
                >
                  Crear cuenta
                </a>

                <a
                  href="/forgot-password"
                  className="text-[#f0ede6]/70 underline decoration-[#c8a84b]/70 underline-offset-4 transition hover:text-[#f0ede6]"
                >
                  Olvidé mi contraseña
                </a>
              </div>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-[#f0ede6]/45">
            © {new Date().getFullYear()} Entrenamiento Focus
          </p>
        </div>
      </main>
    </div>
  );
}