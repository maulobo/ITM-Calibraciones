import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getServiceOrders, 
  getServiceOrderById, 
  createServiceOrder 
} from "../api";
import type { CreateServiceOrderDTO } from "../types";

export const useServiceOrders = () => {
  return useQuery({
    queryKey: ["serviceOrders"],
    queryFn: getServiceOrders,
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
