import { env } from '../env';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface MailgunResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email using Mailgun API
 */
export const sendEmail = async (
  options: EmailOptions
): Promise<MailgunResponse> => {
  try {
    const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL } = env;

    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN || !MAILGUN_FROM_EMAIL) {
      throw new Error('Mailgun configuration missing');
    }

    const formData = new FormData();
    formData.append('from', MAILGUN_FROM_EMAIL);
    formData.append('to', options.to);
    formData.append('subject', options.subject);
    formData.append('html', options.html);

    if (options.text) {
      formData.append('text', options.text);
    }

    const response = await fetch(
      `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mailgun API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    return {
      success: true,
      messageId: result.id,
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Send OTP email
 */
export const sendOTPEmail = async (
  email: string,
  otp: string
): Promise<MailgunResponse> => {
  const subject = 'Your SeatFinder Verification Code';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Code</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 4px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SeatFinder</h1>
          <p>Email Verification</p>
        </div>
        <div class="content">
          <h2>Your Verification Code</h2>
          <p>Hello!</p>
          <p>You've requested to verify your email address for SeatFinder. Use the verification code below to complete your registration:</p>
          
          <div class="otp-code">${otp}</div>
          
          <div class="warning">
            <strong>Important:</strong>
            <ul>
              <li>This code will expire in 10 minutes</li>
              <li>Never share this code with anyone</li>
              <li>If you didn't request this code, please ignore this email</li>
            </ul>
          </div>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>The SeatFinder Team</p>
        </div>
        <div class="footer">
          <p>This email was sent to ${email}</p>
          <p>&copy; 2024 SeatFinder. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
SeatFinder - Email Verification

Your verification code is: ${otp}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
The SeatFinder Team
  `;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
};

/**
 * Send welcome email after successful verification
 */
export const sendWelcomeEmail = async (
  email: string
): Promise<MailgunResponse> => {
  const subject = 'Welcome to SeatFinder!';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to SeatFinder</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .cta { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to SeatFinder!</h1>
          <p>Your email has been verified successfully</p>
        </div>
        <div class="content">
          <h2>You're all set!</h2>
          <p>Hello!</p>
          <p>Your email address has been successfully verified. You can now access all features of SeatFinder:</p>
          
          <ul>
            <li>Create and manage events</li>
            <li>Upload guest lists via CSV</li>
            <li>Generate QR codes for check-ins</li>
            <li>Track attendance and analytics</li>
          </ul>
          
          <p style="text-align: center;">
            <a href="${env.NEXT_PUBLIC_APP_URL}/dashboard" class="cta">Go to Dashboard</a>
          </p>
          
          <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
          
          <p>Best regards,<br>The SeatFinder Team</p>
        </div>
        <div class="footer">
          <p>This email was sent to ${email}</p>
          <p>&copy; 2024 SeatFinder. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to SeatFinder!

Your email has been verified successfully. You can now access all features of SeatFinder.

Visit your dashboard: ${env.NEXT_PUBLIC_APP_URL}/dashboard

Best regards,
The SeatFinder Team
  `;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
};

/**
 * Test email configuration
 */
export const testEmailConfig = async (): Promise<MailgunResponse> => {
  const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL } = env;

  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN || !MAILGUN_FROM_EMAIL) {
    return {
      success: false,
      error: 'Missing Mailgun configuration',
    };
  }

  try {
    // Test API key by making a simple request
    const response = await fetch(
      `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/events`,
      {
        headers: {
          Authorization: `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Mailgun API test failed: ${response.status}`);
    }

    return {
      success: true,
      messageId: 'test-success',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
