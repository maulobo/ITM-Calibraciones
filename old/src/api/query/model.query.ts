import { useMutation, useQuery } from "react-query";
import { AddModel, GetModels } from "../models.api";
import { IAddModel } from "../types/models.type";

export const GetModelsQuery = ({ brand, ...options }: { brand?: string, options?: any } = {}) =>
    useQuery(["GetModels",{brand}], () => GetModels({brand}), {
    onSuccess(data) {
        return data
    },
    ...options
});

export const AddModelQuery = () => useMutation({
    mutationFn: async (addModel: IAddModel) => {
        return await AddModel(addModel)
    }
})