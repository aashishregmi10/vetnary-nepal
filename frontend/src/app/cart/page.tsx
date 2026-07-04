"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/stores/cart";
import { npr } from "@/lib/format";

const FREE_DELIVERY_THRESHOLD = 2000;
const FLAT_DELIVERY_FEE = 100;

export default function CartPage() {
  const { items, hydrated, setQuantity, remove } = useCart();

  if (!hydrated) {
    return <div className="mx-auto max-w-4xl px-6 py-16 font-body text-muted">Loading your cart…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <ShoppingBag className="mx-auto size-10 text-muted" />
        <h1 className="mt-5 font-display text-3xl text-text">Your cart is empty</h1>
        <p className="mt-2 font-body text-muted">
          Your cart&apos;s as empty as a treat jar after a good dog. Let&apos;s fill it back up.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-md bg-accent px-5 py-3 font-body font-medium text-white hover:bg-accent-hover"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const fee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : FLAT_DELIVERY_FEE;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl text-text">Your cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <ul className="divide-y divide-border rounded-xl border border-border bg-surface lg:col-span-2">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 p-4">
              <Link
                href={`/products/${item.slug}`}
                className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-bg"
              >
                {item.coverImage && (
                  <Image src={item.coverImage} alt={item.name} fill sizes="80px" className="object-cover" />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/products/${item.slug}`} className="font-body font-medium text-text hover:text-accent">
                  {item.name}
                </Link>
                <p className="font-body text-xs text-muted">{item.brand}</p>
                <p className="mt-1 font-body text-sm font-bold text-accent">{npr(item.price)}</p>

                <div className="mt-auto flex items-center gap-3 pt-2">
                  <div className="flex items-center rounded-md border border-border">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      className="grid size-8 place-items-center text-text hover:text-accent"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-8 text-center font-body text-sm">{item.quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      className="grid size-8 place-items-center text-text hover:text-accent"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <button
                    aria-label="Remove item"
                    onClick={() => remove(item.productId)}
                    className="inline-flex items-center gap-1 font-body text-xs text-muted hover:text-sale"
                  >
                    <Trash2 className="size-4" /> Remove
                  </button>
                </div>
              </div>
              <p className="font-body text-sm font-semibold text-text">{npr(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-xl text-text">Order summary</h2>
          <dl className="mt-4 space-y-2 font-body text-sm">
            <Row label="Subtotal" value={npr(subtotal)} />
            <Row label="Delivery" value={fee === 0 ? "Free" : npr(fee)} />
            <div className="border-t border-border pt-2">
              <Row label="Total" value={npr(subtotal + fee)} bold />
            </div>
          </dl>
          {fee > 0 && (
            <p className="mt-2 font-body text-xs text-muted">
              Add {npr(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery.
            </p>
          )}
          <Link
            href="/checkout"
            className="mt-5 block rounded-md bg-accent px-5 py-3 text-center font-body font-medium text-white hover:bg-accent-hover"
          >
            Checkout
          </Link>
          <p className="mt-2 text-center font-body text-xs text-muted">Cash on delivery</p>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className={bold ? "font-semibold text-text" : "text-muted"}>{label}</dt>
      <dd className={bold ? "font-semibold text-text" : "text-text"}>{value}</dd>
    </div>
  );
}
