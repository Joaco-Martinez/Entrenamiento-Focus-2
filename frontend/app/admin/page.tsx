import Link from "next/link";
import {
  Package,
  ShoppingCart,
  CreditCard,
  ArrowRight,
  Sparkles,
  LayoutPanelTop,
  ShieldCheck,
} from "lucide-react";

export default function AdminHomePage() {
  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10">
        <div className="absolute right-[-60px] top-[-60px] h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute bottom-[-50px] left-[-40px] h-32 w-32 rounded-full bg-white/[0.05] blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-200">
            <Sparkles className="h-3.5 w-3.5" />
            Panel administrativo
          </div>

          <h1 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
            Dashboard <span className="text-yellow-400">Admin</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
            Desde acá podés administrar productos, revisar órdenes y controlar
            las suscripciones de la plataforma con una vista más clara, moderna
            y responsive.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-yellow-400/15"
            >
              Gestionar productos
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/[0.07]"
            >
              Ver órdenes
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Productos"
          value="—"
          hint="Total en catálogo"
          href="/admin/products"
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          title="Órdenes"
          value="—"
          hint="Pagos y estados"
          href="/admin/orders"
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <StatCard
          title="Suscripciones"
          value="—"
          hint="Premium activos"
          href="/admin/subscriptions"
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatCard
          title="Sistema"
          value="OK"
          hint="Panel operativo"
          href="/admin"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.26)] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-300">
              <LayoutPanelTop className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Accesos rápidos
              </h2>
              <p className="text-sm text-white/55">
                Entradas principales del panel.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ActionCard
              title="Gestionar productos"
              desc="Crear, editar y eliminar cursos, recursos o planes."
              href="/admin/products"
            />
            <ActionCard
              title="Ver órdenes"
              desc="Consultar estados, montos y revisar compras realizadas."
              href="/admin/orders"
            />
            <ActionCard
              title="Suscripciones"
              desc="Controlar usuarios premium y su estado actual."
              href="/admin/subscriptions"
            />
            <ActionCard
              title="Volver al inicio"
              desc="Regresar al sitio público principal."
              href="/"
            />
          </div>
        </div>

        <div className="rounded-[26px] border border-white/10 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent p-5 shadow-[0_12px_40px_rgba(0,0,0,0.26)] sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.24em] text-yellow-200/80">
            Resumen
          </p>

          <h3 className="mt-3 text-2xl font-black text-white">
            Un panel mucho más claro y profesional
          </h3>

          <p className="mt-3 text-sm leading-6 text-white/70">
            Esta versión prioriza lectura, jerarquía visual y mejor uso del
            espacio en desktop y mobile, manteniendo intacta la lógica actual.
          </p>

          <div className="mt-6 space-y-3">
            <MiniInfo text="Mejor navegación en mobile" />
            <MiniInfo text="Cards más limpias y premium" />
            <MiniInfo text="Mejor spacing y estructura" />
            <MiniInfo text="Estética más sólida para admin" />
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
  href,
  icon,
}: {
  title: string;
  value: string;
  hint: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.22)] transition duration-200 hover:-translate-y-1 hover:border-yellow-400/20 hover:bg-white/[0.07]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-300">
          {icon}
        </div>

        <ArrowRight className="h-5 w-5 text-white/25 transition group-hover:translate-x-1 group-hover:text-yellow-300" />
      </div>

      <p className="mt-5 text-sm font-semibold text-white/85">{title}</p>
      <p className="mt-2 text-3xl font-black leading-none text-white">{value}</p>
      <p className="mt-2 text-sm text-white/50">{hint}</p>
    </Link>
  );
}

function ActionCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/10 bg-black/30 p-5 transition hover:border-yellow-400/20 hover:bg-white/[0.04]"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-bold text-white">{title}</p>
        <ArrowRight className="h-4 w-4 text-white/30 transition group-hover:translate-x-1 group-hover:text-yellow-300" />
      </div>

      <p className="mt-2 text-sm leading-6 text-white/62">{desc}</p>

      <div className="mt-5 h-[2px] w-14 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-400/10" />
    </Link>
  );
}

function MiniInfo({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/80">
      {text}
    </div>
  );
}