import { Module } from '@nestjs/common';
import { TempKeysService } from './tempkeys.service';

@Module({
  providers: [TempKeysService],
  exports: [TempKeysService],
})
export class TempkeysModule {}
