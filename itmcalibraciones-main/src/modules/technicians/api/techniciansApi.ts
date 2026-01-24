import api from "../../../api/axios";
import type {
  Technician,
  CreateOrUpdateTechnicianDTO,
} from "../types/technicianTypes";
import { UserRoles } from "../../auth/types/authTypes";

export const techniciansApi = {
  getAll: async (): Promise<Technician[]> => {
    // Obtener todos los usuarios y filtrar por rol TECHNICAL
    const response = await api.get<Technician[]>("/users");
    const technicians = response.data.filter((user) =>
      user.roles.includes(UserRoles.TECHNICAL),
    );
    return technicians;
  },

  getById: async (id: string): Promise<Technician> => {
    const response = await api.get<Technician>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateOrUpdateTechnicianDTO): Promise<Technician> => {
    // Agregar el rol TECHNICAL al crear
    const payload = {
      ...data,
      roles: [UserRoles.TECHNICAL],
    };
    const response = await api.post<Technician>("/users/singup", payload);
    return response.data;
  },

  update: async (
    id: string,
    data: CreateOrUpdateTechnicianDTO,
  ): Promise<Technician> => {
    const response = await api.put<Technician>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
