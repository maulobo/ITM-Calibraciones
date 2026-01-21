import { useMutation, useQuery } from "react-query";
import { UpdateUserProfile, getUserProfile } from "../profile.api";
import { IUpdateProfile } from "../types/user.types";


export const GetUserProfileQuery = () =>
    useQuery(["GetInstruments"], () => getUserProfile(), {
    onSuccess(data) {
        return data
    },
});

export const UpdateUserProfileQuery = () => useMutation({
    mutationFn: async (updateProfile:IUpdateProfile) => {
        return await UpdateUserProfile(updateProfile)
    }
})