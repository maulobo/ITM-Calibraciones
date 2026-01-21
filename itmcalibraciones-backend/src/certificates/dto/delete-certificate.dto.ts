import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { QueryDTO } from 'src/common/dto/query.dto';
import { IEquipment } from 'src/equipment/interfaces/equipment.interface';

export class DeleteCertificateDTO extends IntersectionType(
    QueryDTO,
) {
    @ApiProperty()
    @IsMongoId()
    @IsNotEmpty()
    id: Types.ObjectId;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    deleted:boolean

    @ApiProperty()
    @IsOptional()
    equipment?:IEquipment | string

    @ApiProperty()
    @IsString()
    @IsOptional()
    certificate?:string
}
  
