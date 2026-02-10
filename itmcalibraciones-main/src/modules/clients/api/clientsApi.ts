import axios from "../../../api/axios";
import { API_ROUTES } from "../../../api/apiRoutes";
import type { CreateOrUpdateClientDTO, Client } from "../types/clientTypes";
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

export const clientsApi = {
  createOrUpdate: async (data: CreateOrUpdateClientDTO): Promise<Client> => {
    const response = await axios.post(API_ROUTES.CLIENTS.ADD_OR_UPDATE, data);
    return response.data;
  },

  getAll: async (
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Client>> => {
    const queryString = params ? buildQueryString(params) : "";
    const response = await axios.get(
      `${API_ROUTES.CLIENTS.GET_ALL}${queryString ? `?${queryString}` : ""}`,
    );
    const data = response.data;

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
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_ROUTES.CLIENTS.DELETE}/${id}`);
  },
};
