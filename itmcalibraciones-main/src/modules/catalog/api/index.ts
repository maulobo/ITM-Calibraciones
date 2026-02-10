import api from "../../../api/axios";
import type {
  EquipmentType,
  Brand,
  Model,
  CreateEquipmentTypeDTO,
  CreateBrandDTO,
  CreateModelDTO,
} from "../types";
import type {
  PaginationParams,
  PaginatedResponse,
} from "../../../utils/pagination.types";

/**
 * Construye query string desde parámetros de paginación
 */
const buildQueryString = (params: PaginationParams): string => {
  const searchParams = new URLSearchParams();

  if (params.limit !== undefined)
    searchParams.append("limit", params.limit.toString());
  if (params.offset !== undefined)
    searchParams.append("offset", params.offset.toString());
  if (params.sort) searchParams.append("sort", params.sort);
  if (params.select)
    params.select.forEach((s) => searchParams.append("select", s));
  if (params.populate)
    params.populate.forEach((p) => searchParams.append("populate", p));

  return searchParams.toString();
};

// --- Equipment Types ---
export const getEquipmentTypes = async (
  params?: PaginationParams,
): Promise<PaginatedResponse<EquipmentType>> => {
  const queryString = params ? buildQueryString(params) : "";
  const { data } = await api.get(
    `/equipment-types${queryString ? `?${queryString}` : ""}`,
  );

  // Si el backend no devuelve formato paginado, adaptarlo
  if (Array.isArray(data)) {
    return {
      data,
      pagination: {
        total: data.length,
        limit: params?.limit || data.length,
        offset: params?.offset || 0,
        page:
          Math.floor((params?.offset || 0) / (params?.limit || data.length)) +
          1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  return data;
};

export const createEquipmentType = async (
  dto: CreateEquipmentTypeDTO,
): Promise<EquipmentType> => {
  const { data } = await api.post("/equipment-types", dto);
  return data;
};

// --- Brands ---
export const getBrands = async (
  params?: PaginationParams,
): Promise<PaginatedResponse<Brand>> => {
  const queryString = params ? buildQueryString(params) : "";
  const { data } = await api.get(
    `/brands${queryString ? `?${queryString}` : ""}`,
  );

  // Si el backend no devuelve formato paginado, adaptarlo
  if (Array.isArray(data)) {
    return {
      data,
      pagination: {
        total: data.length,
        limit: params?.limit || data.length,
        offset: params?.offset || 0,
        page:
          Math.floor((params?.offset || 0) / (params?.limit || data.length)) +
          1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  return data;
};

export const createBrand = async (dto: CreateBrandDTO): Promise<Brand> => {
  const { data } = await api.post("/brands", dto);
  return data;
};

// --- Models ---
export interface ModelFilters extends PaginationParams {
  equipmentType?: string;
  brand?: string;
}

export const getModels = async (
  filters?: ModelFilters,
): Promise<PaginatedResponse<Model>> => {
  const params = new URLSearchParams();

  // Filtros específicos
  if (filters?.equipmentType)
    params.append("equipmentType", filters.equipmentType);
  if (filters?.brand) params.append("brand", filters.brand);

  // Parámetros de paginación
  if (filters?.limit !== undefined)
    params.append("limit", filters.limit.toString());
  if (filters?.offset !== undefined)
    params.append("offset", filters.offset.toString());
  if (filters?.sort) params.append("sort", filters.sort);
  if (filters?.select)
    filters.select.forEach((s) => params.append("select", s));
  if (filters?.populate)
    filters.populate.forEach((p) => params.append("populate", p));

  const { data } = await api.get(`/models?${params.toString()}`);

  // Si el backend no devuelve formato paginado, adaptarlo
  if (Array.isArray(data)) {
    return {
      data,
      pagination: {
        total: data.length,
        limit: filters?.limit || data.length,
        offset: filters?.offset || 0,
        page:
          Math.floor((filters?.offset || 0) / (filters?.limit || data.length)) +
          1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  return data;
};

export const createModel = async (dto: CreateModelDTO): Promise<Model> => {
  const { data } = await api.post("/models", dto);
  return data;
};

export const getModelById = async (id: string): Promise<Model> => {
  const { data } = await api.get(`/models/${id}`);
  return data;
};

export const updateModel = async (
  id: string,
  dto: CreateModelDTO,
): Promise<Model> => {
  const { data } = await api.patch(`/models/${id}`, dto);
  return data;
};

export const deleteModel = async (id: string): Promise<void> => {
  await api.delete(`/models/${id}`);
};
