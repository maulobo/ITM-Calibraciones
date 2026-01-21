import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/interfaces/user.interface';
import { UsersService } from 'src/users/users.service';
import { LoginResponse } from '../dto/login-response.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export class LoginCommand implements ICommand {
  constructor(public readonly user: IUser) {}
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
  ) { }

  async execute(command: any): Promise<LoginResponse> {
    const { user } = command;
    let payload: JwtPayload

    if(user._doc){
      payload = {
        name: user._doc.name,
        email: user._doc.email,
        lastName: user._doc.lastName,
        phoneNumber: user._doc.phoneNumber,
        id: user._doc._id,
        roles: user._doc.roles,
        office: user._doc.office
      };
    }else{
      payload = {
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        id: user._id,
        roles: user.roles,
        phoneNumber: user.phoneNumber,
        office: user.office
      };

    }
      
    const access_token = this.jwtService.sign(payload);
    this.userService.updateUserLastLogin( user._id ?? user._doc._id)

    return {
      access_token: access_token,
      payload
    };
  }
}
