import { IUser } from "@/api/types/user.types";
import { UserRolesEnum } from "@/const/userRoles.const";
import create from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

export type Store = {
  authUser: IUser | null;
  userRoles: UserRolesEnum | null;
  isLoggedIn: boolean;
  token: string | null;
  refechTechnicalInform: boolean | null
  refechUserList: boolean | null
  refechInstrumentList: boolean | null,
  refetch: boolean | null
  setUserRoles: (userRoles: UserRolesEnum) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setAuthUser: (authUser: IUser | null) => void;
  setToken: (token: string | null) => void;
  setRefechTechnicalInform: (refech: boolean | null) => void;
  setRefechUserList: (refech: boolean | null) => void;
  setRefechInstrumentList:(refech: boolean | null) => void;
  setRefetch:(refetch: boolean | null) => void;
  reset: () => void;
};

const initialState = {
  authUser: null,
  token: null,
  userRoles: null,
  isLoggedIn: false,
  refechTechnicalInform: false,
  refechUserList: false,
  refechInstrumentList: false,
  refetch: false,
};

const useStore = create<Store>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        setToken: (token) => set((state) => ({ ...state, token })),
        setAuthUser: (authUser) => set((state) => ({ ...state, authUser })),
        setIsLoggedIn: (isLoggedIn) => set((state) => ({ ...state, isLoggedIn })),
        setUserRoles: (userRoles) => set((state) => ({ ...state, userRoles })),
        setRefechTechnicalInform: (refechTechnicalInform) => set((state) => ({ ...state, refechTechnicalInform })),
        setRefechInstrumentList: (refechInstrumentList) => set((state) => ({ ...state, refechInstrumentList })),
        setRefechUserList: (refechUserList) => set((state) => ({ ...state,   refechUserList })),
        setRefetch: (refetch) => set((state) => ({ ...state,   refetch })),
        reset: () => set(initialState),
      }),
      {
        name: "itm-storage", // unique name
        storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      }
    )
  )
);

export default useStore;
