import { getEnv } from '@app/config';
import { forwardRef, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@app/server/api/users/users.module';
import { TempkeysModule } from '@app/server/api/tempkeys/tempkeys.module';
import { AuthController } from '@app/server/api/auth/auth.controller';
import { AuthService } from '@app/server/api/auth/auth.service';
import { JwtPayload } from '@app/server/api/auth/dto/jwt.dto';
import { RoleGuard } from '@app/server/api/auth/role.guard';
import { JwtGuard } from '@app/server/api/auth/jwt.guard';
import { RefreshTokenInterceptor } from '@app/server/api/auth/refresh-token.interceptor';
import { UserSessionsModule } from '@app/server/api/user-sessions/user-sessions.module';

declare module 'express' {
  interface Request {
    user: JwtPayload;
  }
}

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => TempkeysModule),
    forwardRef(() => UserSessionsModule),
    JwtModule.register({
      global: true,
      secret: getEnv('JWT_SECRET') as string,
      signOptions: { expiresIn: getEnv('JWT_EXPIRATION_TIME') },
      verifyOptions: {
        ignoreExpiration: false,
      },
    }),
  ],

  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RefreshTokenInterceptor,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
