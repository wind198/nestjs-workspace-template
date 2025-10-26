import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailSenderModule } from '@app/server/mail-sender/mail-sender.module';
import { TempkeysModule } from '@app/server/api/tempkeys/tempkeys.module';
import { UserSessionsModule } from '@app/server/api/user-sessions/user-sessions.module';
import { UsersModule } from '@app/server/api/users/users.module';
import { AuthModule } from '@app/server/api/auth/auth.module';
import { I18nModule } from '@app/server/i18n/i18n.module';
import { PrismaModule } from '@app/prisma';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { WinstonModule } from 'nest-winston';
import { getEnv } from '@app/config';
import { APP_PIPE } from '@nestjs/core';
import { getWinstonModuleOptions } from '@app/config';
@Module({
  imports: [
    I18nModule,
    MailSenderModule,
    PrismaModule,
    TempkeysModule,
    UserSessionsModule,
    UsersModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public',
    }),
    WinstonModule.forRoot(getWinstonModuleOptions(getEnv('APP_NAME'))),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
