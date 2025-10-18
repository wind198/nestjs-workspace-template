import { SHORT_STRING_MAX_LENGTH } from '@app/server/common/constants/rules';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsStrongPassword, MaxLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty()
  @IsString()
  @IsStrongPassword()
  @MaxLength(SHORT_STRING_MAX_LENGTH)
  newPassword: string;

  @ApiProperty()
  @IsString()
  @MaxLength(SHORT_STRING_MAX_LENGTH)
  currentPassword: string;
}
