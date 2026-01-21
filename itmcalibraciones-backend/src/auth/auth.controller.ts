import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { User } from './decorators/user.decorator';
import { LoginResponse } from './dto/login-response.dto';

import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Request() req,
  ): Promise<LoginResponse> {
    return await this.authService.login(req.user);
  }

  @Auth()
  @Post('refresh')
  async refresh(@User() jwtPayload: JwtPayload): Promise<LoginResponse> {
    const user = await this.usersService.findOne(jwtPayload.email);
    return this.authService.login(user);
  }

}
