import { getEnv } from '@app/config';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export const setupSwagger = async (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  // generate swagger json file
  const specFilePath = join(process.cwd(), './public', 'swagger.json');
  console.log('specFilePath', specFilePath);
  await writeFile(specFilePath, JSON.stringify(documentFactory(), null, 2));
  SwaggerModule.setup('api-docs', app, documentFactory);
};

export const setupShutdownHooks = (app: INestApplication) => {
  app.enableShutdownHooks();
};
export const setupCookieParser = (app: INestApplication) => {
  app.use(cookieParser());
};

export const setupGlobalPrefix = (app: INestApplication) => {
  const apiPrefix = getEnv('API_PREFIX') as string;
  app.setGlobalPrefix(apiPrefix);
};

export const setUpCors = (app: INestApplication) => {
  const whiteListedOrigins = getEnv('WHITE_LISTED_ORIGINS');
  app.enableCors({
    credentials: true,
    origin: Array.isArray(whiteListedOrigins)
      ? whiteListedOrigins
      : whiteListedOrigins.split(',').map((origin) => origin.trim()),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });
};
