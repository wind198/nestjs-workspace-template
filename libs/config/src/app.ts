export const APP_ENV_KEYS = [
  'NODE_ENV',
  'WEB_API_PORT',
  'HOST_NAME',
  'FE_HOST_NAME',
  'DEFAULT_PASSWORD_LENGTH',
  'API_PREFIX',
  'ROOT_ADMIN_EMAIL',
  'ROOT_ADMIN_PASSWORD',
  'DEFAULT_ADMIN_EMAIL',
  'DEFAULT_ADMIN_PASSWORD',
  'APP_NAME',
] as const;

export const DEFAULT_APP_ENVS: Record<
  (typeof APP_ENV_KEYS)[number],
  string | number | boolean
> = {
  NODE_ENV: 'development',
  WEB_API_PORT: 8000,
  DEFAULT_PASSWORD_LENGTH: 10,
  FE_HOST_NAME: 'localhost:3000',
  API_PREFIX: '/api/v1',
  ROOT_ADMIN_EMAIL: 'tuanbk1908@gmail.com',
  ROOT_ADMIN_PASSWORD: 'password',
  APP_NAME: 'Bytime-central-web-server',
  HOST_NAME: 'localhost',
  DEFAULT_ADMIN_EMAIL: 'admin@bytime.com',
  DEFAULT_ADMIN_PASSWORD: 'password',
};

export type IAppEnvKeys = (typeof APP_ENV_KEYS)[number];
