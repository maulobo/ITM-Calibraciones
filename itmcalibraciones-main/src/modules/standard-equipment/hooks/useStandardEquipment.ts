import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/standardEquipmentApi";
import type {
  CreateStandardEquipmentDTO,
  UpdateStandardEquipmentDTO,
} from "../types";

const QUERY_KEY = ["standard-equipment"];

export const useStandardEquipment = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: api.getStandardEquipment,
  });
};

export const useStandardEquipmentById = (id: string) => {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => api.getStandardEquipmentById(id),
    enabled: !!id,
  });
};

export const useCreateStandardEquipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateStandardEquipmentDTO) =>
      api.createStandardEquipment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useUpdateStandardEquipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateStandardEquipmentDTO;
    }) => api.updateStandardEquipment(id, dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, data._id] });
    },
  });
};

export const useDeleteStandardEquipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteStandardEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};
