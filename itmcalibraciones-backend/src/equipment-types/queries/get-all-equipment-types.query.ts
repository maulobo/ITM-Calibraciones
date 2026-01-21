import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IEquipmentTypes } from '../interfaces/equipment-types.interface';

export class FindAllEquipmentTypesQuery implements IQuery {
  constructor() {}
}

@QueryHandler(FindAllEquipmentTypesQuery)
export class FindAllEquipmentTypesQueryHandler implements IQueryHandler<FindAllEquipmentTypesQuery> {
  constructor(@InjectModel('EquipmentTypes') private readonly equipmentTypesModel: Model<IEquipmentTypes>) {}

  public async execute(query: FindAllEquipmentTypesQuery) {
    return this.equipmentTypesModel.find().exec();
  }
}
