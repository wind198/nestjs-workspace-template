import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsOptional, IsString } from 'class-validator';

export class PopulateCountArrayQuery {
  @ApiPropertyOptional({
    description: 'Populate array',
    type: [String],
    isArray: true,
    example: ['user', 'role'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim());
    }
    return [];
  })
  populate?: string[] = []; // we only allow populate full relation, without pick fields

  @ApiPropertyOptional({
    description: 'Count array',
    type: [String],
    isArray: true,
    example: ['user', 'role'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim());
    }
    return [];
  })
  count?: string[] = [];
}
