import axios from "../../../api/axios";
import { API_ROUTES } from "../../../api/apiRoutes";

export interface State {
  _id: string;
  nombre: string;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  _id: string;
  name: string;
  state: string;
  createdAt: string;
  updatedAt: string;
}

export const locationsApi = {
  getAllStates: async (): Promise<State[]> => {
    const response = await axios.get(API_ROUTES.LOCATIONS.GET_ALL_STATES);
    return response.data;
  },

  getCitiesByState: async (stateId: string): Promise<City[]> => {
    const response = await axios.get(
      `${API_ROUTES.LOCATIONS.GET_CITIES_BY_STATE}/${stateId}`,
    );
    return response.data;
  },
};
