"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/stores/auth";
import { useAuthModal } from "@/lib/stores/authModal";
import { useWishlist } from "@/lib/stores/wishlist";

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export function WishlistButton({ productId, className }: WishlistButtonProps) {
  const { token, hydrated } = useAuth();
  const openAuthModal = useAuthModal((s) => s.open);
  const { has, add, remove, load } = useWishlist();
  const [busy, setBusy] = useState(false);
  const wishlisted = has(productId);

  useEffect(() => {
    if (hydrated && token) load();
  }, [hydrated, token, load]);

  async function toggle() {
    if (!token) {
      openAuthModal("login");
      return;
    }
    setBusy(true);
    try {
      if (wishlisted) await remove(productId);
      else await add(productId);
    } catch {
      /* store already rolled back optimistic update */
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      data-product-id={productId}
      className={`group grid size-8 place-items-center rounded-full bg-surface shadow-sm transition-colors disabled:opacity-60 ${className || ""}`}
    >
      <Heart
        className={`size-[18px] transition-all group-hover:scale-110 ${
          wishlisted ? "fill-accent text-accent" : "text-muted"
        }`}
      />
    </button>
  );
}
