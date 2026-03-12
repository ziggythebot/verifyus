/**
 * Environment variable validation and type-safe access
 * Run this on server startup to validate all required env vars are present
 */

import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Encryption
  PROOF_ENCRYPTION_KEY: z.string().length(64),
  
  // API Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  API_BASE_URL: z.string().url(),
  
  // Auth
  SESSION_SECRET: z.string().min(32),
  JWT_SECRET: z.string().min(32),
  
  // zkPass (optional for now, required for verification)
  ZKPASS_APP_ID: z.string().optional(),
  ZKPASS_SCHEMA_ID: z.string().optional(),
  
  // ATS Integration (optional)
  GREENHOUSE_API_KEY: z.string().optional(),
  GREENHOUSE_WEBHOOK_SECRET: z.string().optional(),
  LEVER_API_KEY: z.string().optional(),
  LEVER_WEBHOOK_SECRET: z.string().optional(),
  
  // Rate Limiting (optional)
  REDIS_URL: z.string().url().or(z.literal('')).optional(),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(val => val ? Number(val) : undefined).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  FROM_EMAIL: z.string().email().or(z.literal('')).optional(),

  // Monitoring (optional)
  SENTRY_DSN: z.string().url().or(z.literal('')).optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Blockchain (optional)
  BLOCKCHAIN_ENABLED: z.string().transform(val => val === 'true').optional(),
  BLOCKCHAIN_NETWORK: z.string().optional(),
  BLOCKCHAIN_RPC_URL: z.string().url().or(z.literal('')).optional(),
  BLOCKCHAIN_PRIVATE_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

/**
 * Validates and returns type-safe environment variables
 * Throws error if required variables are missing or invalid
 */
export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Environment variable validation failed:');
    console.error(result.error.format());
    throw new Error('Invalid environment variables');
  }

  cachedEnv = result.data;
  return cachedEnv;
}

/**
 * Validates environment on startup
 * Call this before starting the server
 */
export function validateEnv(): void {
  try {
    const env = getEnv();
    console.log('✅ Environment variables validated');

    // Warn about missing optional but recommended vars
    const hasZkPass = env.ZKPASS_APP_ID &&
                      env.ZKPASS_SCHEMA_ID &&
                      !env.ZKPASS_APP_ID.startsWith('your-') &&
                      !env.ZKPASS_SCHEMA_ID.startsWith('your-');

    if (!hasZkPass) {
      console.warn('⚠️  zkPass credentials not configured - verification will not work');
      console.warn('   Register at https://devhub.zkpass.org and update ZKPASS_APP_ID and ZKPASS_SCHEMA_ID');
    }

    if (!env.REDIS_URL && env.NODE_ENV === 'production') {
      console.warn('⚠️  Redis not configured - rate limiting disabled');
    }

  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    process.exit(1);
  }
}
