import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getServiceOrders,
  getServiceOrderById,
  getServiceOrdersByClient,
  createServiceOrder,
  updateServiceOrder,
} from "../api";
import type { CreateServiceOrderDTO, UpdateServiceOrderDTO } from "../types";

export const useServiceOrders = () => {
  return useQuery({
    queryKey: ["serviceOrders"],
    queryFn: getServiceOrders,
  });
};

export const useServiceOrdersByClient = (clientId?: string) => {
  return useQuery({
    queryKey: ["serviceOrders", "client", clientId],
    queryFn: () => getServiceOrdersByClient(clientId!),
    enabled: !!clientId,
  });
};

export const useServiceOrder = (id: string) => {
  return useQuery({
    queryKey: ["serviceOrder", id],
    queryFn: () => getServiceOrderById(id),
    enabled: !!id,
  });
};

export const useCreateServiceOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServiceOrderDTO) => createServiceOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrders"] });
    },
  });
};

export const useUpdateServiceOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateServiceOrderDTO }) =>
      updateServiceOrder(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrder", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["serviceOrders"] });
    },
  });
};
