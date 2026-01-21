import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../modules/auth/types/authTypes";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuth: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuth: false,
      login: (token, user) => set({ token, user, isAuth: true }),
      logout: () => set({ token: null, user: null, isAuth: false }),
    }),
    {
      name: "itm-auth-storage",
    },
  ),
);
