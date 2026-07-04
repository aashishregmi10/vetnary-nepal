"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/stores/auth";
import { useAuthModal } from "@/lib/stores/authModal";
import { clientApi } from "@/lib/client-api";
import { ProductCard } from "@/components/products/ProductCard";
import type { ProductCardData } from "@/lib/types";

export default function WishlistPage() {
  const { token, hydrated } = useAuth();
  const openAuthModal = useAuthModal((s) => s.open);
  const [items, setItems] = useState<ProductCardData[] | null>(null);

  useEffect(() => {
    if (!hydrated || !token) return;
    clientApi
      .get<ProductCardData[]>("/wishlist")
      .then(setItems)
      .catch(() => setItems([]));
  }, [hydrated, token]);

  if (!hydrated) {
    return <div className="mx-auto max-w-5xl px-6 py-16 font-body text-muted">Loading…</div>;
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <Heart className="mx-auto size-10 text-muted" />
        <h1 className="mt-5 font-display text-3xl text-text">Your wishlist</h1>
        <p className="mt-2 font-body text-muted">
          <button onClick={() => openAuthModal("login")} className="text-accent hover:underline">
            Sign in
          </button>{" "}
          to see the things you&apos;ve saved for later.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10 sm:px-8 lg:px-16 xl:px-24">
      <h1 className="font-display text-3xl text-text">Your wishlist</h1>

      {items === null ? (
        <p className="mt-6 font-body text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-6 font-body text-muted">
          Nothing saved yet — tap the heart on anything your pet would lose their mind over.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
