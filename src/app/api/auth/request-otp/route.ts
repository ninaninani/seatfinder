import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createOTP, hasPendingOTP } from '@/lib/auth/otp';
import {
  rateLimitByIP,
  rateLimitByEmail,
  RATE_LIMIT_CONFIGS,
} from '@/lib/rate-limit';
import { sendOTPEmail } from '@/lib/mail/mailgun';
import User from '@/lib/db/models/User';
import { connectDB } from '@/lib/db/mongoose';

// Request validation schema
const requestOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = requestOTPSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Rate limiting by IP
    const ipRateLimit = rateLimitByIP(request, RATE_LIMIT_CONFIGS.OTP_REQUEST);
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: ipRateLimit.message,
          resetTime: ipRateLimit.resetTime.toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': ipRateLimit.remaining.toString(),
            'X-RateLimit-Reset': ipRateLimit.resetTime.toISOString(),
          },
        }
      );
    }

    // Rate limiting by email
    const emailRateLimit = rateLimitByEmail(
      request,
      normalizedEmail,
      RATE_LIMIT_CONFIGS.OTP_REQUEST
    );
    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded for this email',
          message: emailRateLimit.message,
          resetTime: emailRateLimit.resetTime.toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': emailRateLimit.remaining.toString(),
            'X-RateLimit-Reset': emailRateLimit.resetTime.toISOString(),
          },
        }
      );
    }

    // Check if there's already a pending OTP for this email
    if (hasPendingOTP(normalizedEmail)) {
      return NextResponse.json(
        {
          error: 'OTP already sent',
          message:
            'Please wait for the current OTP to expire or check your email',
        },
        { status: 409 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists and is verified
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser?.isEmailVerified) {
      return NextResponse.json(
        {
          error: 'Email already verified',
          message:
            'This email address is already verified. Please sign in instead.',
        },
        { status: 409 }
      );
    }

    // Generate OTP
    const otp = createOTP(normalizedEmail);

    // Send OTP email
    const emailResult = await sendOTPEmail(normalizedEmail, otp);

    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error);
      return NextResponse.json(
        {
          error: 'Failed to send verification email',
          message:
            'Please try again later or contact support if the problem persists.',
        },
        { status: 500 }
      );
    }

    // Create or update user record
    if (existingUser) {
      // Update existing unverified user
      existingUser.email = normalizedEmail; // Ensure email is normalized
      await existingUser.save();
    } else {
      // Create new user
      const newUser = new User({
        email: normalizedEmail,
        isEmailVerified: false,
      });
      await newUser.save();
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Verification code sent successfully',
        email: normalizedEmail,
        expiresIn: '10 minutes',
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': Math.min(
            ipRateLimit.remaining,
            emailRateLimit.remaining
          ).toString(),
          'X-RateLimit-Reset': new Date(
            Math.max(
              ipRateLimit.resetTime.getTime(),
              emailRateLimit.resetTime.getTime()
            )
          ).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('Request OTP error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
