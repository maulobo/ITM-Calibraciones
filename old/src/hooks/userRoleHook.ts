import { useEffect } from "react";

import { UserRolesEnum } from "@/const/userRoles.const";
import useStore, { Store } from "@/store";

export const useUserRole = (): UserRolesEnum | null => {
    const store = useStore();
    const userRoles = useStore((state: Store) => state.userRoles);

  useEffect(() => {
    return () => {};
  }, []);

  return userRoles;
};