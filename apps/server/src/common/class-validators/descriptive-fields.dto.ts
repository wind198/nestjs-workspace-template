import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  LONG_STRING_MAX_LENGTH,
  SHORT_STRING_MAX_LENGTH,
} from '@app/server/common/constants/rules';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DescriptionFieldDto {
  @ApiProperty()
  @MaxLength(SHORT_STRING_MAX_LENGTH)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (value as string).trim())
  name: string;

  @ApiPropertyOptional()
  @MaxLength(LONG_STRING_MAX_LENGTH)
  @IsOptional()
  @IsString()
  description?: string;
}
