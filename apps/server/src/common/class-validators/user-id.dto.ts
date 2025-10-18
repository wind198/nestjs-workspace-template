import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserIdDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;
}
