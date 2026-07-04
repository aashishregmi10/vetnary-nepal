"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  coverImage: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartLine[];
  hydrated: boolean;
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  setQuantity: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      add: (line, qty = 1) => {
        const existing = get().items.find((i) => i.productId === line.productId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === line.productId ? { ...i, quantity: i.quantity + qty } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...line, quantity: qty }] });
        }
      },
      setQuantity: (productId, qty) =>
        set({
          items:
            qty <= 0
              ? get().items.filter((i) => i.productId !== productId)
              : get().items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)),
        }),
      remove: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "pawmart-cart",
      partialize: (s) => ({ items: s.items }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
