import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../modules/auth/types/authTypes";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuth: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuth: false,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      login: (token, user) => set({ token, user, isAuth: true }),
      logout: () => set({ token: null, user: null, isAuth: false }),
    }),
    {
      name: "itm-auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
