"use client";

import { useEffect, useState } from "react";
import { clientApi } from "@/lib/client-api";
import { npr } from "@/lib/format";

const STATUSES = ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];

interface AdminOrder {
  _id: string;
  orderNumber: string;
  user: { fullName: string; email: string } | null;
  total: number;
  status: string;
  createdAt: string;
  deliveryAddress: { province: string; city: string };
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  function load() {
    clientApi.get<AdminOrder[]>("/admin/orders").then(setOrders).catch(() => {});
  }
  useEffect(load, []);

  async function changeStatus(id: string, status: string) {
    await clientApi.put(`/admin/orders/${id}/status`, { status });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-text">Orders</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full font-body text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Where</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-text">{o.orderNumber}</td>
                <td className="px-4 py-3 text-text">{o.user?.fullName || "—"}</td>
                <td className="px-4 py-3 text-muted">
                  {o.deliveryAddress?.city}, {o.deliveryAddress?.province}
                </td>
                <td className="px-4 py-3 text-text">{npr(o.total)}</td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => changeStatus(o._id, e.target.value)}
                    className="rounded-md border border-border bg-surface px-2 py-1 font-body text-xs outline-none focus:border-accent"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
