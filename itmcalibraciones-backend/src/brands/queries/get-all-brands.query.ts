import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IBrand } from '../interfaces/brand.interface';

export class FindAllBrandsQuery implements IQuery {
  constructor() {}
}

@QueryHandler(FindAllBrandsQuery)
export class FindAllBrandsQueryHandler implements IQueryHandler<FindAllBrandsQuery> {
  constructor(@InjectModel('Brand') private readonly brandModel: Model<IBrand>) {}

  public async execute(query: FindAllBrandsQuery) {
    return this.brandModel.find().exec();
  }
}
