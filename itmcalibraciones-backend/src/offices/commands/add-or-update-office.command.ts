import {
  CommandHandler,
  ICommand,
  ICommandHandler,
  QueryBus,
} from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AddOfficeDTO } from "../dto/add-office.dto";
import { IOffice } from "../interfaces/office.interface";
import { FindAllStatesQuery } from "../../city/queries/get-all-states.query";
import { FindCitiesQuery } from "../../city/queries/find-cities.query";
import { AddStateCommand } from "../../city/commands/add-state.command";
import { AddCityCommand } from "../../city/commands/addCity.command";
import { CommandBus } from "@nestjs/cqrs";

export class AddOfficeCommand implements ICommand {
  constructor(public readonly addOfficeDTO: AddOfficeDTO) {}
}

@CommandHandler(AddOfficeCommand)
export class AddOfficeCommandHandler
  implements ICommandHandler<AddOfficeCommand>
{
  constructor(
    @InjectModel("Office") private readonly officeModel: Model<IOffice>,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: AddOfficeCommand): Promise<any> {
    const { addOfficeDTO } = command;

    // Resolve city/state by name if provided
    if (
      (!addOfficeDTO.city || !addOfficeDTO.state) &&
      addOfficeDTO.cityName &&
      addOfficeDTO.stateName
    ) {
      // 1. Resolve State
      let stateId: any;
      const states = await this.queryBus.execute(new FindAllStatesQuery());
      const existingState = states.find(
        (s) =>
          s.nombre.toLowerCase() ===
          addOfficeDTO.stateName.trim().toLowerCase(),
      );

      if (existingState) {
        stateId = existingState._id;
      } else {
        const newState = await this.commandBus.execute(
          new AddStateCommand({ nombre: addOfficeDTO.stateName }),
        );
        stateId = newState._id;
      }
      addOfficeDTO.state = stateId.toString();

      // 2. Resolve City
      let cityId: any;
      const cities = await this.queryBus.execute(
        new FindCitiesQuery({ state: stateId }),
      );

      const existingCity = cities.find(
        (c) =>
          c.name.toLowerCase() === addOfficeDTO.cityName.trim().toLowerCase(),
      );

      if (existingCity) {
        cityId = existingCity._id;
      } else {
        const newCity = await this.commandBus.execute(
          new AddCityCommand({ name: addOfficeDTO.cityName, state: stateId }),
        );
        cityId = newCity._id;
      }
      addOfficeDTO.city = cityId.toString();
    }

    if (addOfficeDTO.id)
      return await this.officeModel.findOneAndUpdate(
        { _id: addOfficeDTO.id },
        addOfficeDTO,
        { upsert: true, new: true },
      );

    return await new this.officeModel(addOfficeDTO).save();
  }
}
