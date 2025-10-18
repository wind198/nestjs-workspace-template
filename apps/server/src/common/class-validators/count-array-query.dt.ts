import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsOptional, IsString } from 'class-validator';

export class CountArrayQuery {
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
    return (value as string)?.split(',').map((item) => item.trim());
  })
  count: string[] = [];
}
