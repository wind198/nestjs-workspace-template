import { User, UserRole, TempKey, UserSession } from 'generated/prisma';
import { Prisma } from 'generated/prisma';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UserIncludeResponse implements Record<keyof Prisma.UserInclude, unknown> {
  TempKey: TempKey[] = [];

  UserSession: UserSession[] = [];

  _count: Prisma.UserCountOutputType = {
    TempKey: 0,
    UserSession: 0,
  };
}

export class UserResponse implements User, Partial<UserIncludeResponse> {
  @ApiPropertyOptional({ type: [Object], isArray: true })
  TempKey?: TempKey[] = [];

  @ApiPropertyOptional({ type: [Object], isArray: true })
  UserSession?: UserSession[] = [];

  @ApiPropertyOptional({
    type: Object,
    example: { TempKey: 0, UserSession: 0 },
  })
  _count?: Prisma.UserCountOutputType = {
    TempKey: 0,
    UserSession: 0,
  };

  @ApiPropertyOptional()
  passwordHash: string = '';

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
  role: UserRole;
}
