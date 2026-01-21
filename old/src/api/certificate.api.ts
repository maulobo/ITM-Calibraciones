
import { authApi } from '.';
import { IAddCertificate, ICertificate } from './types/certificate.types';
const querystring = require("querystring");

export enum CERTIFICATE_API{
    ADD = "/certificate/",
    GET = "/certificate/",
    DELETE = "/certificate/delete"
}

export const AddCertificate = async ({ params, upload }: { params: IAddCertificate, upload: File }): Promise<ICertificate> => {
    
    const formData = new FormData();
    
    formData.append('file', upload);

    Object.entries(params).forEach(([key, value]) => {
        if(value && value !== "undefined" )formData.append(key, value);
      });
  
    const response = await authApi.post<ICertificate>(CERTIFICATE_API.ADD, formData);
    return response.data;
  };

export const UpdateCertificate = async (addCertificate:ICertificate) => {
    const response = await authApi.patch<ICertificate>(CERTIFICATE_API.ADD,
        addCertificate,
    );
    return response.data;
};


export const DeleteCertificate = async (deleteCertificate:ICertificate) => {
    const response = await authApi.post<ICertificate>(CERTIFICATE_API.DELETE,
        deleteCertificate,
    );
    return response.data;
};


export const GetCertificates = async ({params}:{params?:object}) => {
    const response = await authApi.get<ICertificate[]>(CERTIFICATE_API.GET, {
        params,
    });
    return response.data;
};