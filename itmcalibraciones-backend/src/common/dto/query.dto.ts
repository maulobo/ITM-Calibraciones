import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNumberString, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class MatchDTO {
    @ApiProperty()
    @IsString()
    field: string;

    @ApiProperty()
    @IsString()
    searchText: string

}

export class QueryDTO<T extends Record<string, any>> {
    @ApiProperty()
    @IsMongoId()
    @IsOptional()
    _id?: Types.ObjectId;

    @ApiProperty()
    @IsArray()
    @IsOptional()
    populate?: string[];
    
    @ApiProperty()
    @IsArray()
    @IsOptional()
    select?: string[]

    @ApiProperty()
    @IsOptional()
    find?: string[]

    @ApiProperty()
    @IsOptional()
    @IsNumberString()
    limit?: number

    @ApiProperty()
    @IsOptional()
    @IsNumberString()
    offset?: number

    @ApiProperty()
    @IsOptional()
    match?: MatchDTO;

    @ApiProperty()
    @IsOptional()
    orWhere?: { field: keyof T; values: any[] }[]

}


