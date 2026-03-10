"use client";

type PaypalItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: "USD";
  description?: string;
  image_url?: string;
};

type Payer = {
  firstName?: string;
  lastName?: string;
  email?: string;
  fullName?: string;
};

type Props = {
  items: PaypalItem[];
  payer: Payer;
  amount: number;
};

export default function PaypalCheckout({ items, payer, amount }: Props) {
  const handlePaypal = async () => {
    console.log("PayPal pendiente de implementar", {
      items,
      payer,
      amount,
    });

    // después acá hacés:
    // fetch(`${process.env.NEXT_PUBLIC_API_URL}/paypal/create-order`, ...)
    // y redirección al approveUrl
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