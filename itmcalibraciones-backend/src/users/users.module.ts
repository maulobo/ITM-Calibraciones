import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from 'src/email/email.module';
import { AddUserEventHandler } from './commands/add-user-event';
import { AddUserHistoryLoginHandler } from './commands/add-user-login-history.command';
import { CreateUserTokenHandler } from './commands/handlers/create-user-token.handle';
import { CreateUserHandler } from './commands/handlers/create-user.handler';
import { RefreshUserPasswordHandler } from './commands/handlers/refresh-user-password.handler';
import { UpdateUserLastLoginHandler } from './commands/handlers/update-user-last-login.handler';
import { UpdateUserProfileHandler } from './commands/handlers/update-user-profile.handlel';
import { UpdateUserTokenHandler } from './commands/handlers/update-user-token.handle';
import { UpdateUserVerifyStatusHandler } from './commands/handlers/update-user-verify.handler';
import { UpdateUserHandler } from './commands/handlers/update-user.handler';
import { FindAdminTechUserQueryHandler } from './queries/find-admin-tech-user.query';
import { FindUserByEmail } from './queries/find-email.query';
import { FindOneUserQuery, FindOneUserQueryHandler } from './queries/find-one.query';
import { GetTokenWithUserHandler } from './queries/get-token-with-user.query';
import { FindUserQueryHandler } from './queries/get-user.query';
import { GetUsersLoginHistoryHandler } from './queries/get-users-login-history.query';
import { UserLoginHistorySchema } from './schemas/user-login-history';
import { UserTokenSchema } from './schemas/user-token.schema';
import { UserSchema } from './schemas/user.schema';
import { UserController } from './user.controller';
import { UsersService } from './users.service';

const QueriesHandler = [
  FindOneUserQuery,
  FindUserByEmail,
  FindOneUserQueryHandler,
  GetTokenWithUserHandler,
  GetUsersLoginHistoryHandler,
  FindUserQueryHandler,
  FindAdminTechUserQueryHandler
];
const CommandHandlers = [
  CreateUserHandler,
  AddUserEventHandler,
  CreateUserTokenHandler,
  UpdateUserTokenHandler,
  RefreshUserPasswordHandler,
  UpdateUserVerifyStatusHandler,
  UpdateUserProfileHandler,
  UpdateUserLastLoginHandler,
  UpdateUserHandler,
  AddUserHistoryLoginHandler
]

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'UserToken', schema: UserTokenSchema },
      { name: 'UserLoginHistory', schema: UserLoginHistorySchema },
    ]),
    EmailModule,
  ],
  providers: [
    UsersService,
    ...QueriesHandler,
    ...CommandHandlers
  ],
  exports: [UsersService,],
  controllers: [UserController],
})
export class UsersModule {}
