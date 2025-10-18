import { SHORT_STRING_MAX_LENGTH } from '@app/server/common/constants/rules';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @MaxLength(SHORT_STRING_MAX_LENGTH)
  email: string;
}
