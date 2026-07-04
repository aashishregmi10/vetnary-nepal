"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clientApi, ClientApiError } from "@/lib/client-api";
import { useAuth, type AuthUser } from "@/lib/stores/auth";

interface AuthResponse {
  user: AuthUser & { _id?: string };
  accessToken: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await clientApi.post<AuthResponse>("/auth/admin/login", { email, password });
      const u = res.user;
      setAuth({ id: u.id || (u._id as string), email: u.email, fullName: u.fullName, isAdmin: u.isAdmin }, res.accessToken);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-bg px-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8">
        <h1 className="font-display text-2xl text-text">PawMart Admin</h1>
        <p className="mt-1 font-body text-sm text-muted">Sign in with an admin account.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body outline-none focus:border-accent"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body outline-none focus:border-accent"
          />
          {error && <p className="font-body text-sm text-sale">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-accent px-5 py-3 font-body font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
