"use client";

import Link from "next/link";
import { Heart, ShoppingBag, User } from "lucide-react";
import { useUIDrawer } from "@/lib/stores/uiDrawer";
import { useAuthModal } from "@/lib/stores/authModal";
import { useAuth } from "@/lib/stores/auth";

export function Header() {
  const openDrawer = useUIDrawer((s) => s.openDrawer);
  const openAuthModal = useAuthModal((s) => s.open);
  const { token, hydrated } = useAuth();

  return (
    <header className="border-b border-border bg-bg">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-6 py-4 sm:px-8 lg:px-16 xl:px-24">
        <Link href="/" className="font-display text-2xl text-text">
          PawMart
        </Link>
        <nav className="hidden items-center gap-6 font-body text-sm text-text sm:flex">
          <Link href="/products" className="hover:text-accent">
            Shop
          </Link>
          <Link href="/species/dog" className="hover:text-accent">
            Dogs
          </Link>
          <Link href="/species/cat" className="hover:text-accent">
            Cats
          </Link>
          <Link href="/about" className="hover:text-accent">
            About
          </Link>
          <Link href="/contact" className="hover:text-accent">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={() => openDrawer("wishlist")} aria-label="Wishlist" className="text-text hover:text-accent">
            <Heart className="size-5" />
          </button>
          <button onClick={() => openDrawer("cart")} aria-label="Cart" className="text-text hover:text-accent">
            <ShoppingBag className="size-5" />
          </button>
          {hydrated && token ? (
            <Link href="/account" aria-label="Account" className="text-text hover:text-accent">
              <User className="size-5" />
            </Link>
          ) : (
            <button onClick={() => openAuthModal("login")} aria-label="Sign in" className="text-text hover:text-accent">
              <User className="size-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
