import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getUserByEmail,
  createResetToken,
  countRecentResetRequestsByIP,
  countRecentResetRequests,
} from '@repo/database-identity';
import { logAudit } from '@repo/database-identity';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email address',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const clientIp = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    // Rate limiting - IP based (3 requests per hour)
    const ipRateLimit = checkRateLimit({
      identifier: `forgot-password:ip:${clientIp}`,
      limit: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!ipRateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many password reset requests. Please try again later.',
          retryAfter: Math.ceil((ipRateLimit.reset - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    // Rate limiting - Email based (1 request per 5 minutes)
    const emailRateLimit = checkRateLimit({
      identifier: `forgot-password:email:${email.toLowerCase()}`,
      limit: 1,
      windowMs: 5 * 60 * 1000, // 5 minutes
    });

    if (!emailRateLimit.success) {
      // Don't reveal that email was rate limited (security)
      return NextResponse.json({
        success: true,
        message: 'If the email exists, a reset link has been sent.',
      });
    }

    // Find user by email
    const user = await getUserByEmail(email);

    if (!user) {
      // Don't reveal that email doesn't exist (security)
      // Log attempt for monitoring
      await logAudit({
        action: 'password_reset_request',
        resource: 'password_reset',
        resource_id: null,
        user_id: null,
        school_id: null,
        ip_address: clientIp,
        user_agent: userAgent,
        details: {
          email,
          reason: 'email_not_found',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'If the email exists, a reset link has been sent.',
      });
    }

    // Check database rate limits (additional layer)
    const dbIpCount = await countRecentResetRequestsByIP(clientIp, 60);
    if (dbIpCount >= 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many password reset requests. Please try again later.',
        },
        { status: 429 }
      );
    }

    const dbUserCount = await countRecentResetRequests(user.id, 5);
    if (dbUserCount >= 1) {
      // Don't reveal rate limit (security)
      return NextResponse.json({
        success: true,
        message: 'If the email exists, a reset link has been sent.',
      });
    }

    // Create reset token
    const token = await createResetToken({
      userId: user.id,
      expiresInMinutes: 60, // 1 hour
      ipAddress: clientIp,
      userAgent,
    });

    // Log successful request
    await logAudit({
      action: 'password_reset_request',
      resource: 'password_reset',
      resource_id: token.id,
      user_id: user.id,
      school_id: user.school_id,
      ip_address: clientIp,
      user_agent: userAgent,
      details: {
        email: user.email,
        token_id: token.id,
        expires_at: token.expires_at,
      },
    });

    // Send password reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token.token}`;

    const { sendPasswordResetEmail } = await import('@/lib/email/send-email');
    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    return NextResponse.json({
      success: true,
      message: 'If the email exists, a reset link has been sent.',
      // Include URL in development for testing
      ...(process.env.NODE_ENV === 'development' && {
        dev: { resetUrl, tokenId: token.id },
      }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while processing your request.',
      },
      { status: 500 }
    );
  }
}
