"use client";

type Props = {
  orderId: string;
  amountUsd: number;
};

export default function PaypalCheckout({ orderId, amountUsd }: Props) {
  const handlePaypal = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

      const res = await fetch(`${apiUrl}/paypal_checkout/checkout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          returnUrl: `${appUrl}/checkout/paypal/return`,
          cancelUrl: `${appUrl}/checkout/paypal/cancel`,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.approveUrl) {
        throw new Error(data?.message || "No se pudo iniciar PayPal");
      }

      window.location.href = data.approveUrl;
    } catch (error) {
      console.error("Error iniciando PayPal:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar el checkout de PayPal"
      );
    }
  };

  const formattedUsd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amountUsd);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-1 text-sm text-white/60">
        Checkout internacional en USD.
      </p>

      <p className="mb-4 text-2xl font-extrabold text-primary">
        {formattedUsd}
      </p>

      <button
        type="button"
        onClick={handlePaypal}
        className="inline-flex min-h-[54px] w-full items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:scale-[1.01] hover:opacity-95"
      >
        Pagar {formattedUsd} con PayPal
      </button>
    </div>
  );
}