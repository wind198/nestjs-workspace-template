import { AuthService } from '@app/server/api/auth/auth.service';
import { JwtPayload } from '@app/server/api/auth/dto/jwt.dto';
import { UsersService } from '@app/server/api/users/users.service';
import {
  ACCESS_TOKEN,
  IS_PUBLIC,
  REFRESH_TOKEN,
} from '@app/server/common/constants/keys';
import { getLangFromRequest } from '@app/server/common/helpers/others';
import { WithLogger } from '@app/server/common/providers/WithLogger';
import {
  CanActivate,
  ExecutionContext,
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

@Injectable()
export class JwtGuard extends WithLogger implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UsersService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly i18nService: I18nService,
    private readonly userSessionService: UserSessionsService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const lang = getLangFromRequest(request, this.i18nService);
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
      throw new UnauthorizedException(
        this.i18nService.t('auth.errors.unauthorized', { lang }),
      );
    }

     
    let userPayload: JwtPayload | 'expired' = await this.validateAccessToken(
      accessToken,
      lang,
    );
    if (userPayload === 'expired') {
      userPayload = await this.validateRefreshToken(refreshToken);
      request.shouldRefreshToken = true;
    }
    this.validateJwtPayloadForTempkeyData(userPayload, request, lang);

    const matchUser = await this.userService.userPrismaClient.findFirst({
      where: {
        id: userPayload.id,
        email: userPayload.identifier,
      },
    });
    if (!matchUser) {
      throw new UnauthorizedException(
        this.i18nService.t('auth.errors.invalidAccessToken', { lang }),
      );
    }
    request.user = userPayload;

    return true;
  }

  async validateAccessToken(
    token: string,
    lang: string,
  ): Promise<JwtPayload | 'expired'> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      return payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return 'expired';
      } else if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException(
          this.i18nService.t('auth.errors.invalidAccessToken', { lang }),
        );
      }
      throw new InternalServerErrorException(
        this.i18nService.t('common.errors.internalServerError', { lang }),
      );
    }
  }

  async validateRefreshToken(token: string): Promise<JwtPayload> {
    const matchSession = await this.userSessionService.checkUserSession(token);
    if (!matchSession) {
      throw new UnauthorizedException(
        this.i18nService.t('auth.errors.invalidRefreshToken'),
      );
    }
    if (matchSession.expiresAt < new Date()) {
      throw new UnauthorizedException(
        this.i18nService.t('auth.errors.expiredRefreshToken'),
      );
    }
    return {
      id: matchSession.userId,
      identifier: matchSession.user?.email,
      role: matchSession.user?.role,
    } satisfies JwtPayload;
  }

  validateJwtPayloadForTempkeyData(
    payload: JwtPayload,
    req: Request,
    lang: string,
  ) {
    const url = req.url;
    if (url.startsWith('/auth/activate-account')) {
      if (payload.tempkeyData?.type !== TempKeyType.ACTIVATE_ACCOUNT) {
        this.logger.warn(
          `Invalid tempkey type for activate account, check it out: ${JSON.stringify(
            payload,
          )}`,
        );
        throw new UnauthorizedException(
          this.i18nService.t('auth.errors.invalidAccessToken', { lang }),
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
          this.i18nService.t('auth.errors.invalidAccessToken', { lang }),
        );
      }
    }
  }
}
