import { isTest } from '@app/config';
import { TestingModule } from '@nestjs/testing';
import request from 'supertest';

/**
 * Get the access token cookies from the response
 * @param response - Response to get the access token cookies from
 * @returns The access token cookies string
 */
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

/** Testing need longer timeout for debugging purposes
 * Pass this to request call to avoid timeout errors
 * @returns The test timeout
 */
export const getTestTimeout = () => {
  return isTest() ? 300000 : 30000;
};

/**
 * Time travel to the future to test the expiration of the token
 * @param ms - Time to travel in milliseconds
 */
export const timeTravel = (ms: number) => {
  jest.useFakeTimers({
    doNotFake: [
      'nextTick',
      'setImmediate',
      'clearImmediate',
      'setInterval',
      'clearInterval',
      'setTimeout',
      'clearTimeout',
    ],
  });
  jest.advanceTimersByTime(ms);
};

export const getTestApp = async (testingModule: TestingModule) => {
  const app = testingModule.createNestApplication();
  await app.init();

  return app;
};
