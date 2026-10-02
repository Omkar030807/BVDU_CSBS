import 'dotenv/config';
import { z } from 'zod';

const booleanFromString = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z
    .string()
    .min(1)
    .default('postgresql://hms_user:hms_dev_password@localhost:5432/hms_db'),
  DB_SSL: booleanFromString,
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['combined', 'common', 'dev', 'short', 'tiny']).default('dev'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must contain at least 32 characters.')
    .refine((value) => !value.startsWith('replace_'), 'JWT_SECRET must be changed from the example value.'),
  SESSION_HOURS: z.coerce.number().int().min(1).max(24).default(8),
  COOKIE_NAME: z.string().min(1).default('hms_session'),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error('Invalid environment configuration:', parsedEnvironment.error.flatten().fieldErrors);
  throw new Error('Environment configuration is invalid.');
}

export const environment = parsedEnvironment.data;
export type Environment = typeof environment;
