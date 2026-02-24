import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../api/usersApi";
import type { MyProfile } from "../types/userTypes";

export const useMyProfile = () => {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: () => usersApi.getMyProfile(),
    staleTime: 5 * 60 * 1000, // 5 min — profile doesn't change often
  });
};

// Helper: extract the clientId from the profile response
// Backend populates office.client but user.client may be the raw ObjectId string
export const extractClientId = (profile?: MyProfile): string | undefined => {
  if (!profile) return undefined;

  // Direct client field (string ObjectId)
  if (typeof profile.client === "string" && profile.client) {
    return profile.client;
  }
  // Populated client object
  if (typeof profile.client === "object" && profile.client?._id) {
    return profile.client._id;
  }
  // Fallback: from populated office.client
  if (typeof profile.office === "object" && typeof profile.office?.client === "object") {
    return profile.office.client?._id;
  }
  return undefined;
};
