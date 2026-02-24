
import api from "../../../api/axios";
import type { User, CreateOrUpdateUserDTO, MyProfile } from "../types/userTypes";

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>("/users");
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  getMyProfile: async (): Promise<MyProfile> => {
    const response = await api.get<MyProfile>("/users/me");
    return response.data;
  },

  create: async (data: CreateOrUpdateUserDTO): Promise<User> => {
    const response = await api.post<User>("/users", data);
    return response.data;
  },

  update: async (id: string, data: CreateOrUpdateUserDTO): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  adminUpdateUser: async (data: { id: string; password?: string; office?: string } & Partial<User>): Promise<User> => {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    );
    const response = await api.patch<User>("/users", payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  updateMe: async (data: Partial<User> & { password?: string }): Promise<User> => {
    const response = await api.patch<User>("/users/me", data);
    return response.data;
  },
};
