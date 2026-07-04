"use client";

import { useEffect, useState } from "react";
import { clientApi } from "@/lib/client-api";
import { npr } from "@/lib/format";

interface Stats {
  products: number;
  orders: number;
  users: number;
  pendingReviews: number;
  revenue: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    clientApi
      .get<Stats>("/admin/stats")
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl text-text">Overview</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Products" value={stats?.products} />
        <Stat label="Orders" value={stats?.orders} />
        <Stat label="Customers" value={stats?.users} />
        <Stat label="Revenue" value={stats ? npr(stats.revenue) : undefined} />
      </div>
      {stats && stats.pendingReviews > 0 && (
        <p className="mt-6 font-body text-sm text-muted">
          {stats.pendingReviews} review(s) awaiting moderation.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value?: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="font-body text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl text-text">{value ?? "—"}</p>
    </div>
  );
}
