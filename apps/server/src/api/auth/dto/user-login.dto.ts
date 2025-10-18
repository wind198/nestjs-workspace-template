import { SHORT_STRING_MAX_LENGTH } from '@app/server/common/constants/rules';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class UserLoginDto {
  @ApiProperty()
  @IsEmail()
  @MaxLength(SHORT_STRING_MAX_LENGTH)
  email: string;

  @ApiProperty()
  @IsString()
  @MaxLength(SHORT_STRING_MAX_LENGTH)
  password: string;
}
