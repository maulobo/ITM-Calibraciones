import { useQuery } from "react-query";
import { GetPDFBadget, GetPDFSticker, GetPDFTechnicalInform } from "../pdf-generator";

export const GetPDFTechnicalInformQuery = ({ id, ...options }: { id?: string, [key: string]: any}) =>
    useQuery(["GetPDDTechnicalInform", id], () => GetPDFTechnicalInform(id), {
        onSuccess(data) {
            return data?.data
        },
        ...options
    });
export const GetPDFStickerQuery = ({ id, ...options }: { id?: string, [key: string]: any}) =>
    useQuery(["GetPDFSticker", id], () => GetPDFSticker(id), {
        onSuccess(data) {
            return data?.data
        },
        ...options
    });

export const GetPDFBudgetQuery = ({ id, ...options }: { id?: string, [key: string]: any}) =>
    useQuery(["GetPDFBudget", id], () => GetPDFBadget(id), {
        onSuccess(data) {
            return data?.data
        },
        ...options
    });