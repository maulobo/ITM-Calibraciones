import api from "../../../api/axios";

export interface User {
  id: string;
  _id?: string;
  name: string;
  lastName: string;
  email: string;
  roles: string[];
  client?: string;
  office?: string;
  phoneNumber?: string;
}

export interface CreateUserDTO {
  email: string;
  password?: string;
  name: string;
  lastName: string;
  roles: string[];
  client: string; // ID
  office?: string; // ID
  phoneNumber?: string;
  adress?: string;
  area?: string;
}

export const usersApi = {
  getUsers: async (params?: {
    search?: string;
    limit?: number;
    offset?: number;
    client?: string;
    office?: string;
  }): Promise<User[]> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.client) queryParams.append("client", params.client);
    if (params?.office) queryParams.append("office", params.office);

    if (!params?.limit) queryParams.append("limit", "100");

    const response = await api.get<User[]>(`/users?${queryParams.toString()}`);
    return response.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  getUsersByClient: async (
    clientId: string,
    officeId?: string,
  ): Promise<User[]> => {
    return usersApi.getUsers({ client: clientId, office: officeId });
  },

  createUser: async (data: CreateUserDTO): Promise<User> => {
    // Ensuring generic password if not provided
    const payload = {
      ...data,
      password: data.password || "123456",
    };
    const response = await api.post<User>("/users/singup", payload);
    return response.data;
  },
};
