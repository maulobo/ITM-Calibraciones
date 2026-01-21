import { ICommand } from '@nestjs/cqrs';
import { CreateUserDTO } from 'src/users/dto/create-user.dto';

export class CreateUserCommand implements ICommand {
  constructor(public readonly userDto: CreateUserDTO) {}
}
