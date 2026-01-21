import { Types } from "mongoose";
import { JwtPayload } from "src/auth/interfaces/jwt-payload.interface";
import { UserRoles } from "../enums/role.enum";
const { ObjectId } = require('mongodb');

export function monthNumberBetweenTwoDates(from:Date, to:Date): Number {
    var months;
    months = (from.getFullYear() - to.getFullYear()) * 12;
    months -= from.getMonth();
    months += to.getMonth();
    return months <= 0 ? 0 : months;
}

export const checkMongoId = (id:string | Types.ObjectId): Types.ObjectId => {
    if(typeof id === "object") return id
    if(typeof id === "string") return convertMongoId(id)
    return id
}


export const convertToObjectId = (obj: any): any => {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'string' && Types.ObjectId.isValid(obj[key])) {
          try {
            obj[key] = convertMongoId(obj[key]);
          } catch (e) {
            console.log("Catch invalid ObjectID converter");
          }

          if (key === "id") obj["_id"] = obj[key];
        } else if (typeof obj[key] === 'object') {
          obj[key] = convertToObjectId(obj[key]); // Llamada recursiva para objetos anidados
        }
      }
    }
  }

  return obj;
};

export const convertMongoId = (id): Types.ObjectId => {
    return new Types.ObjectId(id)
}

export const isAdminOrTechnical = (user: JwtPayload) => {
    const isAdmin = (user as { roles: UserRoles[] }).roles.includes(UserRoles.ADMIN)
    const isTechnical =  (user as { roles: UserRoles[] }).roles.includes(UserRoles.TECHNICAL)
    return { isTechnical, isAdmin}
}

export const dateToEsString = (date:Date) => {
  const month = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const d = date.getDate();
  const m = month[date.getMonth()];
  const a = date.getFullYear();

  return d + ' de ' + m + ' de ' + a;
}