// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // Si querés manejar errores prolijo:
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);

  return data;
};
