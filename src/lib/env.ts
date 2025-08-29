import { z } from 'zod';

/**
 * Environment Configuration with Zod Validation
 *
 * This module validates and parses environment variables to ensure
 * the application has all required configuration values at startup.
 */

// Define the environment variable schema
const envSchema = z.object({
  // Application Settings
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Database
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),

  // Authentication & Security
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  SESSION_COOKIE_NAME: z.string().default('seatfinder-session'),
  SESSION_MAX_AGE: z.coerce.number().default(604800), // 7 days

  // OTP Configuration
  OTP_EXPIRY_MINUTES: z.coerce.number().default(10),
  OTP_LENGTH: z.coerce.number().default(6),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(5),

  // Email Service (Mailgun)
  MAILGUN_API_KEY: z.string().optional(),
  MAILGUN_DOMAIN: z.string().optional(),
  MAILGUN_FROM_EMAIL: z.string().email().optional(),
  MAILGUN_FROM_NAME: z.string().default('SeatFinder'),
  MAILGUN_WEBHOOK_SIGNING_KEY: z.string().optional(),

  // Payment Processing (Midtrans)
  MIDTRANS_SERVER_KEY: z.string().optional(),
  MIDTRANS_CLIENT_KEY: z.string().optional(),
  MIDTRANS_IS_PRODUCTION: z.coerce.boolean().default(false),
  MIDTRANS_WEBHOOK_SECRET: z.string().optional(),

  // File Upload & Storage
  MAX_CSV_FILE_SIZE_MB: z.coerce.number().default(10),
  MAX_CSV_ROWS: z.coerce.number().default(10000),

  // QR Code Settings
  QR_CODE_SIZE: z.coerce.number().default(200),
  QR_CODE_ERROR_CORRECTION: z.enum(['L', 'M', 'Q', 'H']).default('M'),

  // Internal Analytics
  METRICS_ENABLED: z.coerce.boolean().default(true),
  METRICS_ENDPOINT: z.string().default('/api/metrics/ingest'),
  METRICS_SECRET: z.string().optional(),

  // Development Settings
  DEBUG_MODE: z.coerce.boolean().default(false),
  ENABLE_API_DOCS: z.coerce.boolean().default(true),
  ENABLE_SEED_DATA: z.coerce.boolean().default(false),
  SEED_ADMIN_EMAIL: z.string().email().optional(),

  // Deployment Settings
  VERCEL_ENV: z.string().optional(),
  VERCEL_REGION: z.string().default('sin1'),
  ALLOWED_ORIGINS: z.string().optional(),

  // Feature Flags
  FEATURE_PAYMENT_ENABLED: z.coerce.boolean().default(true),
  FEATURE_EMAIL_ENABLED: z.coerce.boolean().default(true),
  FEATURE_ANALYTICS_ENABLED: z.coerce.boolean().default(true),
  FEATURE_RATE_LIMITING_ENABLED: z.coerce.boolean().default(true),
});

// Validate and parse environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = (error as z.ZodError).issues.map(err => {
        const path = err.path.join('.');
        const message = err.message;
        return `${path}: ${message}`;
      });

      console.error('❌ Environment validation failed:');
      console.error(missingVars.join('\n'));
      console.error(
        '\n📋 Please check your .env.local file and ensure all required variables are set.'
      );
      console.error(
        '📄 Refer to .env.example for the complete list of environment variables.'
      );

      throw new Error('Environment validation failed');
    }
    throw error;
  }
}

// Export the validated environment configuration
export const env = validateEnv();

// Type for the environment configuration
export type Environment = z.infer<typeof envSchema>;

// Helper functions for common environment checks
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Feature flag helpers
export const features = {
  payment: env.FEATURE_PAYMENT_ENABLED,
  email: env.FEATURE_EMAIL_ENABLED,
  analytics: env.FEATURE_ANALYTICS_ENABLED,
  rateLimiting: env.FEATURE_RATE_LIMITING_ENABLED,
} as const;

// Database configuration helper
export const database = {
  uri: env.MONGODB_URI,
} as const;

// Auth configuration helper
export const auth = {
  jwtSecret: env.JWT_SECRET,
  sessionCookieName: env.SESSION_COOKIE_NAME,
  sessionMaxAge: env.SESSION_MAX_AGE,
  otp: {
    expiryMinutes: env.OTP_EXPIRY_MINUTES,
    length: env.OTP_LENGTH,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
} as const;

// Email configuration helper
export const email = {
  mailgun: {
    apiKey: env.MAILGUN_API_KEY,
    domain: env.MAILGUN_DOMAIN,
    fromEmail: env.MAILGUN_FROM_EMAIL,
    fromName: env.MAILGUN_FROM_NAME,
    webhookSigningKey: env.MAILGUN_WEBHOOK_SIGNING_KEY,
  },
} as const;

// Payment configuration helper
export const payment = {
  midtrans: {
    serverKey: env.MIDTRANS_SERVER_KEY,
    clientKey: env.MIDTRANS_CLIENT_KEY,
    isProduction: env.MIDTRANS_IS_PRODUCTION,
    webhookSecret: env.MIDTRANS_WEBHOOK_SECRET,
  },
} as const;
