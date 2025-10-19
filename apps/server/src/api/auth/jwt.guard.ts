import { AuthService } from '@app/server/api/auth/auth.service';
import { JwtPayload } from '@app/server/api/auth/dto/jwt.dto';
import { UsersService } from '@app/server/api/users/users.service';
import {
  ACCESS_TOKEN,
  IS_PUBLIC,
  REFRESH_TOKEN,
} from '@app/server/common/constants/keys';
import { WithLogger } from '@app/server/common/providers/WithLogger';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { TempKeyType } from 'generated/prisma';
import { I18nService } from 'nestjs-i18n';
import { UserSessionsService } from '@app/server/api/user-sessions/user-sessions.service';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
@Injectable()
export class JwtGuard extends WithLogger implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UsersService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
    private readonly userSessionService: UserSessionsService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly winstonLogger: WinstonLogger,
  ) {
    super(winstonLogger);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const cookie = this.authService.extractCookiesFromRequest(request);
    const accessToken = cookie?.[ACCESS_TOKEN];
    const refreshToken = cookie?.[REFRESH_TOKEN];

    if (!accessToken || !refreshToken) {
      const msg = this.i18n.t('auth.errors.unauthorized');
      throw new UnauthorizedException(msg);
    }

    let userPayload: JwtPayload | 'expired' =
      await this.validateAccessToken(accessToken);
    if (userPayload === 'expired') {
      userPayload = await this.validateRefreshToken(refreshToken);
      request.shouldRefreshToken = true;
    }
    this.validateJwtPayloadForTempkeyData(userPayload, request);

    const matchUser = await this.userService.userPrismaClient.findFirst({
      where: {
        id: userPayload.id,
        email: userPayload.identifier,
      },
    });
    if (!matchUser) {
      throw new UnauthorizedException(
        this.i18n.t('auth.errors.invalidAccessToken'),
      );
    }
    request.user = userPayload;

    return true;
  }

  async validateAccessToken(token: string): Promise<JwtPayload | 'expired'> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      return payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return 'expired';
      } else if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException(
          this.i18n.t('auth.errors.invalidAccessToken'),
        );
      }
      throw new InternalServerErrorException(
        this.i18n.t('common.errors.internalServerError'),
      );
    }
  }

  async validateRefreshToken(token: string): Promise<JwtPayload> {
    const matchSession = await this.userSessionService.checkUserSession(token);
    if (!matchSession) {
      throw new UnauthorizedException(
        this.i18n.t('auth.errors.invalidRefreshToken'),
      );
    }
    if (matchSession.expiresAt < new Date()) {
      throw new UnauthorizedException(
        this.i18n.t('auth.errors.expiredRefreshToken'),
      );
    }
    return {
      id: matchSession.userId,
      identifier: matchSession.user?.email,
      role: matchSession.user?.role,
    } satisfies JwtPayload;
  }

  validateJwtPayloadForTempkeyData(payload: JwtPayload, req: Request) {
    const url = req.url;
    if (url.startsWith('/auth/activate-account')) {
      if (payload.tempkeyData?.type !== TempKeyType.ACTIVATE_ACCOUNT) {
        this.logger.warn(
          `Invalid tempkey type for activate account, check it out: ${JSON.stringify(
            payload,
          )}`,
        );
        throw new UnauthorizedException(
          this.i18n.t('auth.errors.invalidAccessToken'),
        );
      }
    }
    if (url.startsWith('/auth/reset-password')) {
      if (payload.tempkeyData?.type !== TempKeyType.RESET_PASSWORD) {
        this.logger.warn(
          `Invalid tempkey type for reset password, check it out: ${JSON.stringify(
            payload,
          )}`,
        );
        throw new UnauthorizedException(
          this.i18n.t('auth.errors.invalidAccessToken'),
        );
      }
    }
  }
}
