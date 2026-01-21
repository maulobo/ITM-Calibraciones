import { useMutation, useQuery } from "react-query"
import { AddCertificate, DeleteCertificate, GetCertificates, UpdateCertificate } from "../certificate.api"
import { IAddCertificate, ICertificate } from "../types/certificate.types"

export const AddCertificateQuery = () => useMutation({
    mutationFn: async ({params, upload}:{ params: IAddCertificate, upload: File }) => {
        return await AddCertificate({params, upload})
    }
})

export const UpdateCertificateQuery = () => useMutation({
    mutationFn: async (addCrtificate: ICertificate) => {
        return await UpdateCertificate(addCrtificate)
    }
})

export const DeleteCertificateQuery = () => useMutation({
    mutationFn: async (deleteCrtificate: ICertificate) => {
        return await DeleteCertificate(deleteCrtificate)
    }
})

export const GetCertificateQuery = ({ params, ...options }: { params?: Object, [key: string]: any } = {}) =>
    useQuery(["GetCertificates",{params}], () => GetCertificates({params}), {
    onSuccess(data) {
        return data
    },
    ...options
});