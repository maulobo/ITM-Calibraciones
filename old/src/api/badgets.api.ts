
import { authApi } from '.';
import { IBadget } from './types/badgets.type';

export enum BADGET_API{
    ADD_BADGET = "/badgets/",
    GET_BADGETS = "/badgets/"
}

export const AddBadget = async (addBadget:IBadget) => {
    const response = await authApi.post<IBadget>(BADGET_API.ADD_BADGET,
        addBadget,
    );
    return response.data;
};

export const UpdateBadget = async (addBadget:IBadget) => {
    const response = await authApi.put<IBadget>(BADGET_API.ADD_BADGET,
        addBadget,
    );
    return response.data;
};

export const GetBadgets = async ({params, ...options}:{params?:object, [key: string]: any}) => {
    const response = await authApi.get<IBadget[]>(BADGET_API.GET_BADGETS, {
        params,
        ...options
    });
    return response.data;
};