import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { ResetPasswordSender } from 'src/email/senders/reset-password';
import { UserUpdatedPasswordSender } from 'src/email/senders/user-updated-password';
import { EmailWelcomeSender } from 'src/email/senders/wellcome.sender';
import { AddUserHistoryLoginCommand } from './commands/add-user-login-history.command';
import { CreateUserTokenCommand } from './commands/handlers/create-user-token.handle';
import { RefreshUserPasswordCommand } from './commands/handlers/refresh-user-password.handler';
import { UpdateUserLastLoginCommand } from './commands/handlers/update-user-last-login.handler';
import { UpdateUserProfileCommand } from './commands/handlers/update-user-profile.handlel';
import { UpdateUserTokenCommand } from './commands/handlers/update-user-token.handle';
import { UpdateUserVerifyStatusCommand } from './commands/handlers/update-user-verify.handler';
import { UpdateUserCommand } from './commands/handlers/update-user.handler';
import { CreateUserCommand } from './commands/impl/create-user.command';
import { CreateUserDTO } from './dto/create-user.dto';
import { FindUserDTO } from './dto/find-user.dto';
import { UpdateUserProfileDTO } from './dto/update-user-profile.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UserTokenSource } from './enum/token-source.enum';
import { IUserLoginHistory } from './interfaces/user-login-history.interface';
import { IUserToken } from './interfaces/user-token.interface';
import { IUser } from './interfaces/user.interface';
import { FindAdminTechUserQuery } from './queries/find-admin-tech-user.query';
import { FindUserByEmailQuery } from './queries/find-email.query';
import { FindOneUserQuery } from './queries/find-one.query';
import { GetTokenWithUserQuery } from './queries/get-token-with-user.query';
import { FindUserQuery } from './queries/get-user.query';
import { GetUsersLoginHistoryQuery } from './queries/get-users-login-history.query';


@Injectable()
export class UsersService {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly emailWelcomeSender: EmailWelcomeSender,
        private readonly emailResetPasswordSender: ResetPasswordSender,
        private readonly emailUserUpdatedPasswordSender: UserUpdatedPasswordSender,
        
    ) {}

    async addUser(createUserDto: CreateUserDTO) { 
        const newUser =  await this.commandBus.execute(new CreateUserCommand(createUserDto));
        const name = newUser.name.charAt(0).toUpperCase() + newUser.name.slice(1)
        const lastName = newUser.lastName.charAt(0).toUpperCase() + newUser.lastName.slice(1)
        try{
            console.log(`Wellcome email to ${newUser.email}`)
            
            this.emailWelcomeSender.sendEmail({
                to: newUser.email,
                bcc: ['danilo@itmcalibraciones.com',"javier.ceqiq@gmail.com", "contacto@javierlujan.com.ar"],
                subject: "Bienvenido a la plataforma de ITM Calibraciones",
                locals: {
                    url: `${process.env.FRONT_URL}`,
                    name,
                    lastName,
                    password: createUserDto.password
                },
            });

            // this.emailWelcomeSender.sendEmail({
            //     to: "danilo@itmcalibraciones.com",
            //     bcc: ["javier.ceqiq@gmail.com", "contacto@javierlujan.com.ar"],
            //     subject: "Nuevo usuario creado",
            //     locals: {
            //         url: `${process.env.FRONT_URL}`,
            //         name,
            //         lastName,
            //         password: createUserDto.password
            //     },
            // });

        }catch(e){
            console.log(`Error sending Wellcome email to ${newUser.email}`)
            console.log(e)
        }
        return newUser
    }
    
    async findOne(email: string) { 
        return this.queryBus.execute(new FindUserByEmailQuery(email));
    }

    async findUser(findUser: FindUserDTO): Promise<IUser[]> { 
        return this.queryBus.execute(new FindUserQuery(findUser));
    }

    async findAdminTechUser(): Promise<IUser[]> { 
        return this.queryBus.execute(new FindAdminTechUserQuery());
    }

    async findOneByID(id:Types.ObjectId): Promise<IUser> { 
        return this.queryBus.execute(new FindOneUserQuery(id));
    }


    async getUserLoginHistory(userId:Types.ObjectId): Promise<IUserLoginHistory[]> { 
        return await this.queryBus.execute(new GetUsersLoginHistoryQuery(userId));
    }

    async updateUserLastLogin(userId:Types.ObjectId): Promise<IUser> { 
        this.commandBus.execute(new AddUserHistoryLoginCommand(userId));
        return await this.commandBus.execute(new UpdateUserLastLoginCommand(userId));
    }

    async updateUserProfile({user, updateProfile}:{user:JwtPayload, updateProfile: UpdateUserProfileDTO}): Promise<IUser> { 
        const userUpdated = await this.commandBus.execute(
            new UpdateUserProfileCommand( new Types.ObjectId(user.id), 
            updateProfile));
        return userUpdated
    }

    async notifyUpdateUser({updatedUser, notifyPassword, plainPassword}:{updatedUser: IUser, notifyPassword?: boolean, plainPassword?:string}): Promise<void> { 
        if(notifyPassword && plainPassword){
            try{
                console.log(`New password to ${updatedUser.email}`)
                this.emailResetPasswordSender.sendEmail({
                    to: updatedUser.email,
                    subject: "Nueva contraseña para ITM Calibraciones",
                    locals: {
                        url: `${process.env.FRONT_URL}`,
                        name: updatedUser.name,
                        newPassword: plainPassword
                    },
                });
                }catch(e){
                    console.log(`Error sending new password email to ${updatedUser.email}`)
                    console.log(e)
                }
        }

        if(notifyPassword && !plainPassword){
            try{
                console.log(`New alert to ${updatedUser.email} updated password`)
                this.emailUserUpdatedPasswordSender.sendEmail({
                    to: updatedUser.email,
                    subject: "Actualizaste tu contraseña de ITM Calibraciones",
                    locals: {
                        url: `${process.env.FRONT_URL}`,
                        name: updatedUser.name,
                        newPassword: plainPassword
                    },
                });
                }catch(e){
                    console.log(`Error sending alert change user password email to ${updatedUser.email}`)
                    console.log(e)
                }

        }
        
    }

    async updateUser({updateUser}:{updateUser: UpdateUserDTO}): Promise<IUser> { 
        
        if(updateUser.password === ""){
            delete updateUser.password;
        }

        if(updateUser.password){
            updateUser.password = await bcrypt.hash(updateUser.password, 10);
        }
        
        const updatedUser:IUser =  await this.commandBus.execute(
            new UpdateUserCommand( updateUser ));
        
        return updatedUser
    }   
    
    async generateNewUserPassword(
        email: string,
      ): Promise<string> {
        const newPassword =  await this.commandBus.execute(new RefreshUserPasswordCommand(email));
        return newPassword
    }

    async createUserToken({
        userId, source
    }:
        {userId: Types.ObjectId,
        source: UserTokenSource}
      ): Promise<IUserToken> {
        return await this.commandBus.execute(new CreateUserTokenCommand(userId, source));
    }

    async getTokenWithUser({token}:{token: string}
      ): Promise<IUserToken> {
        return await this.queryBus.execute(new GetTokenWithUserQuery(token));
    }

    async updateTokenStatus({tokenId, status}:{tokenId: Types.ObjectId, status:boolean}
        ): Promise<IUserToken> {
            return await this.commandBus.execute(new UpdateUserTokenCommand(tokenId, status));
      }

    async updateUserVerifyEmail({email}:{email: string}
    ): Promise<IUserToken> {
        return await this.commandBus.execute(new UpdateUserVerifyStatusCommand(email));
    }
    
}
