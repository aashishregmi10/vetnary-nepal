"use client";

import { useEffect, useState } from "react";
import { clientApi } from "@/lib/client-api";

interface AdminReview {
  _id: string;
  rating: number;
  title?: string;
  body: string;
  isApproved: boolean;
  product: { name: string; slug: string } | null;
  user: { fullName: string } | null;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);

  function load() {
    clientApi.get<AdminReview[]>("/admin/reviews").then(setReviews).catch(() => {});
  }
  useEffect(load, []);

  async function approve(id: string) {
    await clientApi.put(`/admin/reviews/${id}/approve`);
    load();
  }
  async function del(id: string) {
    if (!confirm("Delete this review?")) return;
    await clientApi.del(`/admin/reviews/${id}`);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-text">Reviews</h1>
      {reviews.length === 0 ? (
        <p className="mt-6 font-body text-muted">No reviews yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {reviews.map((r) => (
            <li key={r._id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <p className="font-body text-sm text-text">
                  <span className="font-mono text-accent">{"★".repeat(r.rating)}</span> · {r.product?.name || "—"} ·{" "}
                  <span className="text-muted">{r.user?.fullName || "Anonymous"}</span>
                </p>
                <span className={`font-body text-xs ${r.isApproved ? "text-text" : "text-sale"}`}>
                  {r.isApproved ? "Approved" : "Pending"}
                </span>
              </div>
              {r.title && <p className="mt-2 font-body font-medium text-text">{r.title}</p>}
              <p className="mt-1 font-body text-sm text-muted">{r.body}</p>
              <div className="mt-3 flex gap-4 font-body text-sm">
                {!r.isApproved && (
                  <button onClick={() => approve(r._id)} className="text-accent hover:underline">
                    Approve
                  </button>
                )}
                <button onClick={() => del(r._id)} className="text-muted hover:text-sale">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
