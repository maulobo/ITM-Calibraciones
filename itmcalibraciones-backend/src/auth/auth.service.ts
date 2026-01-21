import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { StatusEnum } from 'src/errors-handler/enums/status.enum';
import { throwException } from 'src/errors-handler/throw-exception';
import { IUser } from 'src/users/interfaces/user.interface';
import { UsersService } from 'src/users/users.service';
import { LoginCommand } from './commands/login.command';
import { LoginResponse } from './dto/login-response.dto';

    
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user === null) throwException(StatusEnum.LOGIN_USER_NOT_FOUND);
    //if( !user.emailConfirmed )  throwException(StatusEnum.USER_NOT_VERIFY);
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (user && passwordMatch) {
      const { password, ...result } = user;
      return result;
    }

    throwException(StatusEnum.LOGIN_USER_FAIL);
  }

  async login(user: IUser) {
    const token: LoginResponse = await this.commandBus.execute(
      new LoginCommand(user),
    );

    return token;
  }

}
