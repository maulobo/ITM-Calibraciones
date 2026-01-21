
import { authApi } from '.';
import { IUpdateProfile, IUser } from './types/user.types';

export enum PROFILE_API{
    GET_PROFILE = "/users/me",
    UPDATE_PROFILE = "/users/me",
}


export const getUserProfile = async () => {
    const response = await authApi.get<IUser>(PROFILE_API.GET_PROFILE);
    return response.data;
};

export const UpdateUserProfile = async (updateProfile:IUpdateProfile) => {
    const response = await authApi.patch<IUser>(PROFILE_API.UPDATE_PROFILE,
        updateProfile,
    );
    return response.data;
};