import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { StatusEnum } from 'src/errors-handler/enums/status.enum';
import { throwException } from 'src/errors-handler/throw-exception';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throwException(StatusEnum.UNAUTHORIZED);
    }

    return user;
  }
}
