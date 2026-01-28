import axios from "../../../api/axios";
import { API_ROUTES } from "../../../api/apiRoutes";
import type { CreateOrUpdateOfficeDTO, Office } from "../types/officeTypes";

export const officesApi = {
  createOrUpdate: async (data: CreateOrUpdateOfficeDTO): Promise<Office> => {
    const response = await axios.post(API_ROUTES.OFFICES.ADD_OR_UPDATE, data);
    return response.data;
  },

  getAll: async (): Promise<Office[]> => {
    const response = await axios.get(API_ROUTES.OFFICES.GET_ALL);
    return response.data;
  },

  getByClient: async (clientId: string): Promise<Office[]> => {
    const url = `${API_ROUTES.OFFICES.GET_ALL}?client=${clientId}`;
    console.log('🔍 [officesApi] Fetching offices for client:', clientId);
    console.log('🔍 [officesApi] Full URL:', url);
    const response = await axios.get(url);
    console.log('🔍 [officesApi] Response data:', response.data);
    console.log('🔍 [officesApi] Number of offices:', response.data?.length);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_ROUTES.OFFICES.DELETE}/${id}`);
  },
};
