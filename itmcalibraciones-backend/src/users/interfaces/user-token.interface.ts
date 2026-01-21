import { UserTokenEntity } from '../schemas/user-token.schema';

export interface IUserToken extends UserTokenEntity {
  createdAt: Date;
  updatedAt: Date;
}

