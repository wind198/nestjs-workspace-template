import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { getEnv, getLogLevel } from '@app/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  setupCookieParser,
  setupGlobalPrefix,
  setupShutdownHooks,
  setupSwagger,
  setUpCors,
} from '@app/server/common/helpers/app';

import { WinstonModule } from 'nest-winston';
import { getWinstonModuleOptions } from '@app/config';

async function bootstrap() {
  const logLevel = getLogLevel();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(
      getWinstonModuleOptions(getEnv('APP_NAME')),
    ),
  });

  setupShutdownHooks(app);
  setupCookieParser(app);
  setUpCors(app);
  setupGlobalPrefix(app);
  await setupSwagger(app);

  await app.listen(getEnv('SERVER_PORT') as number);
  const url = await app.getUrl();
  Logger.log(
    `${getEnv('APP_NAME')} is running on ${url} on env ${getEnv('NODE_ENV')}`,
  );
  Logger.log(`Swagger is running on ${url}/api-docs`);
  Logger.log(`Log level is ${logLevel}`);
}
void bootstrap();
