
import { api, authApi } from '.';
import { ILoginReq, ILoginResponse, IRecoverUserPassword } from './types/auth.types';
import { IAddUser, IUser } from './types/user.types';

export enum AUTH_API{
    LOGIN = "/auth/login",
    RECOVER_PASSWORD = "/auth/request-user-password",
    REGISTER = "/users/singup",
    USERS = "/users",
    ADMINS_TECH = "/users/admins"
}

export const LoginUserAPI = async (userLogin: ILoginReq) => {
  const response = await api.post<ILoginResponse>(AUTH_API.LOGIN, userLogin);
  return response.data;
};

export const RecoverUserPasswordAPI = async (recoverUserPassword: IRecoverUserPassword) => {
  const response = await api.post<boolean>(AUTH_API.RECOVER_PASSWORD, recoverUserPassword);
  return response.data;
};

export const AddUser = async (newUser:IAddUser) => {
  const response = await authApi.post<IUser>(AUTH_API.REGISTER,
    newUser,
  );
  return response.data;
};

export const UpdateUser = async (newUser:IAddUser) => {
  const response = await authApi.patch<IUser>(AUTH_API.USERS,
    newUser,
  );
  return response.data;
};

export const GetUsers = async ({params}:{params?:object}) => {
  const response = await authApi.get<IUser[]>(AUTH_API.USERS, {
      params,
  });
  return response.data;
};

export const GetAdminTechUsersAPI = async () => {
  const response = await authApi.get<IUser[]>(AUTH_API.ADMINS_TECH);
  return response.data;
};