
import { authApi } from '.';

export enum TECHNICAL_INFORM_API{
    TECHNCIA_INFOR = "/pdf-generator/technical-inform",
    STICKER = "/pdf-generator/sticker",
    BADGET = "/pdf-generator/badget"
}
export const GetPDFTechnicalInform = async (id?:string) => {
    if(!id) return 
    const url = `${TECHNICAL_INFORM_API.TECHNCIA_INFOR}/${id}`
    return await authApi({
        url,
        method: 'GET',
        responseType: 'blob',
      })
};

export const GetPDFSticker = async (id?:string) => {
    if(!id) return 
    const url = `${TECHNICAL_INFORM_API.STICKER}/${id}`
    return await authApi({
        url,
        method: 'GET',
        responseType: 'blob',
      })
};

export const GetPDFBadget = async (id?:string) => {
    if(!id) return 
    const url = `${TECHNICAL_INFORM_API.BADGET}/${id}`
    return await authApi({
        url,
        method: 'GET',
        responseType: 'blob',
      })
};

