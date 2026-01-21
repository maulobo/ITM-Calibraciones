import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IEquipmentCards } from '../interfaces/equipment-card.interface';

export class FindAllEquipmentCardsQuery implements IQuery {
  constructor() {}
}

@QueryHandler(FindAllEquipmentCardsQuery)
export class FindAllEquipmentCardsQueryHandler implements IQueryHandler<FindAllEquipmentCardsQuery> {
  constructor(@InjectModel('EquipmentCards') private readonly equipmentCardsModel: Model<IEquipmentCards>) {}

  public async execute(query: FindAllEquipmentCardsQuery) {
    return this.equipmentCardsModel.find().exec();
  }
}
