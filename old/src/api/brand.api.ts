
import { authApi } from '.';
import { IAddBrand, IBrand } from './types/brands.type';

export enum BRAND_API{
    GET_BRANDS = "/brands/",
    ADD_BRANDS = "/brands/",
}

export const GetBrands = async () => {
    const response = await authApi.get<IBrand[]>(BRAND_API.GET_BRANDS);
    return response.data;
};

export const AddBrand = async (addBrand:IAddBrand) => {
    const response = await authApi.post<IBrand>(BRAND_API.ADD_BRANDS,
        addBrand,
    );
    return response.data;
};