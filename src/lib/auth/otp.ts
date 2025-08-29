import crypto from 'crypto';

export interface OTPData {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

// In-memory storage for OTPs (in production, use Redis or database)
const otpStore = new Map<string, OTPData>();

// OTP configuration
const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
  CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
};

// Clean up expired OTPs periodically
setInterval(() => {
  const now = new Date();
  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(email);
    }
  }
}, OTP_CONFIG.CLEANUP_INTERVAL);

/**
 * Generate a random 6-digit OTP
 */
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Create and store OTP for email
 */
export const createOTP = (email: string): string => {
  const otp = generateOTP();
  const expiresAt = new Date(
    Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000
  );

  const otpData: OTPData = {
    email: email.toLowerCase(),
    otp,
    expiresAt,
    attempts: 0,
    createdAt: new Date(),
  };

  otpStore.set(email.toLowerCase(), otpData);

  return otp;
};

/**
 * Validate OTP for email
 */
export const validateOTP = (
  email: string,
  otp: string
): { valid: boolean; message?: string } => {
  const emailKey = email.toLowerCase();
  const data = otpStore.get(emailKey);

  if (!data) {
    return { valid: false, message: 'OTP not found or expired' };
  }

  // Check if OTP is expired
  if (data.expiresAt < new Date()) {
    otpStore.delete(emailKey);
    return { valid: false, message: 'OTP has expired' };
  }

  // Check if max attempts exceeded
  if (data.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
    otpStore.delete(emailKey);
    return { valid: false, message: 'Maximum attempts exceeded' };
  }

  // Increment attempts
  data.attempts++;

  // Check if OTP matches
  if (data.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }

  // OTP is valid, remove it from store
  otpStore.delete(emailKey);

  return { valid: true };
};

/**
 * Get OTP data for email (for debugging/testing)
 */
export const getOTPData = (email: string): OTPData | null => {
  return otpStore.get(email.toLowerCase()) || null;
};

/**
 * Check if email has pending OTP
 */
export const hasPendingOTP = (email: string): boolean => {
  const data = otpStore.get(email.toLowerCase());
  if (!data) return false;

  // Remove expired OTPs
  if (data.expiresAt < new Date()) {
    otpStore.delete(email.toLowerCase());
    return false;
  }

  return true;
};

/**
 * Clear OTP for email
 */
export const clearOTP = (email: string): void => {
  otpStore.delete(email.toLowerCase());
};

/**
 * Get OTP statistics (for monitoring)
 */
export const getOTPStats = () => {
  const now = new Date();
  let active = 0;
  let expired = 0;

  for (const data of otpStore.values()) {
    if (data.expiresAt < now) {
      expired++;
    } else {
      active++;
    }
  }

  return {
    active,
    expired,
    total: otpStore.size,
  };
};
