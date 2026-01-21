import { useMutation, useQuery } from "react-query";
import { AddOffice, GetOfficesByClient } from "../office.api";
import { IAddOffice } from "../types/office.type";

export const GetOfficeByClientQuery = ({ client, ...options }: { client?: string, options?: any } = {}) =>
    useQuery(["getCrossesByIdQuery",{client}], () => GetOfficesByClient({client}), {
    onSuccess(data) {
        return data
    },
    ...options
});


export const AddOfficeQuery = () => useMutation({
    mutationFn: async (addOfice: IAddOffice) => {
        return await AddOffice(addOfice)
    }
})

