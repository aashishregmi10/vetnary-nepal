"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

// TODO: wire up to /api/wishlist once the account-gated wishlist endpoints exist (task #5+).
// For now this is a local-only toggle so the card UI/interaction can be reviewed end-to-end.
export function WishlistButton({ productId, className }: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <button
      onClick={() => setWishlisted((v) => !v)}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      data-product-id={productId}
      className={`group grid size-8 place-items-center rounded-full bg-surface shadow-sm transition-colors ${className || ""}`}
    >
      <Heart
        className={`size-[18px] transition-all group-hover:scale-110 ${
          wishlisted ? "fill-accent text-accent" : "text-muted"
        }`}
      />
    </button>
  );
}
