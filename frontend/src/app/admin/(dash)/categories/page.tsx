"use client";

import { useEffect, useState } from "react";
import { clientApi, ClientApiError } from "@/lib/client-api";
import type { Category } from "@/lib/types";

interface AdminCategory extends Omit<Category, "parent"> {
  parent: (Category & { _id: string }) | null | string;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [name, setName] = useState("");
  const [parent, setParent] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  function load() {
    clientApi.get<AdminCategory[]>("/admin/categories").then(setCategories).catch(() => {});
  }
  useEffect(load, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await clientApi.post("/admin/categories", { name, parent: parent || undefined, description });
      setName("");
      setParent("");
      setDescription("");
      load();
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "Could not add");
    }
  }

  async function del(id: string) {
    try {
      await clientApi.del(`/admin/categories/${id}`);
      load();
    } catch (err) {
      alert(err instanceof ClientApiError ? err.message : "Could not delete");
    }
  }

  const parentName = (p: AdminCategory["parent"]) => (p && typeof p === "object" ? p.name : "—");

  return (
    <div>
      <h1 className="font-display text-2xl text-text">Categories</h1>

      <form onSubmit={add} className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4">
        <label className="block">
          <span className="font-body text-sm text-text">Name</span>
          <input
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
            className="mt-1 rounded-md border border-border bg-surface px-3 py-2 font-body outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="font-body text-sm text-text">Parent (optional)</span>
          <select
            value={parent}
            onChange={(e) => setParent(e.target.value)}
            className="mt-1 rounded-md border border-border bg-surface px-3 py-2 font-body outline-none focus:border-accent"
          >
            <option value="">None (top-level)</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block flex-1">
          <span className="font-body text-sm text-text">Description</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 font-body outline-none focus:border-accent"
          />
        </label>
        <button className="rounded-md bg-accent px-4 py-2 font-body text-sm font-medium text-white hover:bg-accent-hover">
          Add
        </button>
      </form>
      {error && <p className="mt-2 font-body text-sm text-sale">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full font-body text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 text-text">{c.name}</td>
                <td className="px-4 py-3 text-muted">{parentName(c.parent)}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{c.slug}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => del(c._id)} className="text-muted hover:text-sale">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
