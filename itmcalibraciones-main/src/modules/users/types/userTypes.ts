
import { UserRoles } from "../../auth/types/authTypes";

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  roles: UserRoles[];
  office?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserPasswordDTO {
  password: string;
}

export interface CreateOrUpdateUserDTO {
  name?: string;
  lastName?: string;
  email?: string;
  roles?: UserRoles[];
  password?: string;
}

// Shape returned by GET /users/me (with office.client populated)
export interface MyProfile {
  id?: string;
  _id?: string;
  name: string;
  lastName: string;
  email: string;
  roles: string[];
  phoneNumber?: string;
  // The user's own client reference (may be a string ID or populated object)
  client?: string | { _id: string; socialReason: string; cuit?: string };
  // Office may be populated with nested client
  office?: string | {
    _id: string;
    name: string;
    client?: { _id: string; socialReason: string; cuit?: string };
    cityData?: { _id: string; name: string };
    cityName?: string;
  };
}
