import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DefaultArgs } from 'generated/prisma/runtime/library';
import { PrismaService } from '@app/prisma';
import { Prisma } from 'generated/prisma';
import moment from 'moment';
import { getEnv } from '@app/config';
import { parseExpirationTime } from '@app/server/common/helpers/parsers';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UserSessionsService {
  userSessionPrismaClient: Prisma.UserSessionDelegate<DefaultArgs>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {
    this.userSessionPrismaClient = this.prisma.userSession;
  }

  createUserSession(userId: number) {
    const refreshTokenExpirationTime = getEnv(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    );
    const { value, unit } = parseExpirationTime(refreshTokenExpirationTime);
    if (!value || !unit) {
      throw new InternalServerErrorException(
        this.i18n.t('common.errors.internalServerError'),
      );
    }
    return this.userSessionPrismaClient.create({
      data: {
        userId,
        expiresAt: moment()
          .add(value, unit as any)
          .toDate(),
      },
    });
  }

  checkUserSession(key: string) {
    return this.userSessionPrismaClient.findUnique({
      where: { key },
      include: {
        user: true,
      },
    });
  }
}
