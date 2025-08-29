// Mock environment module before any imports
jest.mock('@/lib/env', () => ({
  env: {
    MONGODB_URI: 'mongodb://localhost:27017/test',
    JWT_SECRET: 'this-is-a-very-long-secret-key-for-testing-purposes-only',
    NODE_ENV: 'test',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    MAILGUN_API_KEY: 'test-api-key',
    MAILGUN_DOMAIN: 'test.domain.com',
    MAILGUN_FROM_EMAIL: 'test@domain.com',
  },
}));

// Mock mongoose models before any imports
jest.mock('@/lib/db/models/User', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/lib/db/mongoose', () => ({
  connectDB: jest.fn(),
}));

jest.mock('@/lib/mail/mailgun', () => ({
  sendOTPEmail: jest.fn(),
}));

import { NextRequest } from 'next/server';
import { POST } from './route';
import { createOTP, clearOTP, getOTPData } from '@/lib/auth/otp';
import { clearRateLimit } from '@/lib/rate-limit';
import { sendOTPEmail } from '@/lib/mail/mailgun';
import User from '@/lib/db/models/User';
import { connectDB } from '@/lib/db/mongoose';

const mockSendOTPEmail = sendOTPEmail as jest.MockedFunction<
  typeof sendOTPEmail
>;
const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>;
const mockUser = User as jest.MockedClass<typeof User>;

describe('/api/auth/request-otp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearOTP('test@example.com');
    clearRateLimit('ip:127.0.0.1');
    clearRateLimit('email:test@example.com');
  });

  const createMockRequest = (
    body: Record<string, unknown>,
    headers: Record<string, string> = {}
  ) => {
    return new NextRequest('http://localhost:3000/api/auth/request-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
        ...headers,
      },
      body: JSON.stringify(body),
    });
  };

  describe('POST /api/auth/request-otp', () => {
    it('should successfully send OTP for valid email', async () => {
      // Mock dependencies
      mockConnectDB.mockResolvedValue({} as typeof import('mongoose'));
      (mockUser.findOne as jest.Mock).mockResolvedValue(null);
      (mockUser.prototype.save as jest.Mock).mockResolvedValue(undefined);
      mockSendOTPEmail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id',
      });

      const request = createMockRequest({ email: 'test@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Verification code sent successfully');
      expect(data.email).toBe('test@example.com');
      expect(data.expiresIn).toBe('10 minutes');

      // Verify OTP was created
      const otpData = getOTPData('test@example.com');
      expect(otpData).toBeTruthy();
      expect(otpData?.email).toBe('test@example.com');
      expect(otpData?.otp).toHaveLength(6);

      // Verify email was sent
      expect(mockSendOTPEmail).toHaveBeenCalledWith(
        'test@example.com',
        otpData?.otp
      );
    });

    it('should return 400 for invalid email', async () => {
      const request = createMockRequest({ email: 'invalid-email' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
      expect(data.details).toBeDefined();
    });

    it('should return 400 for missing email', async () => {
      const request = createMockRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
    });

    it('should return 409 if user already verified', async () => {
      // Mock existing verified user
      mockConnectDB.mockResolvedValue({} as typeof import('mongoose'));
      (mockUser.findOne as jest.Mock).mockResolvedValue({
        email: 'test@example.com',
        isEmailVerified: true,
      } as Record<string, unknown>);

      const request = createMockRequest({ email: 'test@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Email already verified');
      expect(data.message).toContain('already verified');
    });

    it('should return 409 if OTP already pending', async () => {
      // Create a pending OTP
      createOTP('test@example.com');

      const request = createMockRequest({ email: 'test@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('OTP already sent');
      expect(data.message).toContain('already sent');
    });

    it('should return 429 when rate limited by IP', async () => {
      // Exceed rate limit by making multiple requests
      for (let i = 0; i < 3; i++) {
        const request = createMockRequest({ email: `test${i}@example.com` });
        await POST(request);
      }

      const request = createMockRequest({ email: 'test4@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded');
      expect(data.message).toContain('Rate limit exceeded');
    });

    it('should return 429 when rate limited by email', async () => {
      // Exceed rate limit for specific email
      for (let i = 0; i < 3; i++) {
        const request = createMockRequest({ email: 'test@example.com' });
        await POST(request);
      }

      const request = createMockRequest({ email: 'test@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded for this email');
    });

    it('should return 500 when email sending fails', async () => {
      // Mock dependencies
      mockConnectDB.mockResolvedValue({} as typeof import('mongoose'));
      (mockUser.findOne as jest.Mock).mockResolvedValue(null);
      (mockUser.prototype.save as jest.Mock).mockResolvedValue(undefined);
      mockSendOTPEmail.mockResolvedValue({
        success: false,
        error: 'Mailgun API error',
      });

      const request = createMockRequest({ email: 'test@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to send verification email');
      expect(data.message).toContain('try again later');
    });

    it('should normalize email address', async () => {
      // Mock dependencies
      mockConnectDB.mockResolvedValue({} as typeof import('mongoose'));
      (mockUser.findOne as jest.Mock).mockResolvedValue(null);
      (mockUser.prototype.save as jest.Mock).mockResolvedValue(undefined);
      mockSendOTPEmail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id',
      });

      const request = createMockRequest({ email: 'TEST@EXAMPLE.COM' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.email).toBe('test@example.com');

      // Verify OTP was created with normalized email
      const otpData = getOTPData('test@example.com');
      expect(otpData).toBeTruthy();
      expect(otpData?.email).toBe('test@example.com');
    });

    it('should update existing unverified user', async () => {
      // Mock existing unverified user
      const existingUser = {
        email: 'test@example.com',
        isEmailVerified: false,
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockConnectDB.mockResolvedValue({} as typeof import('mongoose'));
      (mockUser.findOne as jest.Mock).mockResolvedValue(
        existingUser as Record<string, unknown>
      );
      mockSendOTPEmail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id',
      });

      const request = createMockRequest({ email: 'test@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(existingUser.save).toHaveBeenCalled();
    });

    it('should include rate limit headers in response', async () => {
      // Mock dependencies
      mockConnectDB.mockResolvedValue({} as typeof import('mongoose'));
      (mockUser.findOne as jest.Mock).mockResolvedValue(null);
      (mockUser.prototype.save as jest.Mock).mockResolvedValue(undefined);
      mockSendOTPEmail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id',
      });

      const request = createMockRequest({ email: 'test@example.com' });
      const response = await POST(request);

      expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
    });

    it('should handle database connection errors', async () => {
      mockConnectDB.mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest({ email: 'test@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
