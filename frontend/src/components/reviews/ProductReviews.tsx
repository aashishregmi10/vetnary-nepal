"use client";

import { useCallback, useEffect, useState } from "react";
import { clientApi } from "@/lib/client-api";
import { ReviewList } from "./ReviewList";
import { ReviewForm } from "./ReviewForm";

interface Review {
  _id: string;
  rating: number;
  title?: string;
  body: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  user: { fullName: string } | null;
}

export function ProductReviews({ slug }: { slug: string }) {
  const [reviews, setReviews] = useState<Review[] | null>(null);

  const load = useCallback(() => {
    clientApi
      .get<Review[]>(`/products/${slug}/reviews`)
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [slug]);

  useEffect(load, [load]);

  return (
    <section aria-label="Reviews" className="mt-8 border-t border-border pt-6">
      <h2 className="font-display text-xl text-text">Reviews</h2>
      <div className="mt-4">{reviews === null ? <p className="font-body text-sm text-muted">Loading…</p> : <ReviewList reviews={reviews} />}</div>
      <div className="mt-5">
        <ReviewForm slug={slug} onPosted={load} />
      </div>
    </section>
  );
}
