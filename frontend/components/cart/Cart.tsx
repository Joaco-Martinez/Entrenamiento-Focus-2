"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, Plus, Minus, ShoppingBag } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

type DrawerCountry = "arg" | "other"

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const {
    cart,
    totalItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    getSubtotalByCountry,
    getCurrencyByCountry,
  } = useCart()
  console.log("CartDrawer render", { cart, totalItems })
  const { user, country } = useAuth()
  const router = useRouter()

  const resolvedCountry = useMemo<DrawerCountry>(() => {
    const c = (country || user?.country || "").toLowerCase()

    if (c === "arg" || c === "ar" || c === "argentina") return "arg"
    return "other"
  }, [country, user?.country])

  const currency = getCurrencyByCountry(resolvedCountry)
  const subtotal = getSubtotalByCountry(resolvedCountry)

  const formattedSubtotal = useMemo(
    () =>
      new Intl.NumberFormat(currency === "ARS" ? "es-AR" : "en-US", {
        style: "currency",
        currency,
      }).format(subtotal),
    [subtotal, currency],
  )

  function getUnitPrice(item: (typeof cart)[number]) {
    return resolvedCountry === "arg" ? item.arPrice : item.usdPrice
  }

  function formatMoney(value: number) {
    return new Intl.NumberFormat(currency === "ARS" ? "es-AR" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value)
  }

function goToCheckout() {
  onClose()
  router.push("/checkout")
}

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed right-0 top-0 z-[70] flex h-screen w-full max-w-md flex-col border-l border-primary/15 bg-[#0d0e12] shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-lg font-bold text-white">Tu carrito</p>
            <p className="text-sm text-white/50">
              {totalItems} producto{totalItems === 1 ? "" : "s"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-white/70 transition hover:bg-white/5 hover:text-white"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="rounded-full border border-primary/20 bg-primary/10 p-4 text-primary">
              <ShoppingBag className="h-8 w-8" />
            </div>

            <h3 className="mt-5 text-xl font-bold text-white">Tu carrito está vacío</h3>

            <p className="mt-2 max-w-xs text-sm text-white/55">
              Agregá un recurso para comprarlo después o ir directo al checkout.
            </p>

            <Link
              href="/recursos"
              onClick={onClose}
              className="mt-6 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Ver recursos
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {cart.map((item) => {
                const unitPrice = getUnitPrice(item)
                const lineTotal = unitPrice * item.quantity

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                        <Image
                          src={item.coverImageUrl || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="line-clamp-2 font-semibold text-white">
                              {item.title}
                            </p>
                            <p className="mt-1 text-sm text-primary">
                              {formatMoney(unitPrice)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-sm text-red-300 transition hover:text-red-200"
                          >
                            Quitar
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-white/10 bg-black/30">
                            <button
                              type="button"
                              onClick={() => decreaseQuantity(item.id)}
                              className="p-2 text-white/70 transition hover:text-white"
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <span className="min-w-10 text-center text-sm font-semibold text-white">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => increaseQuantity(item.id)}
                              className="p-2 text-white/70 transition hover:text-white"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <p className="text-sm text-white/60">
                            Subtotal:{" "}
                            <span className="font-semibold text-white">
                              {formatMoney(lineTotal)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-white/10 px-5 py-5">
              <div className="flex items-center justify-between text-sm text-white/60">
                <span>Total</span>
                <span className="text-xl font-bold text-primary">{formattedSubtotal}</span>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-white/40">
                <span>Moneda</span>
                <span>{currency === "ARS" ? "Pesos argentinos" : "US Dollars"}</span>
              </div>

              <div className="mt-4 grid gap-3">
                <Link
                  href="/recursos"
                  onClick={onClose}
                  className="flex items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Seguir comprando
                </Link>

                <button
                  type="button"
                  onClick={goToCheckout}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 font-medium text-white/80 transition hover:bg-white/[0.06]"
                >
                  Finalizar compra
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  )
}