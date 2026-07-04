"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Heart } from "lucide-react";
import { useUIDrawer } from "@/lib/stores/uiDrawer";
import { useAuth } from "@/lib/stores/auth";
import { useAuthModal } from "@/lib/stores/authModal";
import { useWishlist } from "@/lib/stores/wishlist";
import { clientApi } from "@/lib/client-api";
import { npr } from "@/lib/format";
import type { ProductCardData } from "@/lib/types";

export function WishlistDrawer() {
  const { open, close, openDrawer } = useUIDrawer();
  const isOpen = open === "wishlist";
  const { token } = useAuth();
  const removeFromWishlist = useWishlist((s) => s.remove);
  const [items, setItems] = useState<ProductCardData[] | null>(null);

  useEffect(() => {
    if (!isOpen || !token) return;
    clientApi
      .get<ProductCardData[]>("/wishlist")
      .then(setItems)
      .catch(() => setItems([]));
  }, [isOpen, token]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!isOpen) return null;

  async function handleRemove(productId: string) {
    await removeFromWishlist(productId);
    setItems((prev) => (prev ? prev.filter((p) => p._id !== productId) : prev));
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-text/40" onClick={close}>
      <div
        className="flex h-full w-full max-w-md flex-col bg-surface shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-xl text-text">Your wishlist</h2>
          <button onClick={close} aria-label="Close wishlist" className="text-muted hover:text-text">
            <X className="size-5" />
          </button>
        </div>

        {!token ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <Heart className="size-8 text-muted" />
            <p className="font-body text-muted">
              <button
                onClick={() => {
                  close();
                  useAuthModal.getState().open("login");
                }}
                className="text-accent hover:underline"
              >
                Sign in
              </button>{" "}
              to see the things you&apos;ve saved for later.
            </p>
          </div>
        ) : items === null ? (
          <p className="px-5 py-6 font-body text-muted">Loading…</p>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <Heart className="size-8 text-muted" />
            <p className="font-body text-muted">
              Nothing saved yet — tap the heart on anything your pet would lose their mind over.
            </p>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
            {items.map((p) => (
              <li key={p._id} className="flex gap-3 py-4">
                <Link
                  href={`/products/${p.slug}`}
                  onClick={() => openDrawer(null)}
                  className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-bg"
                >
                  {p.coverImage?.secureUrl && (
                    <Image src={p.coverImage.secureUrl} alt={p.name} fill sizes="64px" className="object-cover" />
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={`/products/${p.slug}`}
                    onClick={() => openDrawer(null)}
                    className="line-clamp-1 font-body text-sm font-medium text-text hover:text-accent"
                  >
                    {p.name}
                  </Link>
                  <p className="font-body text-sm font-bold text-accent">{npr(p.price)}</p>
                  <button
                    onClick={() => handleRemove(p._id)}
                    className="mt-auto self-start font-body text-xs text-muted hover:text-sale"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {items && items.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <Link
              href="/wishlist"
              onClick={close}
              className="block text-center font-body text-sm text-muted hover:text-accent"
            >
              View full wishlist
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
