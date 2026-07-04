"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clientApi } from "@/lib/client-api";
import { npr } from "@/lib/format";

interface AdminProduct {
  _id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  stockStatus: string;
  isActive: boolean;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);

  function load() {
    clientApi
      .get<AdminProduct[]>("/admin/products")
      .then(setProducts)
      .catch(() => setProducts([]));
  }
  useEffect(load, []);

  async function del(id: string) {
    if (!confirm("Delete this product?")) return;
    await clientApi.del(`/admin/products/${id}`);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-text">Products</h1>
        <Link href="/admin/products/new" className="rounded-md bg-accent px-4 py-2 font-body text-sm font-medium text-white hover:bg-accent-hover">
          + New product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full font-body text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p._id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 text-text">{p.name}</td>
                <td className="px-4 py-3 text-muted">{p.brand}</td>
                <td className="px-4 py-3 text-text">{npr(p.price)}</td>
                <td className="px-4 py-3">
                  <span className={p.stock <= 0 ? "text-sale" : "text-text"}>{p.stock}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${p._id}`} className="text-accent hover:underline">
                    Edit
                  </Link>
                  <button onClick={() => del(p._id)} className="ml-4 text-muted hover:text-sale">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
