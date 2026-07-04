"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/stores/auth";
import { clientApi } from "@/lib/client-api";

export default function AccountPage() {
  const router = useRouter();
  const { user, clear } = useAuth();

  async function logout() {
    try {
      await clientApi.post("/auth/logout");
    } catch {
      /* ignore — clear locally regardless */
    }
    clear();
    router.replace("/");
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-text">Hi, {user?.fullName?.split(" ")[0] || "there"}</h1>
      <p className="mt-2 font-body text-muted">{user?.email}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/account/orders" className="rounded-xl border border-border bg-surface p-5 hover:border-accent">
          <p className="font-display text-lg text-text">Your orders</p>
          <p className="mt-1 font-body text-sm text-muted">Track deliveries and view past orders.</p>
        </Link>
        <Link href="/wishlist" className="rounded-xl border border-border bg-surface p-5 hover:border-accent">
          <p className="font-display text-lg text-text">Wishlist</p>
          <p className="mt-1 font-body text-sm text-muted">Everything you&apos;ve saved for later.</p>
        </Link>
      </div>

      <button
        onClick={logout}
        className="mt-8 rounded-md border border-border px-4 py-2 font-body text-sm text-text hover:border-accent hover:text-accent"
      >
        Sign out
      </button>
    </div>
  );
}
