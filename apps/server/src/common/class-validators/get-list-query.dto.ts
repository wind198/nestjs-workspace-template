import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { IPagination } from '@app/server/common/types/pagination';
import type { IFilters } from '@app/server/common/types/filters';
import { ISort } from '@app/server/common/types/sort';
import { ApiProperty } from '@nestjs/swagger';
import { PopulateCountArrayQuery } from '@app/server/common/class-validators/populate-count-array-query.dto';

// Validate the parsed object by qs

class Sort implements ISort {
  @ApiProperty()
  @IsString()
  field: string;

  @ApiProperty({ type: () => String, example: 'asc', enum: ['asc', 'desc'] })
  @IsString()
  sort: 'asc' | 'desc';
}

class Pagination implements IPagination {
  @ApiProperty()
  @IsInt()
  @Min(1)
  page: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  pageSize: number;
}

export class GetListQuery extends PopulateCountArrayQuery {
  @ApiProperty({ type: () => Map<string, string> })
  @IsOptional()
  @IsObject()
  filters: IFilters;

  @ApiProperty({ type: () => [Sort], isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Sort)
  sort: Sort[];

  @ApiProperty({ type: () => Pagination })
  @ValidateNested()
  @Type(() => Pagination)
  pagination: Pagination;
}
