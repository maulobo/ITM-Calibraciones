
import { authApi } from '.';
import { ITechnicalInform } from './types/technical-inform.types';

export enum TECHNICAL_INFORM_API{
    BASE_URL = "/technical-inform/"
}
export const GetTechnicalInform = async ({params}:{params?:object}) => {
    const response = await authApi.get<ITechnicalInform[]>(TECHNICAL_INFORM_API.BASE_URL, {
        params,
    });
    
    return response.data;
};

export const AddTechnicalInform = async (iTechnicalInform:ITechnicalInform) => {
    const response = await authApi.post<ITechnicalInform>(TECHNICAL_INFORM_API.BASE_URL,
        iTechnicalInform,
    );
    return response.data;
};

