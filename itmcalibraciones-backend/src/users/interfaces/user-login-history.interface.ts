import { UserLoginHistoryEntity } from '../schemas/user-login-history';

export interface IUserLoginHistory extends UserLoginHistoryEntity {
  createdAt: Date;
  updatedAt: Date;
}
