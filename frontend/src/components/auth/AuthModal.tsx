"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuthModal } from "@/lib/stores/authModal";
import { useAuth, type AuthUser } from "@/lib/stores/auth";
import { clientApi, ClientApiError } from "@/lib/client-api";

interface AuthResponse {
  user: AuthUser & { _id?: string };
  accessToken: string;
}

function normalizeUser(u: AuthResponse["user"]): AuthUser {
  return { id: u.id || (u._id as string), email: u.email, fullName: u.fullName, isAdmin: u.isAdmin };
}

export function AuthModal() {
  const { isOpen, mode, close, setMode } = useAuthModal();
  const setAuth = useAuth((s) => s.setAuth);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Reset the form whenever the modal opens or the tab switches, so stale input/errors
  // from a previous attempt never leak into the next one.
  useEffect(() => {
    if (isOpen) {
      setFullName("");
      setEmail("");
      setPassword("");
      setError("");
    }
  }, [isOpen, mode]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!isOpen) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const body = mode === "login" ? { email, password } : { fullName, email, password };
      const res = await clientApi.post<AuthResponse>(path, body);
      setAuth(normalizeUser(res.user), res.accessToken);
      close();
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-text/40 px-4" onClick={close}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-2xl text-text">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-1 font-body text-sm text-muted">
              {mode === "login" ? "Sign in to track orders and save your favourites." : "Join PawMart — it takes about a minute."}
            </p>
          </div>
          <button onClick={close} aria-label="Close" className="text-muted hover:text-text">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === "register" && <Field label="Full name" type="text" value={fullName} onChange={setFullName} />}
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <Field label="Password" type="password" value={password} onChange={setPassword} minLength={mode === "register" ? 8 : undefined} />
          {error && <p className="font-body text-sm text-sale">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-accent px-5 py-3 font-body font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {busy ? (mode === "login" ? "Signing in…" : "Creating…") : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center font-body text-sm text-muted">
          {mode === "login" ? (
            <>
              New here?{" "}
              <button onClick={() => setMode("register")} className="text-accent hover:underline">
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => setMode("login")} className="text-accent hover:underline">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  minLength,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="font-body text-sm text-text">{label}</span>
      <input
        type={type}
        value={value}
        required
        minLength={minLength}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body text-text outline-none focus:border-accent"
      />
    </label>
  );
}
