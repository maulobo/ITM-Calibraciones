import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEquipmentTypes,
  createEquipmentType,
  getBrands,
  createBrand,
  getModels,
  createModel,
  getModelById,
  updateModel,
  deleteModel,
} from "../api";
import type {
  ModelFilters, // imported as type
} from "../api";
import type {
  CreateEquipmentTypeDTO,
  CreateBrandDTO,
  CreateModelDTO,
} from "../types";
import type { PaginationParams } from "../../../utils/pagination.types";

// Equipment Types
export const useEquipmentTypes = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ["equipmentTypes", params],
    queryFn: () => getEquipmentTypes(params),
  });
};

export const useCreateEquipmentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEquipmentTypeDTO) => createEquipmentType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipmentTypes"] });
    },
  });
};

// Brands
export const useBrands = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ["brands", params],
    queryFn: () => getBrands(params),
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBrandDTO) => createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

// Models
export const useModels = (filters?: ModelFilters) => {
  return useQuery({
    queryKey: ["models", filters],
    queryFn: () => getModels(filters),
  });
};

export const useCreateModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateModelDTO) => createModel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
    },
  });
};

export const useModel = (id: string | undefined) => {
  return useQuery({
    queryKey: ["model", id],
    queryFn: () => getModelById(id!),
    enabled: !!id,
  });
};

export const useUpdateModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateModelDTO }) =>
      updateModel(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      queryClient.invalidateQueries({ queryKey: ["model", variables.id] });
    },
  });
};

export const useDeleteModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteModel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
    },
  });
};
