import { TempKeyType, UserRole } from 'generated/prisma';

export type JwtTempkeyData = {
  type: TempKeyType;
  id: string;
};

export type JwtPayload = {
  id: number;

  identifier: string; // email or username, depend on legacy user or iam user

  role: UserRole;

  tempkeyData?: JwtTempkeyData;
};
