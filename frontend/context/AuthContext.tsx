"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService, LoginResponse } from "@/services/auth.service";

type Role = "USER" | "ADMIN" | "user" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  firstName: string | null;
  lastName: string | null;
  country: string | null;
  isPremium?: boolean;
  subscriptionId?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuth: boolean;
  loading: boolean;

  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;

  isAdmin: boolean;
  isPremium: boolean;
  subscriptionId: string | null;
  fullName: string | null;
  country: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const mapUser = (raw: any): AuthUser => ({
    id: raw.id,
    email: raw.email,
    role: raw.role,
    firstName: raw.firstName ?? null,
    lastName: raw.lastName ?? null,
    country: raw.country ?? "arg",
    isPremium: raw.isPremium ?? false,
    subscriptionId: raw.subscriptionId ?? null,
  });

  const refreshUser = async () => {
    try {
      const me = await authService.me();
      setUser(mapUser(me));
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);

    // Si el backend ya devuelve el user, lo usamos directo
    if (data.user) {
      setUser(mapUser(data.user));
    } else {
      // Si no lo devuelve, reconstruimos sesión desde /auth/me
      await refreshUser();
    }

    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const value = useMemo<AuthContextValue>(() => {
    const isAuth = !!user;

    const normalizedRole = String(user?.role ?? "").toLowerCase();
    const isAdmin = normalizedRole === "admin";

    const isPremium = !!user?.isPremium;
    const subscriptionId = user?.subscriptionId ?? null;

    const fullName =
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.firstName
        ? user.firstName
        : user?.lastName
        ? user.lastName
        : null;

    const country = user?.country ?? "arg";

    return {
      user,
      isAuth,
      loading,
      login,
      logout,
      refreshUser,
      isAdmin,
      isPremium,
      subscriptionId,
      fullName,
      country,
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};