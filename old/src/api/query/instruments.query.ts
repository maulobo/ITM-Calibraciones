import { useMutation, useQuery } from "react-query"
import { AddInstrument, GetInstruments, UpdateInstrument, UpdateInstrumentReceivedStatus } from "../instruments.api"
import { IAddInstrument, IUpdateInstrument, IUpdateInstrumentReceived } from "../types/instrument.type"

export const AddInstrumentQuery = () => useMutation({
    mutationFn: async (addInstrument: IAddInstrument) => {
        return await AddInstrument(addInstrument)
    }
})

export const UpdateInstrumentQuery = () => useMutation({
    mutationFn: async (updateInstrument: IUpdateInstrument) => {
        return await UpdateInstrument(updateInstrument)
    }
})

export const UpdateInstrumentReceivedStatusQuery = () => useMutation({
    mutationFn: async (updateInstrumentReceived: IUpdateInstrumentReceived) => {
        return await UpdateInstrumentReceivedStatus(updateInstrumentReceived)
    }
})


export const GetInstrumentQuery = ({ params, ...options }: { params?: Object, [key: string]: any } = {}) =>
    useQuery(["GetInstruments",{ params }], () => GetInstruments({params}), {
    onSuccess(data) {
        return data
    },
    ...options
});