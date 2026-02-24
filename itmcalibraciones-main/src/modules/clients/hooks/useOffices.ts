import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { officesApi } from "../api/officesApi";

const OFFICES_KEY = ["offices"];

export const useAllOffices = (search?: string) => {
  return useQuery({
    queryKey: [...OFFICES_KEY, "all", search],
    queryFn: () => officesApi.getAll(search),
    placeholderData: keepPreviousData,
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

export const useDeleteOfficeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: officesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OFFICES_KEY, exact: false });
      queryClient.invalidateQueries({ queryKey: [...OFFICES_KEY, "all"] });
    },
  });
};
