// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", // importante para enviar/recibir cookies
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || `Error ${res.status}`);
  }

  return data;
};