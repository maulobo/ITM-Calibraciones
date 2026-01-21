import { useMutation, useQuery } from "react-query";
import { AddCity, AddState, GetAllStates, GetCities } from "../city.api";
import { IAddCity, IAddState } from "../types/city.types";

export const GetCitiesQuery = ({ state, ...options }: { state?:string, [key: string]: any } = {}) =>
    useQuery(["GetCities",{state}], () => GetCities({state}), {
    onSuccess(data) {
        return data
    },
    ...options
});

export const GetAllStatesQuery = ({ ...options }: { options?: any } = {}) =>
    useQuery(["GetAllStates"], () => GetAllStates(), {
    onSuccess(data) {
        return data
    },
    ...options
});

export const AddCityQuery = () => useMutation({
    mutationFn: async (addCity: IAddCity) => {
        return await AddCity(addCity)
    }
})

export const AddStateQuery = () => useMutation({
    mutationFn: async (dddState: IAddState) => {
        return await AddState(dddState)
    }
})