"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/stores/auth";
import { useAuthModal } from "@/lib/stores/authModal";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { token, hydrated } = useAuth();
  const openAuthModal = useAuthModal((s) => s.open);

  useEffect(() => {
    if (hydrated && !token) openAuthModal("login");
  }, [hydrated, token, openAuthModal]);

  if (!hydrated) {
    return <div className="grid min-h-[50vh] place-items-center bg-bg font-body text-muted">Loading…</div>;
  }

  if (!token) {
    return (
      <div className="grid min-h-[50vh] place-items-center bg-bg px-6 text-center font-body text-muted">
        <div>
          <p>Sign in to see your account.</p>
          <button onClick={() => openAuthModal("login")} className="mt-2 text-accent hover:underline">
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <nav className="mb-8 flex gap-4 border-b border-border pb-4 font-body text-sm">
        <Link href="/account" className="text-text hover:text-accent">
          Overview
        </Link>
        <Link href="/account/orders" className="text-text hover:text-accent">
          Orders
        </Link>
      </nav>
      {children}
    </div>
  );
}
