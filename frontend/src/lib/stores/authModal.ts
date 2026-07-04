"use client";

import { create } from "zustand";

export type AuthModalMode = "login" | "register";

interface AuthModalState {
  isOpen: boolean;
  mode: AuthModalMode;
  open: (mode?: AuthModalMode) => void;
  close: () => void;
  setMode: (mode: AuthModalMode) => void;
}

export const useAuthModal = create<AuthModalState>((set) => ({
  isOpen: false,
  mode: "login",
  open: (mode = "login") => set({ isOpen: true, mode }),
  close: () => set({ isOpen: false }),
  setMode: (mode) => set({ mode }),
}));
