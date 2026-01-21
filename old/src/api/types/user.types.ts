import { UserRolesEnum } from "@/const/userRoles.const";
import { IOffice } from "./office.type";

export interface IUser {
    id?:string,
    email: string;
    name: string;
    roles: UserRolesEnum[];
    lastName: string,
    phoneNumber: string,
    lastLogin?: string
    password?: string,
    office: string | IOffice,
    adress: string
    area?: string
  }

  export interface IAddUser {
    id?: string
    email: string;
    name: string;
    lastName: string,
    phoneNumber?: string,
    password?: string,
    office: string | IOffice,
    adress?: string
    area?: string
  }

  export interface IUpdateProfile {
    password?:string,
    phoneNumber?: string;
  }
