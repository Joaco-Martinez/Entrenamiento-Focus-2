"use client";

import Cookies from "js-cookie";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CART_COOKIE_KEY = "focus_cart";

export type CartCurrency = "ARS" | "USD";
export type CartCountry = "arg" | "other";

export type CartItem = {
  id: string;
  title: string;
  arPrice: number;
  usdPrice: number;
  quantity: number;
  coverImageUrl?: string;
  description?: string;
};

type AddToCartInput = {
  id: string;
  title: string;
  arPrice: number;
  usdPrice: number;
  quantity?: number;
  coverImageUrl?: string;
  description?: string;
};

type CartContextType = {
  cart: CartItem[];
  totalItems: number;
  subtotalArs: number;
  subtotalUsd: number;
  hasHydrated: boolean;
  addToCart: (item: AddToCartInput) => void;
  removeFromCart: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  getItemUnitPrice: (productId: string, country: CartCountry) => number;
  getSubtotalByCountry: (country: CartCountry) => number;
  getCurrencyByCountry: (country: CartCountry) => CartCurrency;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function saveCartToCookie(cart: CartItem[]) {
  Cookies.set(CART_COOKIE_KEY, JSON.stringify(cart), {
    expires: 7,
    sameSite: "lax",
  });
}

function getCartFromCookie(): CartItem[] {
  const cookie = Cookies.get(CART_COOKIE_KEY);
  if (!cookie) return [];

  try {
    const parsed = JSON.parse(cookie);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item) => {
      return (
        item &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.arPrice === "number" &&
        !Number.isNaN(item.arPrice) &&
        typeof item.usdPrice === "number" &&
        !Number.isNaN(item.usdPrice) &&
        typeof item.quantity === "number" &&
        !Number.isNaN(item.quantity) &&
        item.quantity > 0
      );
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const storedCart = getCartFromCookie();
    setCart(storedCart);
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    saveCartToCookie(cart);
  }, [cart, hasHydrated]);

  const addToCart = (item: AddToCartInput) => {
    const qty =
      typeof item.quantity === "number" && item.quantity > 0
        ? item.quantity
        : 1;

    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);

      if (existing) {
        return prev.map((p) =>
          p.id === item.id
            ? { ...p, quantity: p.quantity + qty }
            : p
        );
      }

      return [
        ...prev,
        {
          id: item.id,
          title: item.title,
          arPrice: item.arPrice,
          usdPrice: item.usdPrice,
          quantity: qty,
          coverImageUrl: item.coverImageUrl,
          description: item.description,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const increaseQuantity = (productId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (productId: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    Cookies.remove(CART_COOKIE_KEY);
  };

  const isInCart = (productId: string) => {
    return cart.some((item) => item.id === productId);
  };

  const getItemQuantity = (productId: string) => {
    return cart.find((item) => item.id === productId)?.quantity || 0;
  };

  const getCurrencyByCountry = (country: CartCountry): CartCurrency => {
    return country === "arg" ? "ARS" : "USD";
  };

  const getItemUnitPrice = (productId: string, country: CartCountry) => {
    const item = cart.find((cartItem) => cartItem.id === productId);
    if (!item) return 0;

    return country === "arg" ? item.arPrice : item.usdPrice;
  };

  const subtotalArs = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.arPrice * item.quantity, 0);
  }, [cart]);

  const subtotalUsd = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.usdPrice * item.quantity, 0);
  }, [cart]);

  const getSubtotalByCountry = (country: CartCountry) => {
    return country === "arg" ? subtotalArs : subtotalUsd;
  };

  const value: CartContextType = {
    cart,
    totalItems: cart.reduce((acc, item) => acc + item.quantity, 0),
    subtotalArs,
    subtotalUsd,
    hasHydrated,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    getItemUnitPrice,
    getSubtotalByCountry,
    getCurrencyByCountry,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}