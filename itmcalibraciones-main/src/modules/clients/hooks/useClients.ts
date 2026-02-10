import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "../api/clientsApi";
import type { CreateOrUpdateClientDTO } from "../types/clientTypes";
import type { PaginationParams } from "../../../utils/pagination.types";

export const useClients = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ["clients", params],
    queryFn: () => clientsApi.getAll(params),
  });
};

export const useClientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrUpdateClientDTO) =>
      clientsApi.createOrUpdate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};

export const useDeleteClientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};
