"use client";

import { getToken } from "./stores/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export class UploadError extends Error {}

export async function uploadImage(file: File): Promise<{ publicId: string; secureUrl: string }> {
  const form = new FormData();
  form.append("image", file);

  const token = getToken();
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: "include",
    body: form,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new UploadError(json?.message || "Upload failed");
  return json.data;
}
