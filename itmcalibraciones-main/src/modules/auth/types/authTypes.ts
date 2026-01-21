export enum UserRoles {
  USER = "USER",
  ADMIN = "ADMIN",
  TECHNICAL = "TECHNICAL",
}

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  roles: UserRoles[];
  office?: string;
}

// Lo que mando al login
export interface LoginRequest {
  email: string;
  password: string;
}

// Lo que recibo del backend (User + Token)
export interface LoginResponse {
  access_token: string;
  payload: User;
}
