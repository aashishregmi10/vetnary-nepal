"use client";

import { use } from "react";
import { ProductForm } from "@/components/admin/ProductForm";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div>
      <h1 className="font-display text-2xl text-text">Edit product</h1>
      <div className="mt-6">
        <ProductForm productId={id} />
      </div>
    </div>
  );
}
