import { Options } from 'amqplib';
export const RABBITMQ_ENV_KEYS = [
  'RABBITMQ_HOST',
  'RABBITMQ_PORT',
  'RABBITMQ_USER',
  'RABBITMQ_PASSWORD',
  'X_MESSAGE_TTL',
  'X_MAX_LENGTH',
] as const;

export const DEFAULT_RABBITMQ_ENVS: Record<
  (typeof RABBITMQ_ENV_KEYS)[number],
  string | number | boolean
> = {
  RABBITMQ_HOST: 'localhost',
  RABBITMQ_PORT: 5672,
  RABBITMQ_USER: 'guest',
  RABBITMQ_PASSWORD: 'guest',
  X_MESSAGE_TTL: 24 * 60 * 60 * 1000,
  X_MAX_LENGTH: 10000,
};

export const getRabbitMQConnectionProps = (
  env: Record<string, any>,
): Options.Connect => {
  return {
    hostname: env['RABBITMQ_HOST'] || DEFAULT_RABBITMQ_ENVS.RABBITMQ_HOST,
    port: env['RABBITMQ_PORT'] || DEFAULT_RABBITMQ_ENVS.RABBITMQ_PORT,
    username: env['RABBITMQ_USER'] || DEFAULT_RABBITMQ_ENVS.RABBITMQ_USER,
    password:
      env['RABBITMQ_PASSWORD'] || DEFAULT_RABBITMQ_ENVS.RABBITMQ_PASSWORD,
    heartbeat: 30,
  };
};
