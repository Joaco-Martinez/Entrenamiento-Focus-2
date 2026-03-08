"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { usersService } from "@/services/users.service"

const passwordRules = {
  minLen: (v: string) => v.length >= 8,
  upper: (v: string) => /[A-Z]/.test(v),
  lower: (v: string) => /[a-z]/.test(v),
  number: (v: string) => /[0-9]/.test(v),
}

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuth, loading: authLoading } = useAuth()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const redirectTo = useMemo(
    () => searchParams.get("redirect") || "/login",
    [searchParams]
  )

  useEffect(() => {
    if (!authLoading && isAuth) router.replace("/") // si ya está logueado, afuera
  }, [authLoading, isAuth, router])

  const validEmail = email.trim().includes("@")

  const checks = useMemo(() => {
    return {
      minLen: passwordRules.minLen(password),
      upper: passwordRules.upper(password),
      lower: passwordRules.lower(password),
      number: passwordRules.number(password),
      match: password.length > 0 && password === confirmPassword,
    }
  }, [password, confirmPassword])

  const validate = () => {
    if (!firstName.trim()) return "Ingresá tu nombre."
    if (firstName.trim().length < 2) return "El nombre debe tener mínimo 2 caracteres."
    if (!lastName.trim()) return "Ingresá tu apellido."
    if (lastName.trim().length < 2) return "El apellido debe tener mínimo 2 caracteres."
    if (!phone.trim()) return "Ingresá tu teléfono."
    if (phone.trim().length < 6) return "El teléfono es muy corto."

    if (!email.trim()) return "Ingresá tu email."
    if (!validEmail) return "Email inválido."
    if (!checks.minLen) return "La contraseña debe tener mínimo 8 caracteres."
    if (!checks.upper) return "La contraseña debe tener al menos 1 mayúscula."
    if (!checks.lower) return "La contraseña debe tener al menos 1 minúscula."
    if (!checks.number) return "La contraseña debe tener al menos 1 número."
    if (password !== confirmPassword) return "Las contraseñas no coinciden."
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const v = validate()
    if (v) return setError(v)

    try {
      setSubmitting(true)
      await usersService.register(
        email.trim(),
        password,
        firstName.trim(),
        lastName.trim(),
        phone.trim()
      )

      setSuccess("✅ Cuenta creada. Ahora podés iniciar sesión.")
      setTimeout(() => {
        router.replace(
          `/login?redirect=${encodeURIComponent(
            searchParams.get("redirect") || "/"
          )}`
        )
      }, 800)
    } catch (err: any) {
      setError(err?.message || "No se pudo crear la cuenta. Probá de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] grid place-items-center text-white">
        <p className="text-white/70">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      {/* Fondo con glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-[120px]" />
        <div className="absolute bottom-[-120px] right-[-120px] h-[420px] w-[420px] rounded-full bg-yellow-400/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="text-sm font-semibold tracking-[0.25em] text-white/90">
            ENTRENAMIENTO <span className="text-yellow-400">FOCUS</span>
          </div>

          <nav className="hidden gap-8 text-sm text-white/75 md:flex">
            <a className="hover:text-white" href="/">Inicio</a>
            <a className="hover:text-white" href="/servicios">Servicios</a>
            <a className="hover:text-white" href="/recursos">Recursos</a>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2">
        {/* Hero */}
        <div>
          <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
            Creá tu cuenta y{" "}
            <span className="text-yellow-400">empezá</span>
            <br />
            hoy mismo
          </h1>

          <div className="mt-6 h-[3px] w-16 rounded-full bg-yellow-400" />

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70">
            Registrate para acceder a cursos, recursos y a la parte premium si tenés suscripción activa.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Acceso inmediato
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Contenido premium
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Soporte y recursos
            </span>
          </div>
        </div>

        {/* Card Register */}
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-yellow-400/20 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(250,204,21,0.06),0_20px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur">
            <div className="mb-5">
              <h2 className="text-xl font-bold">Crear cuenta</h2>
              <p className="mt-1 text-sm text-white/60">
                Completá los datos para registrarte.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/85">Nombre</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  type="text"
                  autoComplete="given-name"
                  placeholder="Joaquin"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                />
              </div>

              {/* Apellido */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/85">Apellido</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  type="text"
                  autoComplete="family-name"
                  placeholder="Martinez"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/85">Teléfono</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="3516763620"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                />
                <p className="mt-2 text-xs text-white/45">
                  Tip: poné tu número sin espacios (ej: 3516763620).
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/85">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="nuevo@example.com"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/85">Contraseña</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="new-password"
                  placeholder="MiPassword123"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                />

                {/* Reglas visuales */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/65">
                  <Rule ok={checks.minLen} label="8+ caracteres" />
                  <Rule ok={checks.upper} label="1 mayúscula" />
                  <Rule ok={checks.lower} label="1 minúscula" />
                  <Rule ok={checks.number} label="1 número" />
                </div>
              </div>

              {/* Confirm */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/85">Confirmar contraseña</label>
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repetí tu contraseña"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15"
                />
                {confirmPassword.length > 0 && (
                  <p className={`mt-2 text-xs ${checks.match ? "text-emerald-300" : "text-red-200"}`}>
                    {checks.match ? "✅ Coinciden" : "❌ No coinciden"}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creando..." : "Crear cuenta"}
                <span className="transition group-hover:translate-x-0.5">→</span>
              </button>

              <div className="flex items-center justify-between pt-2 text-sm">
                <a
                  href="/login"
                  className="text-white/70 underline decoration-yellow-400/70 underline-offset-4 hover:text-white"
                >
                  Ya tengo cuenta
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
  )
}

function Rule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <span className={`text-xs ${ok ? "text-emerald-300" : "text-white/45"}`}>
        {ok ? "✓" : "•"}
      </span>
      <span className={ok ? "text-white/80" : "text-white/55"}>{label}</span>
    </div>
  )
}
