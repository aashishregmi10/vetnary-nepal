"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, BookUser, Plus, Check } from "lucide-react";
import { useCart } from "@/lib/stores/cart";
import { useAuth } from "@/lib/stores/auth";
import { useAuthModal } from "@/lib/stores/authModal";
import { clientApi, ClientApiError } from "@/lib/client-api";
import { npr } from "@/lib/format";
import { AddAddressModal, type SavedAddress } from "@/components/checkout/AddAddressModal";

const FREE_DELIVERY_THRESHOLD = 2000;
const FLAT_DELIVERY_FEE = 100;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, hydrated: cartHydrated, clear } = useCart();
  const { token, user, hydrated: authHydrated } = useAuth();
  const openAuthModal = useAuthModal((s) => s.open);

  const [personal, setPersonal] = useState({ fullName: "", email: "", phone: "", alternatePhone: "" });
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [onBehalf, setOnBehalf] = useState({ enabled: false, name: "", contact: "" });

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selected, setSelected] = useState<SavedAddress | null>(null);
  const [showSelect, setShowSelect] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Prefill personal info from the logged-in user.
  useEffect(() => {
    if (user) setPersonal((p) => ({ ...p, fullName: p.fullName || user.fullName || "", email: p.email || user.email || "" }));
  }, [user]);

  // Load saved addresses; auto-select the default one.
  useEffect(() => {
    if (!authHydrated || !token) return;
    clientApi
      .get<SavedAddress[]>("/addresses")
      .then((list) => {
        setSavedAddresses(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) setSelected(def);
      })
      .catch(() => {});
  }, [authHydrated, token]);

  useEffect(() => {
    if (authHydrated && !token) openAuthModal("login");
  }, [authHydrated, token, openAuthModal]);

  if (!authHydrated || !cartHydrated) {
    return <div className="mx-auto max-w-4xl px-6 py-16 font-body text-muted">Loading…</div>;
  }
  if (!token) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-text">Sign in to check out</h1>
        <p className="mt-2 font-body text-muted">
          <button onClick={() => openAuthModal("login")} className="text-accent hover:underline">
            Sign in
          </button>{" "}
          to place your order.
        </p>
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-text">Nothing to check out</h1>
        <p className="mt-2 font-body text-muted">Your cart is empty.</p>
        <Link href="/products" className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 font-body font-medium text-white hover:bg-accent-hover">
          Browse products
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const fee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : FLAT_DELIVERY_FEE;

  function setP(field: keyof typeof personal, value: string) {
    setPersonal((p) => ({ ...p, [field]: value }));
  }

  function addressLine(a: SavedAddress) {
    return [a.street, a.municipality, a.district, a.province].filter(Boolean).join(", ");
  }

  async function createOrder(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!selected) {
      setError("Please select a delivery address.");
      return;
    }
    if (onBehalf.enabled && (!onBehalf.name || !onBehalf.contact)) {
      setError("Enter the recipient's name and contact number.");
      return;
    }
    setBusy(true);
    try {
      const order = await clientApi.post<{ orderNumber: string }>("/orders", {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        deliveryAddress: {
          fullName: personal.fullName,
          phone: personal.phone,
          email: personal.email,
          alternatePhone: personal.alternatePhone,
          addressType: selected.label || "Home",
          province: selected.province,
          district: selected.district,
          municipality: selected.municipality,
          street: selected.street,
          landmark: selected.landmark,
        },
        receiveOnBehalf: onBehalf.enabled ? { enabled: true, name: onBehalf.name, contact: onBehalf.contact } : undefined,
        deliveryNotes,
      });
      clear();
      router.replace(`/account/orders?placed=${order.orderNumber}`);
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "Could not create your order");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl text-text">Checkout</h1>

      <form onSubmit={createOrder} className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* LEFT — Shipping Information */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display text-xl text-text">Shipping Information</h2>

            <p className="mt-6 font-body text-sm font-semibold text-text">Personal Information</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label="Full Name *" value={personal.fullName} onChange={(v) => setP("fullName", v)} required />
              <Field label="Email" type="email" value={personal.email} onChange={(v) => setP("email", v)} />
              <Field label="Phone Number *" value={personal.phone} onChange={(v) => setP("phone", v)} required />
              <Field
                label="Alternate Phone Number"
                value={personal.alternatePhone}
                onChange={(v) => setP("alternatePhone", v)}
                placeholder="Enter Alternate Number"
              />
            </div>
            <label className="mt-4 block">
              <span className="font-body text-sm text-text">Delivery Notes</span>
              <textarea
                value={deliveryNotes}
                rows={3}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Add any special instructions for delivery"
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body text-text outline-none focus:border-accent"
              />
            </label>

            {/* Receive On Behalf */}
            <div className="mt-6 flex items-center justify-between">
              <span className="font-body text-sm font-semibold text-text">Receive On Behalf</span>
              <button
                type="button"
                role="switch"
                aria-checked={onBehalf.enabled}
                onClick={() => setOnBehalf((o) => ({ ...o, enabled: !o.enabled }))}
                className={`relative h-6 w-11 rounded-full transition-colors ${onBehalf.enabled ? "bg-accent" : "bg-border"}`}
              >
                <span
                  className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${
                    onBehalf.enabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            {onBehalf.enabled && (
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Field label="Name *" value={onBehalf.name} onChange={(v) => setOnBehalf((o) => ({ ...o, name: v }))} placeholder="Enter recipient name" required />
                <Field label="Contact Number *" value={onBehalf.contact} onChange={(v) => setOnBehalf((o) => ({ ...o, contact: v }))} placeholder="Enter contact number" required />
              </div>
            )}

            <hr className="my-6 border-border" />

            {/* Shipping Address */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-body text-sm font-semibold text-text">Shipping Address</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSelect((s) => !s)}
                  disabled={savedAddresses.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-data text-xs uppercase tracking-wide text-accent transition-colors hover:border-accent disabled:opacity-40"
                >
                  <BookUser className="size-3.5" /> Select Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 font-data text-xs uppercase tracking-wide text-white transition-colors hover:bg-accent-hover"
                >
                  <Plus className="size-3.5" /> Add New
                </button>
              </div>
            </div>

            {showSelect && savedAddresses.length > 0 && (
              <ul className="mt-3 divide-y divide-border rounded-md border border-border">
                {savedAddresses.map((a) => (
                  <li key={a._id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(a);
                        setShowSelect(false);
                      }}
                      className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-bg"
                    >
                      <span className="mt-0.5">
                        {selected?._id === a._id ? <Check className="size-4 text-accent" /> : <span className="block size-4" />}
                      </span>
                      <span>
                        <span className="font-body text-sm font-medium text-text">{a.label || "Address"}</span>
                        <span className="block font-body text-xs text-muted">{addressLine(a)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <label className="mt-4 block">
              <span className="font-body text-sm text-text">Full Address *</span>
              <div className="mt-1 min-h-[46px] w-full rounded-md border border-border bg-bg px-3 py-2.5 font-body text-sm">
                {selected ? (
                  <span className="text-text">{addressLine(selected)}</span>
                ) : (
                  <span className="text-muted">Enter your full address or select from saved addresses</span>
                )}
              </div>
            </label>
            <label className="mt-4 block">
              <span className="font-body text-sm text-text">Nearest Landmark</span>
              <input
                value={selected?.landmark || ""}
                readOnly
                placeholder="Enter landmark (optional)"
                className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2.5 font-body text-sm text-text outline-none"
              />
            </label>

            {error && <p className="mt-4 font-body text-sm text-sale">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full rounded-md bg-accent px-5 py-3.5 font-body font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {busy ? "Placing order…" : "Create Order"}
            </button>
          </div>
        </div>

        {/* RIGHT — Order Summary */}
        <aside className="h-fit rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-xl text-text">Order Summary</h2>
          <ul className="mt-4 divide-y divide-border">
            {items.map((i) => (
              <li key={i.productId} className="flex gap-3 py-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-border bg-bg">
                  {i.coverImage && <Image src={i.coverImage} alt={i.name} fill sizes="48px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-body text-sm font-medium text-text">{i.name}</p>
                  <p className="font-body text-xs text-muted">Qty: {i.quantity}</p>
                </div>
                <p className="shrink-0 font-body text-sm text-text">{npr(i.price * i.quantity)}</p>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-border pt-4 font-body text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="text-text">{npr(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className={fee === 0 ? "text-accent" : "text-text"}>{fee === 0 ? "Free" : npr(fee)}</dd>
            </div>
          </dl>

          {!selected && (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-sale/30 bg-sale/5 px-3 py-2 font-body text-sm text-sale">
              <AlertTriangle className="size-4 shrink-0" />
              Please select a delivery address
            </div>
          )}

          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
            <span className="font-body font-semibold text-text">
              Total <span className="font-normal text-xs text-muted">(inclusive of all applicable tax)</span>
            </span>
            <span className="font-body text-lg font-bold text-text">{npr(subtotal + fee)}</span>
          </div>

          <div className="mt-4 rounded-md bg-bg px-3 py-2 text-center font-body text-sm text-text">Cash on Delivery</div>
        </aside>
      </form>

      {showAddModal && (
        <AddAddressModal
          fullName={personal.fullName}
          phone={personal.phone}
          onClose={() => setShowAddModal(false)}
          onSaved={(addr) => {
            setSavedAddresses((prev) => [...prev, addr]);
            setSelected(addr);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="font-body text-sm text-text">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body text-text outline-none focus:border-accent"
      />
    </label>
  );
}
