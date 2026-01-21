
import { authApi } from '.';
import { IAddInstrument, IInstrument, IUpdateInstrument, IUpdateInstrumentReceived } from './types/instrument.type';

export enum INSTRUMETNS_API{
    ADD_INSTRUMENT = "/instruments/",
    GET_INSTRUMENTS = "/instruments/",
    UPDATE_INSTRUMENTS_RECEIVED = "/instruments/received"
}

export const AddInstrument = async (addInstrument:IAddInstrument) => {
    const response = await authApi.post<IInstrument>(INSTRUMETNS_API.ADD_INSTRUMENT,
        addInstrument,
    );
    return response.data;
};

export const UpdateInstrument = async (updateInstrument:IUpdateInstrument) => {
    const response = await authApi.patch<IInstrument>(INSTRUMETNS_API.ADD_INSTRUMENT,
        updateInstrument,
    );
    return response.data;
};

export const UpdateInstrumentReceivedStatus = async (updateInstrumentReceived:IUpdateInstrumentReceived) => {
    const response = await authApi.patch<IInstrument>(INSTRUMETNS_API.UPDATE_INSTRUMENTS_RECEIVED,
        updateInstrumentReceived,
    );
    return response.data;
};

export const GetInstruments = async ({params}:{params?:any}) => {
    const response = await authApi.get<IInstrument[]>(INSTRUMETNS_API.GET_INSTRUMENTS, {
        params
    });
    return response.data;
};