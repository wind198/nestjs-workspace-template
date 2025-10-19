export const APP_ENV_KEYS = [
  'NODE_ENV',
  'SERVER_PORT',
  'SERVER_LOG_LEVEL',
  'HOST_NAME',
  'FE_HOST_NAME',
  'DEFAULT_PASSWORD_LENGTH',
  'API_PREFIX',
  'ROOT_ADMIN_EMAIL',
  'ROOT_ADMIN_PASSWORD',
  'DEFAULT_ADMIN_EMAIL',
  'DEFAULT_ADMIN_PASSWORD',
  'APP_NAME',
  'WHITE_LISTED_ORIGINS',
] as const;

export const DEFAULT_APP_ENVS: Record<
  (typeof APP_ENV_KEYS)[number],
  string | number | boolean
> = {
  NODE_ENV: 'development',
  SERVER_PORT: 8000,
  SERVER_LOG_LEVEL: '',
  DEFAULT_PASSWORD_LENGTH: 10,
  FE_HOST_NAME: 'localhost:3000',
  API_PREFIX: '/api/v1',
  ROOT_ADMIN_EMAIL: 'tuanbk1908@gmail.com',
  ROOT_ADMIN_PASSWORD: 'password',
  APP_NAME: 'bytime-central-web-server',
  HOST_NAME: 'localhost',
  DEFAULT_ADMIN_EMAIL: 'admin@bytime.com',
  WHITE_LISTED_ORIGINS:
    'http://localhost:5173,http://localhost:3000,https://localhost:5173',
  DEFAULT_ADMIN_PASSWORD: 'password',
};

export type IAppEnvKeys = (typeof APP_ENV_KEYS)[number];
