import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getEquipmentTypes, 
  createEquipmentType, 
  getBrands, 
  createBrand,
  getModels,
  createModel,
} from "../api";
import type { 
  ModelFilters // imported as type
} from "../api";
import type { 
  CreateEquipmentTypeDTO, 
  CreateBrandDTO,
  CreateModelDTO 
} from "../types";

// Equipment Types
export const useEquipmentTypes = () => {
  return useQuery({
    queryKey: ["equipmentTypes"],
    queryFn: getEquipmentTypes,
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
export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
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
