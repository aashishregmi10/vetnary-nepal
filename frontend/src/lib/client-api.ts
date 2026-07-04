"use client";

import { getToken, setAccessToken, clearAuth } from "./stores/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export class ClientApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const REFRESHABLE_CODES = new Set(["TOKEN_EXPIRED", "INVALID_TOKEN", "NO_TOKEN"]);

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json", ...extra };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function tryRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, { method: "POST", credentials: "include" });
    if (!res.ok) return null;
    const json = await res.json();
    const token = json?.data?.accessToken as string | undefined;
    if (!token) return null;
    setAccessToken(token);
    return token;
  } catch {
    return null;
  }
}

async function request<T>(method: string, path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const doFetch = () =>
    fetch(`${BASE}${path}`, {
      method,
      headers: authHeaders(),
      credentials: "include", // send/receive the httpOnly refresh cookie
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });

  let res = await doFetch();

  if (res.status === 401 || res.status === 403) {
    const json = await res.clone().json().catch(() => null);
    const code = json?.errors?.[0]?.code;
    if (code && REFRESHABLE_CODES.has(code)) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        res = await doFetch();
      } else {
        clearAuth();
      }
    }
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ClientApiError(json?.message || "Request failed", res.status, json?.errors?.[0]?.code);
  }
  return json.data as T;
}

export const clientApi = {
  get: <T>(path: string, opts?: { signal?: AbortSignal }) => request<T>("GET", path, undefined, opts?.signal),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
};
