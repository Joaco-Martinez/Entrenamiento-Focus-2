"use client";

type Props = {
  orderId: string;
};

export default function PaypalCheckout({ orderId }: Props) {
  const handlePaypal = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

      const res = await fetch(`${apiUrl}/payments/paypal/checkout`, {
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

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
      <p className="mb-3 text-sm text-zinc-400">
        Checkout internacional en USD.
      </p>

      <button
        type="button"
        onClick={handlePaypal}
        className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90"
      >
        Pagar con PayPal
      </button>
    </div>
  );
}