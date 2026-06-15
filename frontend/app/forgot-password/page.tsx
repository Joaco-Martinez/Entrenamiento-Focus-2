"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  KeyRound,
  Lock,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

type Step = "request" | "reset" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("request");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loadingRequest, setLoadingRequest] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const passwordChecks = useMemo(() => {
    return {
      minLength: newPassword.length >= 6,
      hasUppercase: /[A-ZÁÉÍÓÚÑ]/.test(newPassword),
      hasNumber: /\d/.test(newPassword),
      hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
    };
  }, [newPassword]);

  const isPasswordStrongEnough =
    passwordChecks.minLength &&
    passwordChecks.hasUppercase &&
    passwordChecks.hasNumber &&
    passwordChecks.hasSpecial;

  async function handleRequestCode(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      setLoadingRequest(true);

      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "No se pudo enviar el código");
      }

      setMessage(
        "Te enviamos un código de recuperación a tu email. Revisá también spam o promociones."
      );
      setStep("reset");
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al enviar el código");
    } finally {
      setLoadingRequest(false);
    }
  }

  async function resendCode() {
    setError("");
    setMessage("");

    try {
      setLoadingRequest(true);

      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "No se pudo reenviar el código");
      }

      setMessage(
        "Te reenviamos un nuevo código. Revisá tu email, spam o promociones."
      );
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al reenviar el código");
    } finally {
      setLoadingRequest(false);
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!isPasswordStrongEnough) {
      setError(
        "La contraseña debe tener al menos 6 caracteres, una mayúscula, un número y un carácter especial."
      );
      return;
    }

    try {
      setLoadingReset(true);

      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
          newPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "No se pudo restablecer la contraseña");
      }

      setMessage("Tu contraseña fue actualizada correctamente.");
      setStep("success");
      setCode("");
      setNewPassword("");
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al restablecer la contraseña");
    } finally {
      setLoadingReset(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#111110] text-[#f0ede6]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(200,168,75,0.16),transparent_30%),radial-gradient(circle_at_bottom,rgba(240,237,230,0.06),transparent_25%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <section className="w-full max-w-md overflow-hidden rounded-3xl border border-[#c8a84b]/20 bg-[#181816]/95 shadow-[0_0_50px_rgba(200,168,75,0.10)] backdrop-blur-xl">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#c8a84b] via-[#d8b85b] to-[#c8a84b]" />

          <div className="p-5 sm:p-7">
            <Link
              href="/login"
              className="mb-5 inline-flex items-center gap-2 text-sm text-[#f0ede6]/70 transition hover:text-[#c8a84b]"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al login
            </Link>

            {step !== "success" ? (
              <>
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c8a84b]">
                    Entrenamiento Focus
                  </p>

                  <h1 className="mt-2 text-2xl font-bold text-[#f0ede6] sm:text-3xl">
                    {step === "request"
                      ? "¿Olvidaste tu contraseña?"
                      : "Restablecer contraseña"}
                  </h1>

                  <p className="mt-2 text-sm leading-relaxed text-[#f0ede6]/65">
                    {step === "request"
                      ? "Ingresá tu email y te vamos a enviar un código para recuperar el acceso."
                      : "Ingresá el código que recibiste por email y definí tu nueva contraseña."}
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="mb-4 rounded-2xl border border-[#c8a84b]/30 bg-[#c8a84b]/10 px-4 py-3 text-sm text-[#f0ede6]">
                    {message}
                  </div>
                )}

                {step === "request" && (
                  <form onSubmit={handleRequestCode} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#f0ede6]/80">
                        Email
                      </label>

                      <div className="flex h-12 items-center gap-3 rounded-2xl border border-[#3a3a36] bg-[#111110] px-4 transition focus-within:border-[#c8a84b]/50 focus-within:bg-[#111110]/90">
                        <Mail className="h-4 w-4 shrink-0 text-[#c8a84b]" />

                        <input
                          type="email"
                          placeholder="tuemail@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-full w-full bg-transparent text-sm text-[#f0ede6] outline-none placeholder:text-[#f0ede6]/35"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loadingRequest}
                      className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#c8a84b] px-4 text-sm font-semibold text-[#111110] transition hover:bg-[#d8b85b] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loadingRequest ? "Enviando código..." : "Enviar código"}
                    </button>
                  </form>
                )}

                {step === "reset" && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#f0ede6]/80">
                        Email
                      </label>

                      <div className="flex h-12 items-center gap-3 rounded-2xl border border-[#3a3a36] bg-[#111110] px-4">
                        <Mail className="h-4 w-4 shrink-0 text-[#c8a84b]" />

                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-full w-full bg-transparent text-sm text-[#f0ede6] outline-none placeholder:text-[#f0ede6]/35"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#f0ede6]/80">
                        Código de verificación
                      </label>

                      <div className="flex h-12 items-center gap-3 rounded-2xl border border-[#3a3a36] bg-[#111110] px-4 transition focus-within:border-[#c8a84b]/50">
                        <KeyRound className="h-4 w-4 shrink-0 text-[#c8a84b]" />

                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="123456"
                          value={code}
                          onChange={(e) =>
                            setCode(
                              e.target.value.replace(/\D/g, "").slice(0, 6)
                            )
                          }
                          className="h-full w-full bg-transparent text-sm tracking-[0.35em] text-[#f0ede6] outline-none placeholder:text-[#f0ede6]/35"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#f0ede6]/80">
                        Nueva contraseña
                      </label>

                      <div className="flex h-12 items-center gap-3 rounded-2xl border border-[#3a3a36] bg-[#111110] px-4 transition focus-within:border-[#c8a84b]/50">
                        <Lock className="h-4 w-4 shrink-0 text-[#c8a84b]" />

                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Nueva contraseña"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-full w-full bg-transparent text-sm text-[#f0ede6] outline-none placeholder:text-[#f0ede6]/35"
                          required
                          autoComplete="new-password"
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="text-[#f0ede6]/60 transition hover:text-[#f0ede6]"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <PasswordCheck
                          ok={passwordChecks.minLength}
                          text="Mínimo 6 caracteres"
                        />
                        <PasswordCheck
                          ok={passwordChecks.hasUppercase}
                          text="Una mayúscula"
                        />
                        <PasswordCheck
                          ok={passwordChecks.hasNumber}
                          text="Un número"
                        />
                        <PasswordCheck
                          ok={passwordChecks.hasSpecial}
                          text="Un carácter especial"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setMessage("");
                          setStep("request");
                        }}
                        className="flex h-12 w-full items-center justify-center rounded-2xl border border-[#3a3a36] bg-[#111110] px-4 text-sm font-medium text-[#f0ede6] transition hover:bg-[#22221f]"
                      >
                        Volver
                      </button>

                      <button
                        type="submit"
                        disabled={loadingReset}
                        className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#c8a84b] px-4 text-sm font-semibold text-[#111110] transition hover:bg-[#d8b85b] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loadingReset
                          ? "Actualizando..."
                          : "Restablecer contraseña"}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={resendCode}
                      disabled={loadingRequest}
                      className="w-full text-sm text-[#c8a84b] transition hover:text-[#d8b85b]"
                    >
                      {loadingRequest ? "Reenviando..." : "Reenviar código"}
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div className="py-4">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#c8a84b]/30 bg-[#c8a84b]/10">
                  <CheckCircle2 className="h-8 w-8 text-[#c8a84b]" />
                </div>

                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c8a84b]">
                    Listo
                  </p>

                  <h1 className="mt-2 text-2xl font-bold text-[#f0ede6]">
                    Contraseña actualizada
                  </h1>

                  <p className="mt-3 text-sm leading-relaxed text-[#f0ede6]/65">
                    Ya podés iniciar sesión con tu nueva contraseña.
                  </p>

                  <Link
                    href="/login"
                    className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#c8a84b] px-4 text-sm font-semibold text-[#111110] transition hover:bg-[#d8b85b]"
                  >
                    Ir al login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function PasswordCheck({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
        ok
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-[#3a3a36] bg-[#111110] text-[#f0ede6]/55"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          ok ? "bg-emerald-400" : "bg-[#f0ede6]/25"
        }`}
      />
      <span>{text}</span>
    </div>
  );
}