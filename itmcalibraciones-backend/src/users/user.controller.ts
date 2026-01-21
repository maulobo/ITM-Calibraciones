import {
  Body, Controller,
  Get,
  Param,
  Patch,
  Post,
  Query
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { Types } from 'mongoose';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { UserRoles } from 'src/common/enums/role.enum';
import { convertMongoId } from 'src/common/utils/common-functions';
import { StatusEnum } from 'src/errors-handler/enums/status.enum';
import { throwException } from 'src/errors-handler/throw-exception';
import { CreateUserDTO } from './dto/create-user.dto';
import { emailDTO } from './dto/email';
import { FindUserDTO } from './dto/find-user.dto';
import { IdDTO } from './dto/id.tos';
import { UserResponseDTO } from './dto/response/user.response.dto';
import { UpdateUserProfileDTO } from './dto/update-user-profile.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { IUserLoginHistory } from './interfaces/user-login-history.interface';
import { IUser } from './interfaces/user.interface';
import { UsersService } from './users.service';


@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private userService: UsersService,
  ) {}

  @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
  @Get('/')
  async getUsers(
    @Query() findUser: FindUserDTO
    ): Promise<IUser[]> {
    return await this.userService.findUser(findUser);
  }

  @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
  @Post('/singup')
  async addUser(
    @Body() createUserDto: CreateUserDTO,
  ): Promise<UserResponseDTO> {
    createUserDto.office = new Types.ObjectId(createUserDto.office)
    createUserDto.roles = [UserRoles.USER]
    const user = this.userService.addUser(createUserDto);
    return plainToClass(UserResponseDTO, user);
  }

  @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
  @Patch("/")
  async updateUser(
    @Body() updateUserDTO: UpdateUserDTO,
  ): Promise<IUser> {
    const plainPassword = updateUserDTO.password
    updateUserDTO.id = convertMongoId(updateUserDTO.id)
    updateUserDTO.office = convertMongoId(updateUserDTO.office)
    const updatedUser =  await this.userService.updateUser({updateUser: updateUserDTO});
    
    // Notify to the user a new Password was generated and I show it
    updateUserDTO.password && updateUserDTO.password.length > 0 && this.userService.notifyUpdateUser({
      updatedUser: updatedUser,
      notifyPassword: true,
      plainPassword: plainPassword
    })

    return updatedUser
  }


  @Auth()
  @Get('/me')
  async getMyProfile(
    @User() user: JwtPayload
  ): Promise<any> {
    const findUser: FindUserDTO = {
      _id: convertMongoId(user.id),
      populate:["office.client", "office.city"]
    }
    const users = await this.userService.findUser(findUser)
    if(users.length === 0) throwException(StatusEnum.USER_NOT_FOUND)
    return users[0]
  }

  @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
  @Get('/admins')
  async getAdminTechUsers(
    @User() user: JwtPayload
  ): Promise<any> {
    return await this.userService.findAdminTechUser()
  }

  @Auth()
  @Patch('/me')
  async updateMyProfile(
    @User() user: JwtPayload,
    @Body() updateUserProfileDTO: UpdateUserProfileDTO
  ): Promise<any> {
    const findUser: FindUserDTO = {
      _id: convertMongoId(user.id),
    }
    const users = await this.userService.findUser(findUser)
    if(users.length === 0) throwException(StatusEnum.USER_NOT_FOUND)
    const me = users[0]
    const updateUserDTO = {...updateUserProfileDTO, id: me._id, office: me.office}
    const updatedUser =  await this.userService.updateUser({updateUser: updateUserDTO});
    // Notify to the user, he/shw updated the password but I dont show it
    updateUserProfileDTO.password && updateUserProfileDTO.password.length > 0 && this.userService.notifyUpdateUser({
        updatedUser: updatedUser,
        notifyPassword: true
    })

    return updatedUser    
  }


  @Auth()
  @Patch('/profile')
  async updateUserProfile(
    @User() user: JwtPayload,
    @Body() updateProfile: UpdateUserProfileDTO
    ): Promise<IUser> {
    try{
      return await this.userService.updateUserProfile({user, updateProfile});
    }catch(e){
      return e
    }
    
  }

  @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
  @Get('/login-history/:id')
  async getLoginHisotry(@Param() params: IdDTO): Promise<IUserLoginHistory[]> {
    return await this.userService.getUserLoginHistory(params.id);
  }

  @Auth(UserRoles.ADMIN)
  @Get('/:id')
  async findOne(@Param() params: IdDTO): Promise<IUser> {
    const user = await this.userService.findOneByID(params.id);

    if (!user) {
      throwException(StatusEnum.USER_NOT_FOUND);
    }

    return user;
  }

  @Auth(UserRoles.ADMIN, UserRoles.TECHNICAL)
  @Get('/email/:email')
  async findByEmail(@Param() params: emailDTO): Promise<IUser> {
    const user = await this.userService.findOne(params.email as string);

    if (!user) {
      throwException(StatusEnum.USER_NOT_FOUND);
    }

    return user;
  }
  
}
