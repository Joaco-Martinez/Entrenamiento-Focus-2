// src/lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers);

  // solo agregamos JSON si no es FormData
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", // 🔑 necesario para cookies httpOnly
  });

  // evitar crash si la respuesta está vacía
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new Error(data?.message || `API error ${res.status}`);
  }

  return data;
};