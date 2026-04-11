"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usersService } from "@/services/users.service";

const passwordRules = {
  minLen: (v: string) => v.length >= 8,
  upper: (v: string) => /[A-Z]/.test(v),
  lower: (v: string) => /[a-z]/.test(v),
  number: (v: string) => /[0-9]/.test(v),
};

const isValidEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
};

const countries = [
  { code: "AR", label: "🇦🇷 Argentina" },
  { code: "BO", label: "🇧🇴 Bolivia" },
  { code: "CL", label: "🇨🇱 Chile" },
  { code: "CO", label: "🇨🇴 Colombia" },
  { code: "CR", label: "🇨🇷 Costa Rica" },
  { code: "CU", label: "🇨🇺 Cuba" },
  { code: "DO", label: "🇩🇴 República Dominicana" },
  { code: "EC", label: "🇪🇨 Ecuador" },
  { code: "SV", label: "🇸🇻 El Salvador" },
  { code: "ES", label: "🇪🇸 España" },
  { code: "GT", label: "🇬🇹 Guatemala" },
  { code: "HN", label: "🇭🇳 Honduras" },
  { code: "MX", label: "🇲🇽 México" },
  { code: "NI", label: "🇳🇮 Nicaragua" },
  { code: "PA", label: "🇵🇦 Panamá" },
  { code: "PY", label: "🇵🇾 Paraguay" },
  { code: "PE", label: "🇵🇪 Perú" },
  { code: "PR", label: "🇵🇷 Puerto Rico" },
  { code: "UY", label: "🇺🇾 Uruguay" },
  { code: "VE", label: "🇻🇪 Venezuela" },
  { code: "US", label: "🇺🇸 Estados Unidos" },
  { code: "BR", label: "🇧🇷 Brasil" },
  { code: "IT", label: "🇮🇹 Italia" },
  { code: "FR", label: "🇫🇷 Francia" },
  { code: "DE", label: "🇩🇪 Alemania" },
  { code: "CA", label: "🇨🇦 Canadá" },
  { code: "GB", label: "🇬🇧 Reino Unido" },
];

const countryDialCodes: Record<string, string> = {
  AR: "54",
  BO: "591",
  CL: "56",
  CO: "57",
  CR: "506",
  CU: "53",
  DO: "1",
  EC: "593",
  SV: "503",
  ES: "34",
  GT: "502",
  HN: "504",
  MX: "52",
  NI: "505",
  PA: "507",
  PY: "595",
  PE: "51",
  PR: "1",
  UY: "598",
  VE: "58",
  US: "1",
  BR: "55",
  IT: "39",
  FR: "33",
  DE: "49",
  CA: "1",
  GB: "44",
};

const phonePlaceholders: Record<string, string> = {
  AR: "3516763620",
  BO: "71234567",
  CL: "912345678",
  CO: "3001234567",
  CR: "88887777",
  CU: "51234567",
  DO: "8095551234",
  EC: "0991234567",
  SV: "70123456",
  ES: "612345678",
  GT: "51234567",
  HN: "91234567",
  MX: "5512345678",
  NI: "81234567",
  PA: "61234567",
  PY: "981123456",
  PE: "987654321",
  PR: "7875551234",
  UY: "91234567",
  VE: "4121234567",
  US: "3055551234",
  BR: "11999999999",
  IT: "3123456789",
  FR: "612345678",
  DE: "15123456789",
  CA: "4165551234",
  GB: "7123456789",
};

const normalizePhone = (value: string) => value.replace(/\D/g, "");

const buildInternationalPhone = (country: string, phone: string) => {
  const cleanPhone = normalizePhone(phone);
  const dialCode = countryDialCodes[country] || "";

  if (!cleanPhone) return "";
  if (!dialCode) return cleanPhone;

  return `+${dialCode}${cleanPhone}`;
};

