import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailSenderModule } from '@app/server/mail-sender/mail-sender.module';
import { TempkeysModule } from '@app/server/api/tempkeys/tempkeys.module';
import { UserSessionsModule } from '@app/server/api/user-sessions/user-sessions.module';
import { UsersModule } from '@app/server/api/users/users.module';
import { AuthModule } from '@app/server/api/auth/auth.module';
import { I18nModule } from '@app/server/i18n/i18n.module';
import { AmazonStrategy } from '@app/server/amazon.strategy';
import { AmazonGuard } from '@app/server/amazon.guard';
import { PrismaModule } from '@app/prisma';

@Module({
  imports: [
    I18nModule,
    MailSenderModule,
    PrismaModule,
    TempkeysModule,
    UserSessionsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AmazonStrategy, AmazonGuard],
})
export class AppModule {}
