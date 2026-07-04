"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  isAdmin?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  hydrated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  setUser: (user: AuthUser) => void;
  clear: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hydrated: false,
      setAuth: (user, token) => set({ user, token }),
      setUser: (user) => set({ user }),
      clear: () => set({ user: null, token: null }),
    }),
    {
      name: "pawmart-auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);

export const getToken = () => useAuth.getState().token;
export const setAccessToken = (token: string) => useAuth.setState({ token });
export const clearAuth = () => useAuth.getState().clear();
