"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService, LoginResponse } from "@/services/auth.service";

type Role = "user" | "admin";

export type AuthUser = {
  email: string;
  role: Role;
  isPremium: boolean;
  subscriptionId: string | null;

  // ✅ nuevos
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuth: boolean;
  loading: boolean;

  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;

  // helpers
  isAdmin: boolean;
  isPremium: boolean;
  subscriptionId: string | null;

  // ✅ helper extra (opcional)
  fullName: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// --- helper: decode JWT payload (sin librerías) ---
const decodeJwtPayload = (token: string) => {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1) Hydrate al inicio
  useEffect(() => {
    try {
      const token = localStorage.getItem("access_token");
      const userRaw = localStorage.getItem("user");

      if (token) setAccessToken(token);

      if (userRaw) {
        const parsed = JSON.parse(userRaw);

        // ✅ compat con users viejos en localStorage (sin firstName/lastName/phone)
        setUser({
          email: parsed.email,
          role: parsed.role,
          isPremium: !!parsed.isPremium,
          subscriptionId: parsed.subscriptionId ?? null,
          firstName: parsed.firstName ?? null,
          lastName: parsed.lastName ?? null,
          phone: parsed.phone ?? null,
        });
      } else if (token) {
        // si no existe "user", lo sacamos del token
        const payload = decodeJwtPayload(token);
        if (payload?.email) {
          setUser({
            email: payload.email,
            role: payload.role,
            isPremium: !!payload.isPremium,
            subscriptionId: payload.subscriptionId ?? null,

            // ✅ si el backend los mete al JWT, aparecen acá.
            // si no están, quedan null y listo.
            firstName: payload.firstName ?? null,
            lastName: payload.lastName ?? null,
            phone: payload.phone ?? null,
          });
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password); // guarda token + user en localStorage

    setAccessToken(data.access_token);

    setUser({
      email: data.user.email,
      role: data.user.role,
      isPremium: data.user.isPremium,
      subscriptionId: data.user.subscriptionId,

      // ✅ nuevos
      firstName: (data.user as any).firstName ?? null,
      lastName: (data.user as any).lastName ?? null,
      phone: (data.user as any).phone ?? null,
    });

    return data;
  };

  const logout = () => {
    authService.logout();
    setAccessToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(() => {
    const isAuth = !!accessToken && !!user;
    const isAdmin = user?.role === "admin";
    const isPremium = !!user?.isPremium;
    const subscriptionId = user?.subscriptionId ?? null;

    const fullName =
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.firstName
        ? user.firstName
        : null;

    return {
      user,
      accessToken,
      isAuth,
      loading,
      login,
      logout,
      isAdmin,
      isPremium,
      subscriptionId,
      fullName,
    };
  }, [user, accessToken, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};
