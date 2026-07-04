"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { clientApi, ClientApiError } from "@/lib/client-api";
import { useAuth, type AuthUser } from "@/lib/stores/auth";

interface AuthResponse {
  user: AuthUser & { _id?: string };
  accessToken: string;
}

function normalizeUser(u: AuthResponse["user"]): AuthUser {
  return { id: u.id || (u._id as string), email: u.email, fullName: u.fullName, isAdmin: u.isAdmin };
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
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
      const res = await clientApi.post<AuthResponse>("/auth/login", { email, password });
      setAuth(normalizeUser(res.user), res.accessToken);
      router.replace(params.get("next") || "/account");
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-3xl text-text">Welcome back</h1>
      <p className="mt-2 font-body text-muted">Sign in to track orders and save your favourites.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="Password" type="password" value={password} onChange={setPassword} />
        {error && <p className="font-body text-sm text-sale">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-accent px-5 py-3 font-body font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 font-body text-sm text-muted">
        New here?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-body text-sm text-text">{label}</span>
      <input
        type={type}
        value={value}
        required
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body text-text outline-none focus:border-accent"
      />
    </label>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
