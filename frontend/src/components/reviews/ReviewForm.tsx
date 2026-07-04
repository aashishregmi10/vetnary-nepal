"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/lib/stores/auth";
import { useAuthModal } from "@/lib/stores/authModal";
import { clientApi, ClientApiError } from "@/lib/client-api";

export function ReviewForm({ slug, onPosted }: { slug: string; onPosted: () => void }) {
  const { token } = useAuth();
  const openAuthModal = useAuthModal((s) => s.open);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <p className="font-body text-sm text-muted">
        <button onClick={() => openAuthModal("login")} className="text-accent hover:underline">
          Sign in
        </button>{" "}
        to leave a review.
      </p>
    );
  }

  if (done) {
    return <p className="font-body text-sm text-text">Thanks — your review is live.</p>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Pick a star rating first");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await clientApi.post(`/products/${slug}/reviews`, { rating, title, body });
      setDone(true);
      onPosted();
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "Could not post your review");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          const filled = value <= (hoverRating || rating);
          return (
            <button
              key={value}
              type="button"
              aria-label={`Rate ${value} star`}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <Star className={`size-6 ${filled ? "fill-star text-star" : "text-star-empty"}`} />
            </button>
          );
        })}
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="w-full rounded-md border border-border bg-surface px-3 py-2 font-body text-sm outline-none focus:border-accent"
      />
      <textarea
        value={body}
        required
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="What did you think?"
        className="w-full rounded-md border border-border bg-surface px-3 py-2 font-body text-sm outline-none focus:border-accent"
      />
      {error && <p className="font-body text-sm text-sale">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-accent px-4 py-2 font-body text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
      >
        {busy ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}
