import { $Enums, User } from 'generated/prisma';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponse implements Omit<User, 'passwordHash'> {
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  lastResetPasswordRequestAt: Date | null;

  @ApiProperty()
  lastActivationEmailSentAt: Date | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string | null;

  @ApiProperty()
  lastName: string | null;

  @ApiProperty()
  amazonId: string | null;

  @ApiProperty()
  role: $Enums.UserRole;
}
