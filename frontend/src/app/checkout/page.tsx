"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/stores/cart";
import { useAuth } from "@/lib/stores/auth";
import { clientApi, ClientApiError } from "@/lib/client-api";
import { npr } from "@/lib/format";

const PROVINCES = ["Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"];
const FREE_DELIVERY_THRESHOLD = 2000;
const FLAT_DELIVERY_FEE = 100;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, hydrated: cartHydrated, clear } = useCart();
  const { token, hydrated: authHydrated } = useAuth();

  const [form, setForm] = useState({ fullName: "", phone: "", province: "Bagmati", city: "", street: "", landmark: "" });
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Not logged in → send to login and come back here afterward.
  useEffect(() => {
    if (authHydrated && !token) router.replace("/login?next=/checkout");
  }, [authHydrated, token, router]);

  if (!authHydrated || !cartHydrated) {
    return <div className="mx-auto max-w-4xl px-6 py-16 font-body text-muted">Loading…</div>;
  }
  if (!token) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-text">Nothing to check out</h1>
        <p className="mt-2 font-body text-muted">Your cart is empty.</p>
        <Link href="/products" className="mt-6 inline-flex rounded-md bg-accent px-5 py-3 font-body font-medium text-white hover:bg-accent-hover">
          Browse products
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const fee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : FLAT_DELIVERY_FEE;

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const order = await clientApi.post<{ orderNumber: string }>("/orders", {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        deliveryAddress: form,
        customerNote: note,
      });
      clear();
      router.replace(`/account/orders?placed=${order.orderNumber}`);
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "Could not place your order");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl text-text">Checkout</h1>

      <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h2 className="font-display text-xl text-text">Delivery address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={form.fullName} onChange={(v) => set("fullName", v)} required />
            <Field label="Phone" value={form.phone} onChange={(v) => set("phone", v)} required />
            <label className="block">
              <span className="font-body text-sm text-text">Province</span>
              <select
                value={form.province}
                onChange={(e) => set("province", e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body text-text outline-none focus:border-accent"
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <Field label="City" value={form.city} onChange={(v) => set("city", v)} required />
            <Field label="Street / area" value={form.street} onChange={(v) => set("street", v)} />
            <Field label="Landmark (optional)" value={form.landmark} onChange={(v) => set("landmark", v)} />
          </div>
          <label className="block">
            <span className="font-body text-sm text-text">Order note (optional)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body text-text outline-none focus:border-accent"
            />
          </label>
        </div>

        <aside className="h-fit rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-xl text-text">Your order</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3 font-body text-sm">
                <span className="min-w-0 truncate text-text">
                  {i.name} <span className="text-muted">×{i.quantity}</span>
                </span>
                <span className="shrink-0 text-text">{npr(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 font-body text-sm">
            <Row label="Subtotal" value={npr(subtotal)} />
            <Row label="Delivery" value={fee === 0 ? "Free" : npr(fee)} />
            <div className="border-t border-border pt-2">
              <Row label="Total" value={npr(subtotal + fee)} bold />
            </div>
          </dl>
          <div className="mt-4 rounded-md bg-bg px-3 py-2 font-body text-sm text-text">Payment: Cash on Delivery</div>
          {error && <p className="mt-3 font-body text-sm text-sale">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-4 w-full rounded-md bg-accent px-5 py-3 font-body font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {busy ? "Placing order…" : "Place order"}
          </button>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-body text-sm text-text">{label}</span>
      <input
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body text-text outline-none focus:border-accent"
      />
    </label>
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
