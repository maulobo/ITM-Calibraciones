import {
  CommandBus,
  CommandHandler,
  ICommand,
  ICommandHandler,
  QueryBus,
} from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AddOrUpdateClientDTO } from "../dto/add-update-client.dto";
import { IClient } from "../interfaces/client.interface";
import { CreateUserCommand } from "../../users/commands/impl/create-user.command";
import { FindAllOfficesQuery } from "../../offices/queries/get-all-offices.query";
import { UserRoles } from "../../common/enums/role.enum";
import { CreateUserDTO } from "../../users/dto/create-user.dto";
import { FindAllStatesQuery } from "../../city/queries/get-all-states.query";
import { AddStateCommand } from "../../city/commands/add-state.command";
import { FindCitiesQuery } from "../../city/queries/find-cities.query";
import { AddCityCommand } from "../../city/commands/addCity.command";
import { AddOfficeCommand } from "../../offices/commands/add-or-update-office.command";
import { AddOfficeDTO } from "../../offices/dto/add-office.dto";

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

    // --- LOGIC TO RESOLVE CITY/STATE BY NAME ---
    if (
      (!addClientDTO.city || !addClientDTO.state) &&
      addClientDTO.cityName &&
      addClientDTO.stateName
    ) {
      // 1. Resolve State
      let stateId: any;
      const states = await this.queryBus.execute(new FindAllStatesQuery());
      const existingState = states.find(
        (s) =>
          s.nombre.toLowerCase() ===
          addClientDTO.stateName.trim().toLowerCase(),
      );

      if (existingState) {
        stateId = existingState._id;
      } else {
        const newState = await this.commandBus.execute(
          new AddStateCommand({ nombre: addClientDTO.stateName }),
        );
        stateId = newState._id;
      }
      addClientDTO.state = new Types.ObjectId(stateId);

      // 2. Resolve City
      let cityId: any;
      // Note: Filter locally if FindCitiesQuery doesn't support strict name filtering effectively across all cities
      // But let's try to use standard params
      const cities = await this.queryBus.execute(
        new FindCitiesQuery({
          state: stateId,
        }),
      );

      // Filter by name case-insensitive
      const existingCity = cities.find(
        (c) =>
          c.name.toLowerCase() === addClientDTO.cityName.trim().toLowerCase(),
      );

      if (existingCity) {
        cityId = existingCity._id;
      } else {
        const newCity = await this.commandBus.execute(
          new AddCityCommand({
            name: addClientDTO.cityName,
            state: stateId,
          }),
        );
        cityId = newCity._id;
      }
      addClientDTO.city = new Types.ObjectId(cityId);
    }
    // -------------------------------------------

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

      // 1. Create default "Casa Central" office automatically
      let defaultOffice = null;
      try {
        const officeDto: AddOfficeDTO = {
          client: newClient._id.toString(),
          name: "Casa Central",
          city: newClient.city ? newClient.city.toString() : undefined,
          adress: addClientDTO.adress,
          phoneNumber: addClientDTO.phoneNumber,
          responsable: addClientDTO.responsable,
        };

        console.log(`Creating default office "Casa Central" for client: ${newClient.socialReason}`);
        const createdOffice = await this.commandBus.execute(new AddOfficeCommand(officeDto));
        defaultOffice = createdOffice._id;
      } catch (officeError) {
        console.error("Error creating default office for client:", officeError.message);
      }

      // 2. Automate User Creation ONLY if email is present AND office was created
      if (newClient.email && defaultOffice) {
        try {
          // Prepare User DTO
          // Password = CUIT (numbers only) without suffix
          const password = newClient.cuit.replace(/[^0-9]/g, "");

          const userDto: CreateUserDTO = {
            name: newClient.socialReason,
            lastName: "(Cliente)",
            email: newClient.email,
            password: password,
            roles: [UserRoles.USER],
            office: new Types.ObjectId(defaultOffice),
            phoneNumber: newClient.phoneNumber || "",
            area: "",
          } as any;

          console.log(`Creating automatic user for client: ${newClient.email}`);
          console.log(`Password will be: ${password}`);
          const createdUser = await this.commandBus.execute(new CreateUserCommand(userDto));
          console.log(`✅ User created successfully: ${createdUser._id}`);
        } catch (authError) {
          console.error("❌ Error creating user for client:", authError);
          console.error("Full error:", JSON.stringify(authError, null, 2));
          // Don't fail the client creation if user creation fails
        }
      } else if (newClient.email && !defaultOffice) {
        console.warn("Cannot create user for client: Office creation failed.");
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
