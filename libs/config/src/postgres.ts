export const POSTGRES_ENV_KEYS = ['DATABASE_URL'] as const;

export const DEFAULT_POSTGRES_ENVS: Record<
  (typeof POSTGRES_ENV_KEYS)[number],
  string | number | boolean
> = {
  DATABASE_URL: 'postgres://postgres:password@localhost:5433/timelapse_db',
};

export type IPostgresEnvKeys = (typeof POSTGRES_ENV_KEYS)[number];
