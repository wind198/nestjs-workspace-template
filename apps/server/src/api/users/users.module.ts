import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TempkeysModule } from '@app/server/api/tempkeys/tempkeys.module';
import { MailSenderModule } from '@app/server/mail-sender/mail-sender.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    forwardRef(() => TempkeysModule),
    forwardRef(() => MailSenderModule),
  ],
  exports: [UsersService],
})
export class UsersModule {}
