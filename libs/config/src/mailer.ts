export const MAILER_ENV_KEYS = [
  'MAILER_HOST',
  'MAILER_PORT',
  'MAILER_USER',
  'MAILER_PASSWORD',
  'MAILER_FROM',
  'MAILER_SECURE',
] as const;

export const DEFAULT_MAILER_ENVS: Record<
  (typeof MAILER_ENV_KEYS)[number],
  string | number | boolean
> = {
  MAILER_HOST: 'smtp.gmail.com',
  MAILER_PORT: 587,
  MAILER_USER: 'tuanbk1908@gmail.com',
  MAILER_PASSWORD: '',
  MAILER_FROM: 'tuanbk1908@gmail.com',
  MAILER_SECURE: false,
};
