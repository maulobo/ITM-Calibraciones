
import { authApi } from '.';
import { IAddInstrumentType, IINstrumentType } from './types/intruments-type.type';

export enum INSTRUMENTS_TYPES_API{
    GET_TYPES = "/equipment-types/",
    ADD_TYPE = "/equipment-types/",
}

export const GetInstrumentsTypes = async () => {
    const response = await authApi.get<IINstrumentType[]>(INSTRUMENTS_TYPES_API.GET_TYPES);
    return response.data;
};


export const AddInstrumentType = async (addInstrumentType:IAddInstrumentType) => {
    const response = await authApi.post<IINstrumentType>(INSTRUMENTS_TYPES_API.ADD_TYPE,
        addInstrumentType,
    );
    return response.data;
};