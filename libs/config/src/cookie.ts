export const COOKIE_ENV_KEYS = ['COOKIE_SECRET'] as const;

export const DEFAULT_COOKIE_ENVS: Record<
  (typeof COOKIE_ENV_KEYS)[number],
  string | number | boolean
> = {
  COOKIE_SECRET: 'secret',
};

export type ICookieEnvKeys = (typeof COOKIE_ENV_KEYS)[number];
