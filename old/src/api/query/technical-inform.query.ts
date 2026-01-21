import { useMutation, useQuery } from "react-query"
import { AddTechnicalInform, GetTechnicalInform } from "../technical-inform"
import { ITechnicalInform } from "../types/technical-inform.types"

export const AddTechnicalInformQuery = () => useMutation({
    mutationFn: async (technicalInform: ITechnicalInform) => {
        return await AddTechnicalInform(technicalInform)
    }
})

export const GetTechnicalInformQuery = ({ params, ...options }: { params?: Object,[key: string]: any } = {}) =>
    useQuery(["GetTechnicalInform",{params}], () => GetTechnicalInform({params}), {
    onSuccess(data) {
        return data
    },
    ...options
});