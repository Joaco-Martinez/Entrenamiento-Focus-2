"use client";

export default function CheckoutLoading() {
  return (
    <section className="min-h-screen bg-[#050505] px-4 py-10 text-white sm:px-6 sm:py-14">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="h-4 w-32 rounded-full bg-white/10" />
            <div className="h-10 w-48 rounded-xl bg-white/10" />
            <div className="h-4 w-64 rounded-full bg-white/10" />
          </div>

          <div className="h-10 w-24 rounded-full bg-white/10" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_340px]">
          <div className="rounded-[28px] border border-white/10 bg-[#0a0a0a] p-6">
            <div className="h-[480px] rounded-2xl bg-white/[0.03]" />
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0a0a0a] p-6">
            <div className="h-[340px] rounded-2xl bg-white/[0.03]" />
          </div>
        </div>
      </div>
    </section>
  );
}