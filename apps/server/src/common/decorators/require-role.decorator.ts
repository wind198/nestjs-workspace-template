import { REQUIRE_ROLE } from '@app/server/common/constants/keys';
import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'generated/prisma';

export const RequireRole = (roles: UserRole[]) =>
  SetMetadata(REQUIRE_ROLE, roles);
