import { AppModule } from '@app/server/app.module';
import { isTest } from '@app/config';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

export const buildCookieStringFromJwtToken = (jwtToken: string) => {
  return `timelapse_access_token=${jwtToken}; HttpOnly; Path=/; Max-Age=3600; timelapse_refresh_token=${jwtToken}; HttpOnly; Path=/; Max-Age=3600`;
};

export const getAccessTokenCookiesFromResponse = (
  response: request.Response,
) => {
  if (response.status !== 201 && response.status !== 200) {
    throw new Error(`Request failed: ${response.status}`);
  }

  // @ts-expect-error - set-cookie is a string[]
  const rawSetCookie = response.headers['set-cookie'] as string[]; // array of strings
  const cookieString = rawSetCookie
    .map((cookie) => cookie.split(';')[0])
    .join('; ');

  return cookieString;
};
export const getAccessTokenCookies = async (
  app: INestApplication,
  email: string,
  password: string,
) => {
  const response = await request(app.getHttpServer()).post('/auth/login').send({
    email,
    password,
  });

  if (response.status !== 201 && response.status !== 200) {
    throw new Error('Failed to login');
  }

  return getAccessTokenCookiesFromResponse(response);
};

export const getTestTimeout = () => {
  return isTest() ? 300000 : 30000;
};

export const getTestApp = async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  return app;
};
