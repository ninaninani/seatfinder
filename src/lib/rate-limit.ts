import { NextRequest } from 'next/server';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: Date;
}

// In-memory storage for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = new Date();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute

/**
 * Get client IP from request
 */
export const getClientIP = (req: NextRequest): string => {
  // Check for forwarded headers (common with proxies)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Check for real IP header
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to connection remote address
  return 'unknown';
};

/**
 * Generate rate limit key
 */
export const generateKey = (req: NextRequest, identifier: string): string => {
  const ip = getClientIP(req);
  return `${identifier}:${ip}`;
};

/**
 * Check rate limit for a request
 */
export const checkRateLimit = (
  req: NextRequest,
  config: RateLimitConfig,
  identifier: string
): RateLimitResult => {
  const key = config.keyGenerator
    ? config.keyGenerator(req)
    : generateKey(req, identifier);
  const now = new Date();

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired entry
    const resetTime = new Date(now.getTime() + config.windowMs);
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime,
    };
    rateLimitStore.set(key, newEntry);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      message: `Rate limit exceeded. Try again after ${entry.resetTime.toISOString()}`,
    };
  }

  // Increment count
  entry.count++;

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
};

/**
 * Rate limit by IP address
 */
export const rateLimitByIP = (
  _req: NextRequest,
  config: RateLimitConfig
): RateLimitResult => {
  return checkRateLimit(_req, config, 'ip');
};

/**
 * Rate limit by email address
 */
export const rateLimitByEmail = (
  _req: NextRequest,
  email: string,
  config: RateLimitConfig
): RateLimitResult => {
  const keyGenerator = () => `email:${email.toLowerCase()}`;
  return checkRateLimit(_req, { ...config, keyGenerator }, 'email');
};

/**
 * Rate limit by route
 */
export const rateLimitByRoute = (
  req: NextRequest,
  route: string,
  config: RateLimitConfig
): RateLimitResult => {
  const keyGenerator = (req: NextRequest) =>
    `route:${route}:${getClientIP(req)}`;
  return checkRateLimit(req, { ...config, keyGenerator }, 'route');
};

/**
 * Clear rate limit for a key
 */
export const clearRateLimit = (key: string): void => {
  rateLimitStore.delete(key);
};

/**
 * Get rate limit statistics
 */
export const getRateLimitStats = () => {
  const now = new Date();
  let active = 0;
  let expired = 0;

  for (const entry of rateLimitStore.values()) {
    if (entry.resetTime < now) {
      expired++;
    } else {
      active++;
    }
  }

  return {
    active,
    expired,
    total: rateLimitStore.size,
  };
};

// Predefined rate limit configurations
export const RATE_LIMIT_CONFIGS = {
  OTP_REQUEST: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 3, // 3 OTP requests per 5 minutes
  },
  OTP_VERIFY: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 5, // 5 verification attempts per 10 minutes
  },
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 login attempts per 15 minutes
  },
  API_GENERAL: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
} as const;
