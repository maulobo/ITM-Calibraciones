import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { officesApi } from "../api/officesApi";

const OFFICES_KEY = ["offices"];

export const useAllOffices = () => {
  return useQuery({
    queryKey: [...OFFICES_KEY, "all"],
    queryFn: officesApi.getAll,
  });
};

export const useOfficesByClient = (clientId?: string) => {
  return useQuery({
    queryKey: [...OFFICES_KEY, clientId],
    queryFn: () => officesApi.getByClient(clientId!),
    enabled: !!clientId,
  });
};

export const useOfficeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: officesApi.createOrUpdate,
    onSuccess: () => {
      // Invalidate all queries that start with ["offices"]
      // This will refresh both useAllOffices and useOfficesByClient
      queryClient.invalidateQueries({ 
        queryKey: OFFICES_KEY,
        exact: false // This ensures it matches all queries starting with ["offices"]
      });
      
      // Also invalidate all-offices specifically
      queryClient.invalidateQueries({ 
        queryKey: [...OFFICES_KEY, "all"]
      });
    },
  });
};
