
import { authApi } from '.';
import { IAddCity, IAddState, ICity, IState } from './types/city.types';

export enum CITY_API{
    GET_CITY = "/city",
    ADD_CITY = "/city",
    ADD_STATE = "/city/state",
    GET_STATES = "/city/all-states",
}

export const GetCities = async ({state}:{state?:string}) => {
    const url = `${CITY_API.GET_CITY}/state/${state}`
    const response = await authApi.get<ICity[]>(url);
    return response.data;
};


export const GetAllStates = async () => {
    const response = await authApi.get<IState[]>(CITY_API.GET_STATES);
    return response.data;
};

export const AddCity = async (addCity:IAddCity) => {
    const response = await authApi.post<ICity>(CITY_API.ADD_CITY,
        addCity,
    );
    return response.data;
};

export const AddState = async (addState:IAddState) => {
    const response = await authApi.post<IState>(CITY_API.ADD_STATE,
        addState,
    );
    return response.data;
};
