import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, Types.ObjectId> {
  transform(value: string, metadata: ArgumentMetadata): Types.ObjectId {
    try {
      const validObjectId = Types.ObjectId.isValid(value);
      if (!validObjectId) {
        throw new Error('Invalid ObjectId');
      }
      return new Types.ObjectId(value);
    } catch (e) {
      throw new Error('Validation failed');
    }
  }
}