"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService, LoginResponse } from "@/services/auth.service";

type Role = "USER" | "ADMIN" | "user" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;

  firstName: string | null;
  lastName: string | null;
  country: string | null;

  // opcionales por compatibilidad con backend actual
  isPremium?: boolean;
  subscriptionId?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuth: boolean;
  loading: boolean;

  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;

  isAdmin: boolean;
  isPremium: boolean;
  subscriptionId: string | null;
  fullName: string | null;
  country: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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

  useEffect(() => {
    try {
      const token = localStorage.getItem("access_token");
      const userRaw = localStorage.getItem("user");

      if (token) setAccessToken(token);

      if (userRaw) {
        const parsed = JSON.parse(userRaw);

        setUser({
          id: parsed.id,
          email: parsed.email,
          role: parsed.role,
          firstName: parsed.firstName ?? null,
          lastName: parsed.lastName ?? null,
          country: parsed.country ?? "arg",
          isPremium: parsed.isPremium ?? false,
          subscriptionId: parsed.subscriptionId ?? null,
        });
      } else if (token) {
        const payload = decodeJwtPayload(token);

        if (payload?.email) {
          setUser({
            id: payload.id,
            email: payload.email,
            role: payload.role,
            firstName: payload.firstName ?? null,
            lastName: payload.lastName ?? null,
            country: payload.country ?? "arg",
            isPremium: payload.isPremium ?? false,
            subscriptionId: payload.subscriptionId ?? null,
          });
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);

    setAccessToken(data.access_token);

    setUser({
      id: (data.user as any).id,
      email: data.user.email,
      role: data.user.role,
      firstName: (data.user as any).firstName ?? null,
      lastName: (data.user as any).lastName ?? null,
      country: (data.user as any).country ?? "arg",
      isPremium: (data.user as any).isPremium ?? false,
      subscriptionId: (data.user as any).subscriptionId ?? null,
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
      accessToken,
      isAuth,
      loading,
      login,
      logout,
      isAdmin,
      isPremium,
      subscriptionId,
      fullName,
      country,
    };
  }, [user, accessToken, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};