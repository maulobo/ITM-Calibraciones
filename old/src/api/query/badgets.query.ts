import { useMutation, useQuery } from "react-query"
import { AddBadget, GetBadgets, UpdateBadget } from "../badgets.api"
import { IBadget } from "../types/badgets.type"


export const AddBadgetQuery = () => useMutation({
    mutationFn: async (addBadget: IBadget) => {
        if(addBadget.id) return await UpdateBadget(addBadget)
        return await AddBadget(addBadget)
    }
})

export const UpdateBadgetQuery = () => useMutation({
    mutationFn: async (addBadget: IBadget) => {
        return await UpdateBadget(addBadget)
    }
})


export const GetBadgetsQuery = ({ params, ...options }: { params?: Object, [key: string]: any } = {}) =>
    useQuery(["GetCertificates",{params}], () => GetBadgets({params}), {
    onSuccess(data) {
        return data
    },
    ...options
});