"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/stores/auth";
import { useWishlist } from "@/lib/stores/wishlist";
import { clientApi } from "@/lib/client-api";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reviews", label: "Reviews" },
];

export default function AdminDashLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, hydrated, clear } = useAuth();

  useEffect(() => {
    if (hydrated && (!token || !user?.isAdmin)) router.replace("/admin/login");
  }, [hydrated, token, user, router]);

  if (!hydrated || !user?.isAdmin) {
    return <div className="grid min-h-screen place-items-center bg-bg font-body text-muted">Checking access…</div>;
  }

  async function logout() {
    try {
      await clientApi.post("/auth/logout");
    } catch {
      /* ignore */
    }
    clear();
    useWishlist.getState().reset();
    router.replace("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface p-5 md:block">
        <p className="font-display text-xl text-text">PawMart Admin</p>
        <nav className="mt-6 space-y-1">
          {NAV.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 font-body text-sm ${
                  active ? "bg-accent text-white" : "text-text hover:bg-bg"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="mt-8 w-full rounded-md border border-border px-3 py-2 font-body text-sm text-text hover:border-accent hover:text-accent"
        >
          Sign out
        </button>
      </aside>
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
