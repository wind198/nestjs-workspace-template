import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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
