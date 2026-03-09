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

      if (data.user.role === "admin") {
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
      <div className="min-h-screen bg-[#0B0B0B] grid place-items-center text-white">
        <p className="text-white/70">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-[120px]" />
        <div className="absolute bottom-[-120px] right-[-120px] h-[420px] w-[420px] rounded-full bg-yellow-400/5 blur-[120px]" />
      </div>

      <header className="relative z-10 border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="text-sm font-semibold tracking-[0.25em] text-white/90">
            ENTRENAMIENTO <span className="text-yellow-400">FOCUS</span>
          </div>

          <nav className="hidden gap-8 text-sm text-white/75 md:flex">
            <a className="hover:text-white" href="/">
              Inicio
            </a>
            <a className="hover:text-white" href="/servicios">
              Servicios
            </a>
            <a className="hover:text-white" href="/recursos">
              Recursos
            </a>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
            Iniciá sesión y <span className="text-yellow-400">accedé</span>
            <br />a tu <span className="text-yellow-400">contenido</span>
          </h1>

          <div className="mt-6 h-[3px] w-16 rounded-full bg-yellow-400" />

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70">
            Entrá con tu cuenta para ver cursos, recursos y beneficios. Si tenés
            suscripción activa, vas a ver el contenido premium automáticamente.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Acceso premium
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Suscripción mensual
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Recursos exclusivos
            </span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-yellow-400/20 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(250,204,21,0.06),0_20px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur">
            <div className="mb-5">
              <h2 className="text-xl font-bold">Ingresar</h2>
              <p className="mt-1 text-sm text-white/60">
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
                <label className="mb-2 block text-sm font-semibold text-white/85">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@example.com"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white/85">
                  Contraseña
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Ingresando..." : "Quiero entrar"}
                <span className="transition group-hover:translate-x-0.5">
                  →
                </span>
              </button>

              <div className="flex items-center justify-between pt-2 text-sm">
                <a
                  href="/register"
                  className="text-white/70 underline decoration-yellow-400/70 underline-offset-4 hover:text-white"
                >
                  Crear cuenta
                </a>
                <a
                  href="/forgot-password"
                  className="text-white/70 underline decoration-yellow-400/70 underline-offset-4 hover:text-white"
                >
                  Olvidé mi contraseña
                </a>
              </div>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-white/45">
            © {new Date().getFullYear()} Entrenamiento Focus
          </p>
        </div>
      </main>
    </div>
  );
}