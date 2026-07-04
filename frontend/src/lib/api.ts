import type { ApiEnvelope } from "./types";

const API_BASE = process.env.API_URL || "http://localhost:5001/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface GetOptions {
  searchParams?: Record<string, string | number | undefined>;
  revalidate?: number;
  tags?: string[];
}

function buildUrl(path: string, searchParams?: GetOptions["searchParams"]) {
  const url = new URL(`${API_BASE}${path}`);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

// Server-side fetch — used in Server Components. No auth headers: SSR reads only
// hit public catalog endpoints, never anything requiring a logged-in user.
export async function apiGet<T>(path: string, opts: GetOptions = {}): Promise<T> {
  const url = buildUrl(path, opts.searchParams);
  const next: { revalidate?: number; tags?: string[] } = {};
  if (opts.revalidate !== undefined) next.revalidate = opts.revalidate;
  if (opts.tags) next.tags = opts.tags;

  const res = await fetch(url, {
    ...(opts.revalidate !== undefined || opts.tags ? { next } : { cache: "no-store" }),
    headers: { Accept: "application/json" },
  });

  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | { message: string } | null;
  if (!res.ok) {
    throw new ApiError(json && "message" in json ? json.message : "Request failed", res.status);
  }
  return (json as ApiEnvelope<T>).data;
}

export async function apiGetOrNull<T>(path: string, opts: GetOptions = {}): Promise<T | null> {
  try {
    return await apiGet<T>(path, opts);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
