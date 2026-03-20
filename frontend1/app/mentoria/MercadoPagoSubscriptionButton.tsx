"use client";

type Props = {
  checkoutUrl: string;
  disabled?: boolean;
  onRequireAuth?: () => boolean;
  onError?: (msg: string) => void;
  user? : {
    email: string;
  } | null;
};

export default function MercadoPagoSubscriptionButton({
  checkoutUrl,
  disabled = false,
  onRequireAuth,
  onError,
  user,
}: Props) {
  const handleClick = () => {
    try {
      if (disabled) return;

      if (onRequireAuth) {
        const ok = onRequireAuth();
        if (!ok) return;
      }

      window.location.href = checkoutUrl;
    } catch {
      onError?.("No se pudo iniciar la suscripción con Mercado Pago");
    }
  };

  return (
    <div className="flex w-full flex-col items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="inline-flex h-12 w-[270px] items-center justify-center gap-2 rounded-[30px] border border-[#1f1f1f] bg-[#1f1f1f] px-0 py-2 text-[15px] font-semibold text-white transition hover:bg-[#151515] disabled:opacity-60"
      >
        <img
          src="https://res.cloudinary.com/deb7jg37j/image/upload/v1773600142/mercadopago-white_g42ckf.png"
          alt="Mercado Pago"
          className="h-8 w-auto"
        />
      </button>

      <span className="mt-2 text-[11px] font-medium text-white/70">
        Pagá de forma segura
      </span>
    </div>
  );
}