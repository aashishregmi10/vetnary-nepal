"use client";

import { create } from "zustand";
import { clientApi } from "@/lib/client-api";
import type { ProductCardData } from "@/lib/types";

interface WishlistState {
  ids: Set<string>;
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  has: (productId: string) => boolean;
  add: (productId: string) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  reset: () => void;
}

export const useWishlist = create<WishlistState>((set, get) => ({
  ids: new Set(),
  loaded: false,
  loading: false,
  load: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    try {
      const items = await clientApi.get<ProductCardData[]>("/wishlist");
      set({ ids: new Set(items.map((p) => p._id)), loaded: true });
    } catch {
      // not logged in, or request failed — leave wishlist empty rather than erroring the whole page
      set({ loaded: true });
    } finally {
      set({ loading: false });
    }
  },
  has: (productId) => get().ids.has(productId),
  add: async (productId) => {
    const prev = new Set(get().ids);
    set({ ids: new Set(prev).add(productId) }); // optimistic
    try {
      await clientApi.post("/wishlist", { productId });
    } catch {
      set({ ids: prev }); // rollback
      throw new Error("Could not add to wishlist");
    }
  },
  remove: async (productId) => {
    const prev = new Set(get().ids);
    const next = new Set(prev);
    next.delete(productId);
    set({ ids: next }); // optimistic
    try {
      await clientApi.del(`/wishlist/${productId}`);
    } catch {
      set({ ids: prev }); // rollback
      throw new Error("Could not remove from wishlist");
    }
  },
  reset: () => set({ ids: new Set(), loaded: false }),
}));
