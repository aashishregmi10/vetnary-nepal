"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clientApi, ClientApiError } from "@/lib/client-api";
import { ImageUpload } from "./ImageUpload";
import type { Category } from "@/lib/types";

const SPECIES = ["dog", "cat", "bird", "fish", "small-pet", "reptile"];

export interface ProductFormValues {
  name: string;
  brand: string;
  species: string;
  category: string;
  price: string;
  comparePrice: string;
  stock: string;
  coverImageUrl: string;
  shortDescription: string;
  description: string;
  suitableFor: string;
  isActive: boolean;
}

const EMPTY: ProductFormValues = {
  name: "",
  brand: "",
  species: "dog",
  category: "",
  price: "",
  comparePrice: "",
  stock: "0",
  coverImageUrl: "",
  shortDescription: "",
  description: "",
  suitableFor: "",
  isActive: true,
};

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormValues>(EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    clientApi.get<Category[]>("/admin/categories").then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!productId) return;
    clientApi
      .get<Record<string, unknown>>(`/admin/products/${productId}`)
      .then((p) => {
        setForm({
          name: (p.name as string) || "",
          brand: (p.brand as string) || "",
          species: (p.species as string) || "dog",
          category: ((p.category as { _id: string })?._id as string) || (p.category as string) || "",
          price: String(p.price ?? ""),
          comparePrice: p.comparePrice ? String(p.comparePrice) : "",
          stock: String(p.stock ?? "0"),
          coverImageUrl: ((p.coverImage as { secureUrl: string })?.secureUrl as string) || "",
          shortDescription: (p.shortDescription as string) || "",
          description: (p.description as string) || "",
          suitableFor: ((p.specifications as { suitableFor?: string })?.suitableFor as string) || "",
          isActive: p.isActive !== false,
        });
      })
      .catch(() => {});
  }, [productId]);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const payload = {
      name: form.name,
      brand: form.brand,
      species: form.species,
      category: form.category,
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
      stock: Number(form.stock),
      coverImageUrl: form.coverImageUrl,
      shortDescription: form.shortDescription,
      description: form.description,
      specifications: { suitableFor: form.suitableFor },
      isActive: form.isActive,
    };
    try {
      if (productId) await clientApi.put(`/admin/products/${productId}`, payload);
      else await clientApi.post("/admin/products", payload);
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4">
      <Field label="Name" value={form.name} onChange={(v) => set("name", v)} required />
      <Field label="Brand" value={form.brand} onChange={(v) => set("brand", v)} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Species" value={form.species} options={SPECIES} onChange={(v) => set("species", v)} />
        <label className="block">
          <span className="font-body text-sm text-text">Category</span>
          <select
            value={form.category}
            required
            onChange={(e) => set("category", e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body outline-none focus:border-accent"
          >
            <option value="">Select…</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Price (NPR)" type="number" value={form.price} onChange={(v) => set("price", v)} required />
        <Field label="Compare price" type="number" value={form.comparePrice} onChange={(v) => set("comparePrice", v)} />
        <Field label="Stock" type="number" value={form.stock} onChange={(v) => set("stock", v)} required />
      </div>
      <ImageUpload value={form.coverImageUrl} onChange={(v) => set("coverImageUrl", v)} />
      <Field label="Suitable for" value={form.suitableFor} onChange={(v) => set("suitableFor", v)} />
      <Field label="Short description" value={form.shortDescription} onChange={(v) => set("shortDescription", v)} />
      <label className="block">
        <span className="font-body text-sm text-text">Description</span>
        <textarea
          value={form.description}
          rows={4}
          onChange={(e) => set("description", e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body outline-none focus:border-accent"
        />
      </label>
      <label className="flex items-center gap-2 font-body text-sm text-text">
        <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
        Active (visible in store)
      </label>

      {error && <p className="font-body text-sm text-sale">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-accent px-5 py-3 font-body font-medium text-white hover:bg-accent-hover disabled:opacity-60"
      >
        {busy ? "Saving…" : productId ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-body text-sm text-text">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body outline-none focus:border-accent"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-body text-sm text-text">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body outline-none focus:border-accent"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
