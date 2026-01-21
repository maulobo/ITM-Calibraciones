import { useMutation, useQuery } from "react-query";
import { AddClient, GetAllClients } from "../client.api";
import { AddIClient } from "../types/client.type";

export const GetAllClientsQuery = ({ params, ...options }: { params?: Object, [key: string]: any } = {}) =>
    useQuery(["getAllGroupsByEventApi",{params}], () => GetAllClients({params}), {
        onSuccess(data) {
            return data
        },
        ...options
    });

export const AddClientQuery = () => useMutation({
    mutationFn: async (addClient: AddIClient) => {
        return await AddClient(addClient)
    }
})