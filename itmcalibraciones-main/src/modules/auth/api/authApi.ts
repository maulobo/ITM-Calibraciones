import api from "../../../api/axios";
import type { LoginRequest, LoginResponse } from "../types/authTypes";

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/auth/login", credentials);
    return data;
  },
};
