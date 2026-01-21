import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDTO {
    @Expose()
    name
    @Expose()
    lastName
    @Expose()
    phoneNumber
    @Expose()
    loginAttemps
    @Expose()
    roles
    @Expose()
    lastLogin
    @Expose()
    office
    @Expose()
    createdAt
    @Expose()
    updatedAt
}


