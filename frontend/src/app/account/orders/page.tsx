"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { clientApi } from "@/lib/client-api";
import { npr } from "@/lib/format";

interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
}
interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

function OrdersList() {
  const params = useSearchParams();
  const placed = params.get("placed");
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    clientApi
      .get<Order[]>("/orders")
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  if (orders === null) return <p className="font-body text-muted">Loading your orders…</p>;

  return (
    <div>
      <h1 className="font-display text-3xl text-text">Your orders</h1>

      {placed && (
        <div className="mt-4 rounded-md border border-accent/40 bg-accent/5 px-4 py-3 font-body text-sm text-text">
          Order <span className="font-semibold">{placed}</span> placed — you&apos;ll pay cash on delivery. Thank you!
        </div>
      )}

      {orders.length === 0 ? (
        <p className="mt-6 font-body text-muted">
          No orders yet — when you place one, it&apos;ll show up here to track.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((o) => (
            <li key={o._id} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-body font-semibold text-text">{o.orderNumber}</p>
                  <p className="font-body text-xs text-muted">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="rounded-full bg-accent/10 px-3 py-1 font-body text-xs font-medium text-accent">
                  {STATUS_LABEL[o.status] || o.status}
                </span>
              </div>
              <ul className="mt-3 space-y-1 font-body text-sm text-muted">
                {o.items.map((i) => (
                  <li key={i.product}>
                    {i.name} <span className="text-muted">×{i.quantity}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-border pt-3 font-body text-sm font-semibold text-text">
                Total {npr(o.total)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <Link href="/products" className="mt-8 inline-block font-body text-sm text-accent hover:underline">
        ← Keep shopping
      </Link>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<p className="font-body text-muted">Loading…</p>}>
      <OrdersList />
    </Suspense>
  );
}
