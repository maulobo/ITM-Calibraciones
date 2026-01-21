
import { UserEntity } from '../schemas/user.schema';

export interface IUser extends UserEntity {
  createdAt: Date;
  updatedAt: Date;
}
