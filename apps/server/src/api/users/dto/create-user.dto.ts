import { SHORT_STRING_MAX_LENGTH } from '@app/server/common/constants/rules';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  @MaxLength(SHORT_STRING_MAX_LENGTH)
  email: string;
}
