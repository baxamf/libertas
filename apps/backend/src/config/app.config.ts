import { registerAs } from '@nestjs/config';
import { z } from 'zod';

export interface AppConfig {
  nodeEnv: string;
  host: string;
  port: number;
  corsOrigin?: string; // optional, if you want to restrict CORS to specific origins
  cookieSecret: string;
}

export const appConfig = registerAs('APP', (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  host: process.env.HOST || 'localhost',
  port: Number(process.env.PORT || 5000),
  corsOrigin: process.env.CORS_ORIGIN,
  cookieSecret: process.env.COOKIE_SECRET!,
}));

export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string; // optional, if you want to use refresh tokens
  accessExpiresInSeconds: number; // default 900 (15 minutes)
  refreshExpiresInSeconds: number; // default 604800 (7 days), optional if you want to use refresh tokens
  accessCookieName: string;
  refreshCookieName: string;
}

export const jwtConfig = registerAs('JWT', (): JwtConfig => ({
  accessSecret: process.env.JWT_SECRET ?? '',
  accessExpiresInSeconds: Number(process.env.JWT_EXPIRES_IN_SECONDS ?? '900'),
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
  refreshExpiresInSeconds: Number(
    process.env.JWT_REFRESH_EXPIRES_IN_SECONDS ?? '604800',
  ),
  accessCookieName: process.env.JWT_ACCESS_COOKIE_NAME ?? 'access_token',
  refreshCookieName: process.env.JWT_REFRESH_COOKIE_NAME ?? 'refresh_token',
}));

const strictCookieNameSchema = z
  .string()
  .trim()
  .min(1, 'Cookie name cannot be empty')
  .max(64, 'Cookie name is too long')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Cookie name must only use alphanumeric characters, hyphens, or underscores',
  )
  .refine(
    (name) =>
      !['session_id', 'sid', 'jsessionid', 'phpsessid'].includes(
        name.toLowerCase(),
      ),
    {
      message:
        'Generic session names are blocked for security. Use a custom app prefix.',
    },
  );

export const ConfigValidationSchema = z.object({
  // App configuration
  NODE_ENV: z
    .literal(['development', 'production', 'test'])
    .default('development'),
  HOST: z.string().default('localhost'),
  PORT: z.coerce.number().int().default(5000),
  CORS_ORIGIN: z.string().optional(),
  COOKIE_SECRET: z.string().default(''),
  DATABASE_URL: z.string().trim().min(2, 'Database URL cannot be empty'),

  // JWT configuration
  JWT_SECRET: z.string().default(''),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().default(900),
  JWT_REFRESH_SECRET: z.string().default(''),
  JWT_REFRESH_EXPIRES_IN_SECONDS: z.coerce.number().default(604800),
  JWT_ACCESS_COOKIE_NAME: strictCookieNameSchema.default('access_token'),
  JWT_REFRESH_COOKIE_NAME: strictCookieNameSchema.default('refresh_token'),
});
