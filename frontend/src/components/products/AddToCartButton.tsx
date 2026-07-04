"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/stores/cart";

interface AddToCartButtonProps {
  product: { productId: string; slug: string; name: string; brand: string; coverImage: string; price: number };
  disabled?: boolean;
  full?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function AddToCartButton({ product, disabled, full, size = "md", className }: AddToCartButtonProps) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  const sizeClasses = size === "sm" ? "px-3 py-2.5 text-sm" : "px-5 py-3 text-sm";
  const base = `inline-flex items-center justify-center gap-2 rounded-md font-body font-medium transition-colors ${sizeClasses} ${
    full ? "w-full" : ""
  } ${className || ""}`;

  if (disabled) {
    return (
      <button disabled className={`${base} border border-border bg-bg text-muted`}>
        Out of stock
      </button>
    );
  }

  function handleAdd() {
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button onClick={handleAdd} className={`${base} bg-accent text-white hover:bg-accent-hover`}>
      {added ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
      {added ? "Added" : "Add"}
    </button>
  );
}
