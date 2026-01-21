import {
  CommandBus,
  CommandHandler,
  ICommand,
  ICommandHandler,
  QueryBus,
} from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AddOrUpdateClientDTO } from "../dto/add-update-client.dto";
import { IClient } from "../interfaces/client.interface";
import { CreateUserCommand } from "../../users/commands/impl/create-user.command";
import { FindAllOfficesQuery } from "../../offices/queries/get-all-offices.query";
import { UserRoles } from "../../common/enums/role.enum";
import { CreateUserDTO } from "../../users/dto/create-user.dto";

export class AddClientCommand implements ICommand {
  constructor(public readonly addClientDTO: AddOrUpdateClientDTO) {}
}

@CommandHandler(AddClientCommand)
export class AddClientCommandHandler
  implements ICommandHandler<AddClientCommand>
{
  constructor(
    @InjectModel("Client") private readonly clientModel: Model<IClient>,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: AddClientCommand): Promise<any> {
    const { addClientDTO } = command;

    // UPDATE LOGIC
    if (addClientDTO.id)
      return await this.clientModel.findOneAndUpdate(
        { _id: addClientDTO.id },
        addClientDTO,
        { upsert: true, new: true },
      );

    // CREATE LOGIC
    try {
      const newClient = await new this.clientModel(addClientDTO).save();

      // Automate User Creation ONLY if email is present
      if (newClient.email) {
        try {
          // 1. Get Default Office
          const offices = await this.queryBus.execute(
            new FindAllOfficesQuery({}),
          );
          const defaultOffice = offices.length > 0 ? offices[0]._id : null;

          if (defaultOffice) {
            // 2. Prepare User DTO
            // Password = CUIT (numbers only) + 'itm'
            const rawCuit = newClient.cuit.replace(/[^0-9]/g, "");
            const password = `${rawCuit}itm`;

            const userDto: CreateUserDTO = {
              name: newClient.socialReason, // Use Company Name as User Name
              lastName: "(Cliente)",
              email: newClient.email,
              password: password,
              roles: [UserRoles.USER],
              office: defaultOffice.toString(),
              client: newClient._id.toString() as any, // Cast if DTO typing is strict on string
            } as any; // Cast generic to avoid strict validation issues here, create-user.handler validates db

            // 3. Dispatch Create User
            console.log(
              `Creating automatic user for client: ${newClient.email}`,
            );
            await this.commandBus.execute(new CreateUserCommand(userDto));
          } else {
            console.warn("Cannot create user for client: No Office found.");
          }
        } catch (authError) {
          console.error("Error creating user for client:", authError.message);
          // Don't fail the client creation if user creation fails
        }
      }

      return newClient;
    } catch (error) {
      if (error.code === 11000) {
        console.log("Error: Clave duplicada al agregar cliente:", error);
      } else {
        console.error("Error al importar cliente:", error);
        throw error;
      }
    }
  }
}
