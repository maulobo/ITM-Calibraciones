import { Types } from 'mongoose';
import { UserRoles } from 'src/common/enums/role.enum';


export class JwtPayload {
  name: string;
  lastName: string;
  email: string;
  id: Types.ObjectId;
  roles: UserRoles[];
  phoneNumber: string
  office: string
}

export const jwtPayload: JwtPayload = {
  id: new Types.ObjectId(),
  name: 'Name',
  lastName: 'LastName',
  email: 'Email',
  roles: [UserRoles.USER],
  phoneNumber: "string",
  office: "string"
};
