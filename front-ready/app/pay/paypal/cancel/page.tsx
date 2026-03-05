import Link from "next/link"

export default function PaypalCancelPage() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-6">
      <div className="max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center space-y-4">
        <h1 className="text-3xl font-extrabold">Pago cancelado</h1>
        <p className="text-white/70">No se hizo ningún cobro. Si querés, podés intentarlo de nuevo.</p>

        <div className="flex flex-col gap-3">
          <Link href="/recursos" className="rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground">
            Volver a recursos
          </Link>
          <Link href="/dashboard" className="rounded-xl border border-white/15 bg-white/[0.02] px-4 py-3 text-white/80">
            Ir al dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
