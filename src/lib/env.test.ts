import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Environment Configuration', () => {
  // Store original environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to ensure fresh import
    jest.resetModules();
    // Create a copy of process.env
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('should validate environment with minimal required variables', () => {
    // Set minimal required environment variables
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    process.env.JWT_SECRET =
      'this-is-a-very-long-secret-key-for-testing-purposes';

    // Import env module after setting environment variables
    const { env } = await import('./env');

    expect(env.MONGODB_URI).toBe('mongodb://localhost:27017/test');
    expect(env.JWT_SECRET).toBe(
      'this-is-a-very-long-secret-key-for-testing-purposes'
    );
    expect(env.NODE_ENV).toBe('test'); // Jest sets NODE_ENV to 'test'
  });

  it('should apply default values for optional variables', async () => {
    // Set minimal required environment variables
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    process.env.JWT_SECRET =
      'this-is-a-very-long-secret-key-for-testing-purposes';

    const { env } = await import('./env');

    // Check default values
    expect(env.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000');
    expect(env.SESSION_COOKIE_NAME).toBe('seatfinder-session');
    expect(env.OTP_EXPIRY_MINUTES).toBe(10);
    expect(env.FEATURE_PAYMENT_ENABLED).toBe(true);
  });

  it('should parse numeric environment variables correctly', async () => {
    // Clear all environment variables first
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('FEATURE_') || key.startsWith('OTP_')) {
        delete process.env[key];
      }
    });

    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    process.env.JWT_SECRET =
      'this-is-a-very-long-secret-key-for-testing-purposes';
    process.env.OTP_EXPIRY_MINUTES = '15';
    process.env.FEATURE_PAYMENT_ENABLED = 'false';
    process.env.NODE_ENV = 'development'; // Explicitly set to avoid test environment

    const { env } = await import('./env');

    expect(env.OTP_EXPIRY_MINUTES).toBe(15);
    expect(typeof env.FEATURE_PAYMENT_ENABLED).toBe('boolean');
  });

  it('should throw error when required variables are missing', async () => {
    // Remove required variables
    delete process.env.MONGODB_URI;
    delete process.env.JWT_SECRET;

    await expect(async () => {
      await import('./env');
    }).rejects.toThrow('Environment validation failed');
  });

  it('should throw error when JWT_SECRET is too short', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    process.env.JWT_SECRET = 'too-short'; // Less than 32 characters

    await expect(async () => {
      await import('./env');
    }).rejects.toThrow('Environment validation failed');
  });

  it('should validate URL format for NEXT_PUBLIC_APP_URL', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    process.env.JWT_SECRET =
      'this-is-a-very-long-secret-key-for-testing-purposes';
    process.env.NEXT_PUBLIC_APP_URL = 'not-a-valid-url';

    await expect(async () => {
      await import('./env');
    }).rejects.toThrow('Environment validation failed');
  });

  it('should validate email format for MAILGUN_FROM_EMAIL', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    process.env.JWT_SECRET =
      'this-is-a-very-long-secret-key-for-testing-purposes';
    process.env.MAILGUN_FROM_EMAIL = 'not-an-email';

    await expect(async () => {
      await import('./env');
    }).rejects.toThrow('Environment validation failed');
  });

  it('should export helper objects with correct structure', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    process.env.JWT_SECRET =
      'this-is-a-very-long-secret-key-for-testing-purposes';

    const { features, auth, database } = await import('./env');

    // Check features structure
    expect(features).toHaveProperty('payment');
    expect(features).toHaveProperty('email');
    expect(features).toHaveProperty('analytics');
    expect(features).toHaveProperty('rateLimiting');

    // Check auth structure
    expect(auth).toHaveProperty('jwtSecret');
    expect(auth).toHaveProperty('sessionCookieName');
    expect(auth).toHaveProperty('otp');
    expect(auth.otp).toHaveProperty('expiryMinutes');
    expect(auth.otp).toHaveProperty('length');

    // Check database structure
    expect(database).toHaveProperty('uri');
  });

  it('should export environment type checking helpers', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    process.env.JWT_SECRET =
      'this-is-a-very-long-secret-key-for-testing-purposes';
    process.env.NODE_ENV = 'production';

    const { isDevelopment, isProduction, isTest } = await import('./env');

    expect(isDevelopment).toBe(false);
    expect(isProduction).toBe(true);
    expect(isTest).toBe(false);
  });
});
