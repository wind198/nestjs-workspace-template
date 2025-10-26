import { LoggerService } from '@nestjs/common';
import { WinstonLogger } from 'nest-winston';

export interface LogContext {
  userId?: string | number;
  requestId?: string;
  method?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
  [key: string]: any;
}

export class AppLogger implements LoggerService {
  private logger: WinstonLogger;

  private name: string;

  private formatMessage(message: string) {
    return `[${this.name}] - ${message}`;
  }

  constructor(name: string, winstonLogger: WinstonLogger) {
    this.logger = winstonLogger;
    this.name = name;
  }

  log(message: string, ...args: any[]) {
    this.logger.log(
      'info',
      this.formatMessage(message),
      // @ts-expect-error - args is any
      ...args,
    );
  }

  error(m: string, ...args: any[]) {
    this.logger.error(this.formatMessage(m), ...args);
  }

  warn(message: string, ...args: any[]) {
    this.logger.warn(this.formatMessage(message), ...args);
  }

  debug(message: string, ...args: any[]) {
    this.logger.debug?.(this.formatMessage(message), ...args);
  }
}
