
import { authApi } from '.';
import { IBrand } from './types/brands.type';
import { IAddModel, IModel } from './types/models.type';

export enum MODELS_API{
    GET_MODELS = "/models/",
    ADD_MODELS = "/models/",
}

export const GetModels = async ({brand}:{brand?:string}) => {
    const params = brand ? { brand } : undefined;
    const response = await authApi.get<IBrand[]>(MODELS_API.GET_MODELS, {
        params,
    });
    return response.data;
};


export const AddModel = async (addModel:IAddModel) => {
    const response = await authApi.post<IModel>(MODELS_API.ADD_MODELS,
        addModel,
    );
    return response.data;
};