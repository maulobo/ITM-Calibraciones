import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueryBuilder, QueryOptions } from 'src/common/utils/queryClass';
import { GetInstrumentsDTO } from '../dto/get-instruments.dto';
import { IEquipment } from '../interfaces/equipment.interface';

export class FindAllEquipmentsQuery implements IQuery {
  constructor(
    public params: GetInstrumentsDTO,
    public options: QueryOptions<IEquipment> = {}
    ) {}
}

@QueryHandler(FindAllEquipmentsQuery)
export class FindAllEquipmentsQueryHandler implements IQueryHandler<FindAllEquipmentsQuery> {
  constructor(@InjectModel('Equipment') private readonly equipmentModel: Model<IEquipment>) {}

  public async execute(query: FindAllEquipmentsQuery) {
    const { params, options } = query;
    const { populate, select, orWhere, ...find } = params;
    const partialEquipment: Partial<IEquipment> = find

    const queryBuilder = new QueryBuilder<IEquipment>(this.equipmentModel, options)
      .find(partialEquipment)
      .select(params.select)
      .populate(params.populate);

      if (orWhere) {
        orWhere.forEach(condition => {
          queryBuilder.orWhere(condition.field as keyof IEquipment, condition.values);
        });
      }

    return queryBuilder.exec();
  }
}
