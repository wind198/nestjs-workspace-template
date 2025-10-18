import { APP_ENV_KEYS, DEFAULT_APP_ENVS } from './app';
import { COOKIE_ENV_KEYS, DEFAULT_COOKIE_ENVS } from './cookie';
import { DEFAULT_JWT_ENVS, JWT_ENV_KEYS } from './jwt';
import { DEFAULT_MAILER_ENVS, MAILER_ENV_KEYS } from './mailer';
import { DEFAULT_POSTGRES_ENVS, POSTGRES_ENV_KEYS } from './postgres';
import { DEFAULT_RABBITMQ_ENVS, RABBITMQ_ENV_KEYS } from './rabbit';
import dotenv from 'dotenv';
import dotenvParseVariables from 'dotenv-parse-variables';

let env = dotenv.config({
  path: process.env['NODE_ENV'] === 'test' ? '.env.test' : '.env',
});

if (env.error) {
  console.warn('env.error', env.error);
}
env = dotenvParseVariables(env.parsed as any);

export const DEFAULT_CONFIG = {
  ...DEFAULT_POSTGRES_ENVS,
  ...DEFAULT_APP_ENVS,
  ...DEFAULT_COOKIE_ENVS,
  ...DEFAULT_JWT_ENVS,
  ...DEFAULT_MAILER_ENVS,
  ...DEFAULT_RABBITMQ_ENVS,
};

export const ENV_KEYS = [
  ...POSTGRES_ENV_KEYS,
  ...APP_ENV_KEYS,
  ...COOKIE_ENV_KEYS,
  ...JWT_ENV_KEYS,
  ...MAILER_ENV_KEYS,
  ...RABBITMQ_ENV_KEYS,
] as const;

export const getEnv = (key: (typeof ENV_KEYS)[number]) => {
  if (env[key] !== undefined) {
    return env[key];
  }
  return getEnvRaw(key);
};

export const getEnvRaw = (key: (typeof ENV_KEYS)[number]) => {
  const envRaw = process.env[key];
  if (envRaw === undefined) {
    return DEFAULT_CONFIG[key];
  }
  const parsedEnv = dotenvParseVariables({ [key]: envRaw });
  if (parsedEnv[key] === undefined) {
    return DEFAULT_CONFIG[key];
  }
  return parsedEnv[key];
};

export const isDev = () => {
  const env = getEnv('NODE_ENV');
  return env === 'development';
};

export const isTest = () => {
  const env = getEnv('NODE_ENV');
  return env === 'test';
};

export const getLogLevel = () => {
  const defaultVal = isDev() ? 'debug' : 'log';
  const logLevel = process.env['WEB_API_LOG_LEVEL'] ?? defaultVal;
  return logLevel;
};

console.log('Starting server with the following environment variables:');
console.table(env);
