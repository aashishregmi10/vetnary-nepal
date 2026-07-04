"use client";

import { useState } from "react";
import { clientApi, ClientApiError } from "@/lib/client-api";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await clientApi.post("/contact", { name, email, message });
      setDone(true);
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "Could not send your message");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="font-body text-text">Thanks — we&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-surface p-6">
      <label className="block">
        <span className="font-body text-sm text-text">Name</span>
        <input
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body text-text outline-none focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="font-body text-sm text-text">Email</span>
        <input
          type="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body text-text outline-none focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="font-body text-sm text-text">Message</span>
        <textarea
          value={message}
          required
          rows={4}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body text-text outline-none focus:border-accent"
        />
      </label>
      {error && <p className="font-body text-sm text-sale">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-md bg-accent px-5 py-3 font-body font-medium text-white hover:bg-accent-hover disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
