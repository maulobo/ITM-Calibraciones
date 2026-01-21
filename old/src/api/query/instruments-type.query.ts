import { useMutation, useQuery } from "react-query";
import { AddInstrumentType, GetInstrumentsTypes } from "../instruments-types.api";
import { IAddInstrumentType } from "../types/intruments-type.type";

export const GetInstrumentsTypeQuery = ({ ...options }: { options?: any } = {}) =>
    useQuery(["GetInstrumentsTypes"], () => GetInstrumentsTypes(), {
    onSuccess(data) {
        return data
    },
    ...options
});

export const AddInstrumentTypeQuery = () => useMutation({
    mutationFn: async (addType: IAddInstrumentType) => {
        return await AddInstrumentType(addType)
    }
})