import { JwtPayload } from '@app/server/api/auth/dto/jwt.dto';
import { UsersService } from '@app/server/api/users/users.service';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@app/server/common/constants/keys';
import { WithLogger } from '@app/server/common/providers/WithLogger';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { getEnv, isDev } from '@app/config';
import { Response, Request } from 'express';
import { omit } from 'lodash';
import {
  CreateUserSessionPayload,
  UserSessionsService,
} from '@app/server/api/user-sessions/user-sessions.service';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
@Injectable()
export class AuthService extends WithLogger {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly userSessionService: UserSessionsService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly winstonLogger: WinstonLogger,
  ) {
    super(winstonLogger);
  }

  async generateAccessToken(payload: JwtPayload, options?: JwtSignOptions) {
    const accessToken = await this.jwtService.signAsync(
      {
        identifier: payload.identifier,
        id: payload.id,
        role: payload.role,
      },
      {
        expiresIn: getEnv('JWT_EXPIRATION_TIME'),
        secret: getEnv('JWT_SECRET') as string,
        ...options,
      },
    );
    return accessToken;
  }

  async generateRefreshToken(payload: CreateUserSessionPayload) {
    const refreshToken =
      await this.userSessionService.createUserSession(payload);
    return refreshToken.key;
  }

  async generateTokens(
    jwtPayload: JwtPayload,
    createUserSessionPayload: CreateUserSessionPayload,
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(jwtPayload),
      this.generateRefreshToken(createUserSessionPayload),
    ]);
    return { accessToken, refreshToken };
  }

  attachAccessTokenToCookie(res: Response, accessToken: string) {
    const isDevEnv = isDev();
    res.cookie(ACCESS_TOKEN, accessToken, {
      httpOnly: !isDevEnv,
      secure: !isDevEnv,
      sameSite: isDevEnv ? 'lax' : 'strict',
      path: '/',
    });
  }

  attachRefreshTokenToCookie(res: Response, refreshToken: string) {
    const isDevEnv = isDev();
    res.cookie(REFRESH_TOKEN, refreshToken, {
      httpOnly: !isDevEnv,
      secure: !isDevEnv,
      sameSite: isDevEnv ? 'lax' : 'strict',
      path: '/',
    });
  }

  async getProfileForLegacyUser(id: number) {
    const user = await this.userService.checkUserById(id);
    return omit(user, ['passwordHash']);
  }

  extractCookiesFromRequest(req: Request): Record<string, string> | undefined {
    const cookie = req.cookies as Record<string, string>;
    if (!cookie) {
      const header = req.headers['cookie'] as string;
      if (!header) {
        return;
      }
      const cookies = header.split('; ');
      return Object.fromEntries(cookies.map((cookie) => cookie.split('=')));
    }
    return cookie;
  }
}
