
import { authApi } from '.';
import { AddIClient, IClient } from './types/client.type';

export enum CLIENT_API{
    ALL = "/clients/all",
    CREATE_OR_UPDATE = "/clients/add-or-update"
}

export const AddClient = async (addClient:AddIClient) => {
  const response = await authApi.post<IClient>(CLIENT_API.CREATE_OR_UPDATE,
    addClient,
  );
  return response.data;
};


export const GetAllClients = async ({params}:{params?:any}) => {
  const response = await authApi.get<IClient[]>(CLIENT_API.ALL, {
      params
  });
    
  return response.data;
};
