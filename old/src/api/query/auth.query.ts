import { useMutation, useQuery } from "react-query";
import { AddUser, GetAdminTechUsersAPI, GetUsers, LoginUserAPI, RecoverUserPasswordAPI, UpdateUser } from "../auth.api";
import { ILoginReq, IRecoverUserPassword } from "../types/auth.types";
import { IAddUser } from "../types/user.types";


export const LoginUserQuery = () => useMutation({
    mutationFn: async (userLogin: ILoginReq) => {
        return await LoginUserAPI(userLogin)
    }
})

export const RecoverUserPasswordQuery = () => useMutation({
    mutationFn: async (recoverUserPassword: IRecoverUserPassword) => {
        return await RecoverUserPasswordAPI(recoverUserPassword)
    }
})

export const AddUserQuery = () => useMutation({
    mutationFn: async (addUser: IAddUser) => {
        if(addUser.id) return await UpdateUser(addUser)
        return await AddUser(addUser)
    }
})


export const GetUsersQuery = ({ params, ...options }: { params?: Object, options?: any } = {}) =>
    useQuery(["GetUsers",{params}], () => GetUsers({params}), {
    onSuccess(data) {
        return data
    },
    ...options
});

export const GetAdminTechUsersQuery = () =>
    useQuery(["GetAdminTechUsersQuery"], () => GetAdminTechUsersAPI(), {
    onSuccess(data) {
        return data
    }
});

