import { AppLogger } from '@app/server/common/providers/AppLogger';
import { WinstonLogger } from 'nest-winston';

export class WithLogger {
  logger: AppLogger;

  constructor(winstonLogger: WinstonLogger) {
    this.logger = new AppLogger(this.constructor.name, winstonLogger);
  }
}
