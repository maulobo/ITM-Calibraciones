
import { authApi } from '.';
import { IAddOffice, IOffice } from './types/office.type';

export enum OFFICE_API{
    GET_OFFICES_BY_CLIENT = "/offices/all",
    ADD_OR_UPDATE_OFFICES = "/offices/add-or-update"
}

export const GetOfficesByClient = async ({client}:{client?:string}) => {
    const params = client ? { client } : undefined;

    const response = await authApi.get<IOffice[]>(OFFICE_API.GET_OFFICES_BY_CLIENT, {
        params,
    });

    return response.data;
};

export const AddOffice = async (addOfice:IAddOffice) => {
    const response = await authApi.post<IOffice>(OFFICE_API.ADD_OR_UPDATE_OFFICES,
        addOfice,
    );
    return response.data;
  };