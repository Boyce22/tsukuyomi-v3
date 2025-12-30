import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  APP_NAME: z.string().default('api'),
  LOG_DIR: z.string().min(1, 'LOG_DIR is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  RATE_LIMIT: z.coerce.number().int().positive('RATE_LIMIT must be a positive integer'),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),
  PORT: z.coerce.number().int().min(1).max(65535, 'PORT must be between 1 and 65535'),
  DB_USER: z.string().min(1, 'DB_USER is required'),
  DB_HOST: z.string().min(1, 'DB_HOST is required'),
  DB_PORT: z.coerce.number().int().min(1).max(65535, 'DB_PORT must be between 1 and 65535'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),
  DB_DATABASE: z.string().min(1, 'DB_DATABASE is required'),
  DB_SCHEMA: z.string().min(1, 'DB_SCHEMA is required'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Invalid environment variables:');
    console.error(result.error.format());
    throw new Error('Invalid environment variables');
  }

  return result.data;
};

export const env = parseEnv();