export default function RegisterPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuth, loading: authLoading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("AR");
  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const redirectTo = useMemo(
    () => searchParams.get("redirect") || "/login",
    [searchParams]
  );

  const dialCode = countryDialCodes[country] || "";
  const phonePlaceholder = phonePlaceholders[country] || "123456789";

  useEffect(() => {
    if (!authLoading && isAuth) {
      router.replace("/");
    }
  }, [authLoading, isAuth, router]);

  const checks = useMemo(() => {
    return {
      minLen: passwordRules.minLen(password),
      upper: passwordRules.upper(password),
      lower: passwordRules.lower(password),
      number: passwordRules.number(password),
      match: password.length > 0 && password === confirmPassword,
    };
  }, [password, confirmPassword]);

  const validate = () => {
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanPhone = normalizePhone(phone);
    const cleanEmail = email.trim().toLowerCase();
    const cleanCountry = country.trim().toUpperCase();

    if (!cleanFirstName) return "Ingresá tu nombre.";
    if (cleanFirstName.length < 2) {
      return "El nombre debe tener mínimo 2 caracteres.";
    }

    if (!cleanLastName) return "Ingresá tu apellido.";
    if (cleanLastName.length < 2) {
      return "El apellido debe tener mínimo 2 caracteres.";
    }

    if (!cleanCountry) return "Seleccioná tu país.";

    if (!cleanPhone) return "Ingresá tu teléfono.";
    if (cleanPhone.length < 6) return "El teléfono es muy corto.";

    if (!cleanEmail) return "Ingresá tu email.";
    if (!isValidEmail(cleanEmail)) return "Email inválido.";

    if (!checks.minLen) {
      return "La contraseña debe tener mínimo 8 caracteres.";
    }

    if (!checks.upper) {
      return "La contraseña debe tener al menos 1 mayúscula.";
    }

    if (!checks.lower) {
      return "La contraseña debe tener al menos 1 minúscula.";
    }

    if (!checks.number) {
      return "La contraseña debe tener al menos 1 número.";
    }

    if (password !== confirmPassword) {
      return "Las contraseñas no coinciden.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);

      await usersService.register({
        email: email.trim().toLowerCase(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: buildInternationalPhone(country, phone),
        country: country.trim().toUpperCase(),
      });

      setSuccess("✅ Cuenta creada. Ahora podés iniciar sesión.");

      setTimeout(() => {
        router.replace(
          `/login?redirect=${encodeURIComponent(redirectTo || "/")}`
        );
      }, 800);
    } catch (err: any) {
      setError(err?.message || "No se pudo crear la cuenta. Probá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0B0B0B] text-white">
        <p className="text-white/70">Cargando...</p>
      </div>
    );
  }

  return  (
  <div className="min-h-screen bg-[#0B0B0B] text-white">
    {/* BG glow */}
    <div className="pointer-events-none fixed inset-0">
      <div className="absolute left-1/2 top-[-128px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-[120px]" />
      <div className="absolute bottom-[-120px] right-[-120px] h-[420px] w-[420px] rounded-full bg-yellow-400/5 blur-[120px]" />
    </div>

    {/* MAIN */}
    <main className="relative z-10 mx-auto grid max-w-6xl items-start gap-10 px-6 py-16 md:grid-cols-2">
      
      {/* LEFT */}
      <div>
        <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
          Creá tu cuenta y <span className="text-yellow-400">empezá</span>
          <br />
          hoy mismo
        </h1>

        <div className="mt-6 h-[3px] w-16 rounded-full bg-yellow-400" />

        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70">
          Registrate para acceder a cursos, recursos y a la parte premium si
          tenés suscripción activa.
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

      {/* RIGHT */}
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
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/85">
                Nombre
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                type="text"
                placeholder="Joaquin"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/85">
                Apellido
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                type="text"
                placeholder="Martinez"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/85">
                País
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3"
              >
                {countries.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/85">
                Teléfono
              </label>

              <div className="flex rounded-xl border border-white/10 bg-black/40">
                <div className="flex items-center border-r border-white/10 px-4 text-white/70">
                  +{dialCode}
                </div>
                <input
                  value={phone}
                  onChange={(e) => setPhone(normalizePhone(e.target.value))}
                  type="tel"
                  placeholder={phonePlaceholder}
                  className="w-full bg-transparent px-4 py-3"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/85">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="nuevo@example.com"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3"
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
                placeholder="MiPassword123"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/85">
                Confirmar contraseña
              </label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                placeholder="Repetí tu contraseña"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-yellow-400 px-4 py-3 font-bold text-black hover:bg-yellow-300"
            >
              {submitting ? "Creando..." : "Crear cuenta"}
            </button>
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
function Rule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <span className={`text-xs ${ok ? "text-emerald-300" : "text-white/45"}`}>
        {ok ? "✓" : "•"}
      </span>
      <span className={ok ? "text-white/80" : "text-white/55"}>{label}</span>
    </div>
  );
}