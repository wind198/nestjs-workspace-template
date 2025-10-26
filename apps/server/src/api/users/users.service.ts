import { JwtService } from '@nestjs/jwt';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DefaultArgs } from 'generated/prisma/runtime/library';
import { PrismaService } from '@app/prisma';
import { Prisma, TempKeyType, User, UserRole } from 'generated/prisma';
import { hash } from 'bcryptjs';
import { I18nService } from 'nestjs-i18n';
import { WithLogger } from '@app/server/common/providers/WithLogger';
import { getEnv, isTest } from '@app/config';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { TempKeysService } from '@app/server/api/tempkeys/tempkeys.service';
import { JwtPayload } from '@app/server/api/auth/dto/jwt.dto';
import { MailSenderService } from '@app/server/mail-sender/mail-sender.service';
import { parseExpirationTime } from '@app/server/common/helpers/parsers';
import { CreateUserDto } from '@app/server/api/users/dto/create-user.dto';
import { faker } from '@faker-js/faker';
import { get, merge, set } from 'lodash';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';

@Injectable()
export class UsersService extends WithLogger {
  userPrismaClient: Prisma.UserDelegate<DefaultArgs>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
    private readonly jwtService: JwtService,
    private readonly tempKeyService: TempKeysService,
    private readonly mailSenderService: MailSenderService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly winstonLogger: WinstonLogger,
  ) {
    super(winstonLogger);
    this.userPrismaClient = this.prisma.$extends({
      query: {
        user: {
          $allOperations: async ({ args, operation, query }) => {
            if (
              [
                'findUnique',
                'findUniqueOrThrow',
                'findFirst',
                'findFirstOrThrow',
                'findMany',
                'create',
                'update',
                'delete',
              ].includes(operation)
            ) {
              if (!get(args, 'select.passwordHash')) {
                set(args, 'omit.passwordHash', true);
              }
            }
            return await query(args);
          },
        },
      },
    }).user as Prisma.UserDelegate<DefaultArgs>;
  }

  async createUser(payload: CreateUserDto, include?: Prisma.UserInclude) {
    const user = await this.userPrismaClient.create({
      data: {
        email: payload.email,
        passwordHash: await this.hashPassword(faker.internet.password()),
        role: UserRole.USER,
        isActive: true,
      },
      include,
    });
    if (!isTest()) {
      await this.sendUserActivateAccountEmail(user);
    }
    return user;
  }

  getUserProfile(id: number) {
    return this.userPrismaClient.findUnique({
      where: { id },
    });
  }

  hashPassword(password: string) {
    return hash(password, 8);
  }

  async checkUserById(
    id: number,
    additionalArgs?: Partial<Prisma.UserFindFirstArgs<DefaultArgs>>,
  ) {
    const { where: additionalWhere, ...rest } = additionalArgs || {};
    const user = await this.userPrismaClient.findFirst(
      merge(
        {
          where: {
            AND: [{ id }, additionalWhere].filter(
              Boolean,
            ) as Prisma.UserWhereInput,
          },
        },
        rest,
      ),
    );
    if (!user) {
      throw new NotFoundException(
        this.i18n.t('common.errors.notFound', {
          args: { element: this.i18n.t('resource.user') },
        }),
      );
    }
    return user;
  }

  async createTempkey(user: User, type: TempKeyType) {
    const expirationTime = getEnv(
      type === TempKeyType.RESET_PASSWORD
        ? 'JWT_RESET_PASSWORD_EXPIRATION_TIME'
        : type === TempKeyType.ACTIVATE_ACCOUNT
          ? 'JWT_ACTIVATE_ACCOUNT_EXPIRATION_TIME'
          : ('' as any),
    ) as string;
    if (!expirationTime) {
      throw new InternalServerErrorException(
        this.i18n.t('common.errors.internalServerError'),
      );
    }
    const { value, unit } = parseExpirationTime(expirationTime);
    if (!value || !unit) {
      this.logger.error(`Invalid expiration time: ${expirationTime}`);
      throw new InternalServerErrorException(
        this.i18n.t('common.errors.internalServerError'),
      );
    }
    const tempKeyId = uuidv4();
    const jwtToken = await this.jwtService.signAsync({
      id: user.id,
      identifier: user.email,
      role: user.role,
      tempkeyData: {
        id: tempKeyId,
        type: type,
      },
    } satisfies JwtPayload);
    const tempKey = await this.tempKeyService.tempKeyPrismaClient.create({
      data: {
        type: type,
        userId: user.id,
        token: jwtToken,
        id: tempKeyId,
        expiresAt: moment()
          .add(value, unit as any)
          .toDate(),
      },
    });
    return tempKey;
  }

  async sendUserResetPasswordEmail(user: User) {
    const tempKey = await this.createTempkey(user, TempKeyType.RESET_PASSWORD);

    const sendRes = await this.mailSenderService.sendUserResetPasswordEmail(
      user.email,
      tempKey.id,
    );

    if (!sendRes) {
      throw new InternalServerErrorException(
        this.i18n.t('common.errors.internalServerError', {
          args: {
            message: this.i18n.t('user.errors.emailSendingFailed'),
          },
        }),
      );
    }
    await this.userPrismaClient.update({
      where: { id: user.id },
      data: {
        lastResetPasswordRequestAt: new Date(),
      },
    });
  }

  async sendUserActivateAccountEmail(user: User) {
    const tempKey = await this.createTempkey(
      user,
      TempKeyType.ACTIVATE_ACCOUNT,
    );
    const sendRes = await this.mailSenderService.sendUserActivateAccountEmail(
      user.email,
      tempKey.id,
      user,
    );

    if (!sendRes) {
      throw new InternalServerErrorException(
        this.i18n.t('common.errors.internalServerError', {
          args: {
            message: this.i18n.t('user.errors.emailSendingFailed'),
          },
        }),
      );
    }
    await this.userPrismaClient.update({
      where: { id: user.id },
      data: {
        lastActivationEmailSentAt: new Date(),
      },
    });
  }
}
