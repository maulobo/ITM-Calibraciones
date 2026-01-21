import { useMutation, useQuery } from "react-query";
import { AddBrand, GetBrands } from "../brand.api";
import { IAddBrand } from "../types/brands.type";

export const GetBrandsQuery = ({ ...options }: { options?: any } = {}) =>
    useQuery(["GetBrandsQuery"], () => GetBrands(), {
    onSuccess(data) {
        return data
    },
    ...options
});

export const AddBrandQuery = () => useMutation({
    mutationFn: async (addBrand: IAddBrand) => {
        return await AddBrand(addBrand)
    }
})