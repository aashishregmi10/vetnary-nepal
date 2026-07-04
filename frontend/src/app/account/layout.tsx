"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/stores/auth";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, hydrated } = useAuth();

  useEffect(() => {
    if (hydrated && !token) router.replace("/login?next=/account");
  }, [hydrated, token, router]);

  if (!hydrated || !token) {
    return <div className="grid min-h-[50vh] place-items-center bg-bg font-body text-muted">Checking access…</div>;
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
