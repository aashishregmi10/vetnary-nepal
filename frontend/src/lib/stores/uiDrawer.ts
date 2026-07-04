"use client";

import { create } from "zustand";

export type DrawerName = "cart" | "wishlist" | null;

interface UIDrawerState {
  open: DrawerName;
  openDrawer: (name: DrawerName) => void;
  close: () => void;
}

export const useUIDrawer = create<UIDrawerState>((set) => ({
  open: null,
  openDrawer: (name) => set({ open: name }),
  close: () => set({ open: null }),
}));
