import { SHORT_STRING_MAX_LENGTH } from '@app/server/common/constants/rules';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class RequestResetPasswordDto {
  @ApiProperty()
  @IsEmail()
  @IsString()
  @MaxLength(SHORT_STRING_MAX_LENGTH)
  email: string;
}
