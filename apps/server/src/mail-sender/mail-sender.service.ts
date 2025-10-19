import { Inject, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { render } from '@react-email/components';
import { ResetPassword } from '@app/emails';
import { getEnv } from '@app/config';
import { User } from 'generated/prisma';
import { ActivateAccount } from '@app/emails';
import { WithLogger } from '@app/server/common/providers/WithLogger';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';

@Injectable()
export class MailSenderService extends WithLogger {
  constructor(
    private readonly mailerService: MailerService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly winstonLogger: WinstonLogger,
  ) {
    super(winstonLogger);
  }

  async sendUserResetPasswordEmail(email: string, tempKeyId: string) {
    const apUrl = getEnv('FE_HOST_NAME') as string;
    const resetPasswordUrl = `${apUrl}/auth/reset-password?tempKey=${tempKeyId}`;
    try {
      const htmlString = await render(
        ResetPassword({
          name: email,
          resetPasswordUrl: resetPasswordUrl,
        }),
      );

      return this.mailerService.sendMail({
        to: email,
        subject: 'Reset Your Password',
        html: htmlString,
      });
    } catch (error) {
      this.logger.error(
        `Error sending user reset password email to ${email}`,
        error,
      );
    }
  }

  async sendUserActivateAccountEmail(
    userDisplayName: string,
    tempKeyId: string,
    user: User,
  ) {
    try {
      const apUrl = getEnv('FE_HOST_NAME') as string;
      const userActivationUrl = `${apUrl}/auth/activate-account?tempKey=${tempKeyId}`;
      const htmlString = await render(
        ActivateAccount({
          name: userDisplayName,
          activationUrl: userActivationUrl,
        }),
      );
      return this.mailerService.sendMail({
        to: user.email,
        subject: 'User activation',
        html: htmlString,
      });
    } catch (error) {
      this.logger.error(
        `Error sending user activation email to ${user.email}`,
        error,
      );
    }
  }
}
