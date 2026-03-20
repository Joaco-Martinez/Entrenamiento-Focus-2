export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold md:text-4xl">
          Dashboard <span className="text-yellow-400">Admin</span>
        </h1>
        <div className="mt-4 h-[3px] w-16 rounded-full bg-yellow-400" />
        <p className="mt-4 max-w-2xl text-white/70">
          Acá vas a administrar productos, órdenes y suscripciones. Las métricas las conectamos después con endpoints reales.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="Productos" value="—" hint="Total en catálogo" href="/admin/products" />
        <StatCard title="Órdenes" value="—" hint="Pagos / estados" href="/admin/orders" />
        <StatCard title="Suscripciones" value="—" hint="Premium activos" href="/admin/subscriptions" />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <ActionCard
          title="Gestionar productos"
          desc="Crear, editar y eliminar cursos / planes."
          href="/admin/products"
        />
        <ActionCard
          title="Ver órdenes"
          desc="Consultar estados y montos (aprobadas, pendientes, etc)."
          href="/admin/orders"
        />
      </section>
    </div>
  )
}

function StatCard({
  title,
  value,
  hint,
  href,
}: {
  title: string
  value: string
  hint: string
  href: string
}) {
  return (
    <a
      href={href}
      className="rounded-2xl border border-yellow-400/20 bg-white/[0.03] p-5 transition hover:bg-white/[0.05]"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white/85">{title}</p>
        <span className="text-white/35">→</span>
      </div>

      <p className="mt-3 text-3xl font-extrabold">{value}</p>
      <p className="mt-1 text-sm text-white/55">{hint}</p>
    </a>
  )
}

function ActionCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <a
      href={href}
      className="rounded-2xl border border-white/10 bg-black/30 p-6 transition hover:bg-black/40"
    >
      <p className="text-lg font-bold">
        {title} <span className="text-yellow-400">→</span>
      </p>
      <p className="mt-2 text-sm text-white/65">{desc}</p>

      <div className="mt-5 h-[2px] w-12 rounded-full bg-yellow-400/80" />
    </a>
  )
}
