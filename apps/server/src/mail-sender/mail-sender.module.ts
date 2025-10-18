import { getEnv } from '@app/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { forwardRef, Logger, Module } from '@nestjs/common';
import { TempkeysModule } from '@app/server/api/tempkeys/tempkeys.module';
import { MailSenderService } from '@app/server/mail-sender/mail-sender.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory() {
        const MAILER_HOST = getEnv('MAILER_HOST');
        const MAILER_PORT = getEnv('MAILER_PORT');
        const MAILER_USER = getEnv('MAILER_USER');
        const MAILER_PASSWORD = getEnv('MAILER_PASSWORD');
        const MAILER_FROM = getEnv('MAILER_FROM');
        const MAILER_SECURE = getEnv('MAILER_SECURE') as boolean;
        Object.entries({
          MAILER_HOST,
          MAILER_USER,
          MAILER_PASSWORD,
          MAILER_FROM,
          MAILER_SECURE,
        }).forEach(([k, v]) => {
          if (v === undefined || v === null || v === '') {
            Logger.warn(
              `Missing required env variable ${k}, MailerModule will not be able to send emails`,
            );
          }
        });

        const FE_URL = getEnv('FE_HOST_NAME') as string;
        if (!FE_URL) {
          Logger.warn(
            `Missing required env variable FE_URL, some email will lead to invalid url`,
          );
        }

        return {
          transport: {
            host: MAILER_HOST,
            port: MAILER_PORT,
            secure: MAILER_SECURE,
            auth: {
              user: MAILER_USER,
              pass: MAILER_PASSWORD,
            },
            secureConnection: MAILER_SECURE,
            tls: { rejectUnauthorized: false, ciphers: 'SSLv3' },
          },
          defaults: {
            from: `${MAILER_FROM}`,
            replyTo: `${MAILER_FROM}`,
          },
        };
      },
    }),
    forwardRef(() => TempkeysModule),
  ],
  exports: [MailSenderService],
  providers: [MailSenderService],
})
export class MailSenderModule {}
