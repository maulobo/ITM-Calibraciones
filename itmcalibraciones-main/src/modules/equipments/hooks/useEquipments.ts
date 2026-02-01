import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEquipments, updateEquipment } from "../api";

export const useEquipments = (search?: string) => {
  return useQuery({
    queryKey: ["equipments", search],
    queryFn: () => getEquipments(search),
    enabled: true, // Always enabled, or maybe refine
  });
};

export const useUpdateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
    },
  });
};
