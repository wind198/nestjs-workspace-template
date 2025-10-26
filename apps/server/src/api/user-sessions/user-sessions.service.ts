import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DefaultArgs } from 'generated/prisma/runtime/library';
import { PrismaService } from '@app/prisma';
import { Prisma } from 'generated/prisma';
import moment from 'moment';
import { getEnv } from '@app/config';
import { parseExpirationTime } from '@app/server/common/helpers/parsers';
import { I18nService } from 'nestjs-i18n';
import { merge } from 'lodash';

export type CreateUserSessionPayload = Omit<
  Prisma.UserSessionCreateInput,
  'expiresAt'
>;
@Injectable()
export class UserSessionsService {
  userSessionPrismaClient: Prisma.UserSessionDelegate<DefaultArgs>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {
    this.userSessionPrismaClient = this.prisma.userSession;
  }

  createUserSession(payload: CreateUserSessionPayload) {
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
        ...payload,
        expiresAt: moment()
          .add(value, unit as any)
          .toDate(),
      },
    });
  }

  async checkUserSession(
    key: string,
    additionalArgs?: Prisma.UserSessionFindFirstArgs<DefaultArgs>,
  ) {
    const {
      where: additionalWhere,
      include: additionalInclude,
      ...rest
    } = additionalArgs || {};
    const userSession = await this.userSessionPrismaClient.findFirst(
      merge(
        {},
        {
          where: {
            AND: [{ key }, additionalWhere].filter(
              Boolean,
            ) as Prisma.UserSessionWhereInput,
          },
          include: {
            user: true,
            ...additionalInclude,
          },
        },
        rest,
      ),
    );
    return userSession;
  }

  logOutUserSession(key: string) {
    return this.userSessionPrismaClient.update({
      where: { key },
      data: {
        loggedOutAt: new Date(),
      },
    });
  }

  revokeUserSession(key: string) {
    return this.userSessionPrismaClient.update({
      where: { key },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
