import axios from "../../../api/axios";
import { API_ROUTES } from "../../../api/apiRoutes";
import type { CreateOrUpdateClientDTO, Client } from "../types/clientTypes";

export const clientsApi = {
  createOrUpdate: async (data: CreateOrUpdateClientDTO): Promise<Client> => {
    const response = await axios.post(API_ROUTES.CLIENTS.ADD_OR_UPDATE, data);
    return response.data;
  },

  getAll: async (): Promise<Client[]> => {
    // Assuming a standard GET /clients endpoint exists for the list
    const response = await axios.get(API_ROUTES.CLIENTS.GET_ALL);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_ROUTES.CLIENTS.DELETE}/${id}`);
  },
};
