import { IUser } from "./user.types"

export interface ILoginResponse {
    access_token: string,
    payload: IUser
}

export interface ILoginReq {
    email: string,
    password: string
    remember?: boolean
}

export interface IRecoverUserPassword {
    email: string,
}