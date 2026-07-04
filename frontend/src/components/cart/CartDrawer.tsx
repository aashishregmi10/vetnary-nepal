"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useUIDrawer } from "@/lib/stores/uiDrawer";
import { useCart } from "@/lib/stores/cart";
import { npr } from "@/lib/format";

const FREE_DELIVERY_THRESHOLD = 2000;
const FLAT_DELIVERY_FEE = 100;

export function CartDrawer() {
  const { open, close } = useUIDrawer();
  const isOpen = open === "cart";
  const { items, setQuantity, remove } = useCart();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const fee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : FLAT_DELIVERY_FEE;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-text/40" onClick={close}>
      <div
        className="flex h-full w-full max-w-md flex-col bg-surface shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-xl text-text">Your cart</h2>
          <button onClick={close} aria-label="Close cart" className="text-muted hover:text-text">
            <X className="size-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="size-8 text-muted" />
            <p className="font-body text-muted">
              Your cart&apos;s as empty as a treat jar after a good dog. Let&apos;s fill it back up.
            </p>
            <Link
              href="/products"
              onClick={close}
              className="mt-2 rounded-md bg-accent px-4 py-2 font-body text-sm font-medium text-white hover:bg-accent-hover"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3 py-4">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={close}
                    className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-bg"
                  >
                    {item.coverImage && (
                      <Image src={item.coverImage} alt={item.name} fill sizes="64px" className="object-cover" />
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={close}
                      className="line-clamp-1 font-body text-sm font-medium text-text hover:text-accent"
                    >
                      {item.name}
                    </Link>
                    <p className="font-body text-sm font-bold text-accent">{npr(item.price)}</p>
                    <div className="mt-auto flex items-center gap-2 pt-1">
                      <div className="flex items-center rounded-md border border-border">
                        <button
                          aria-label="Decrease quantity"
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                          className="grid size-6 place-items-center text-text hover:text-accent"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center font-body text-xs">{item.quantity}</span>
                        <button
                          aria-label="Increase quantity"
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                          className="grid size-6 place-items-center text-text hover:text-accent"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <button
                        aria-label="Remove item"
                        onClick={() => remove(item.productId)}
                        className="text-muted hover:text-sale"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-5 py-4">
              <div className="flex justify-between font-body text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="text-text">{npr(subtotal)}</span>
              </div>
              <div className="mt-1 flex justify-between font-body text-sm">
                <span className="text-muted">Delivery</span>
                <span className="text-text">{fee === 0 ? "Free" : npr(fee)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-border pt-2 font-body font-semibold">
                <span className="text-text">Total</span>
                <span className="text-text">{npr(subtotal + fee)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={close}
                className="mt-4 block rounded-md bg-accent px-5 py-3 text-center font-body font-medium text-white hover:bg-accent-hover"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={close}
                className="mt-2 block text-center font-body text-sm text-muted hover:text-accent"
              >
                View full cart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
