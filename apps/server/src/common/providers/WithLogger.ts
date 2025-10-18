import { Logger } from '@nestjs/common';

export class WithLogger {
  logger = new Logger(this.constructor.name);
}
