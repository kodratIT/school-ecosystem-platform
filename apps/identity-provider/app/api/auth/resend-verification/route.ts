import { NextRequest, NextResponse } from 'next/server';
import {
  countRecentResendAttemptsByEmail,
  countRecentResendAttemptsByIP,
  recordEmailResendAttempt,
  invalidateUserEmailVerifications,
  createEmailVerification,
  logAudit,
} from '@repo/database-identity';
import { getSupabaseClient } from '@/lib/db';
import { sendEmail } from '@/lib/email/send-email';
import {
  EmailVerificationEmail,
  emailVerificationPlainText,
} from '@/lib/email/templates/email-verification';
import { renderToString } from 'react-dom/server';
import { z } from 'zod';

const resendSchema = z.object({
  email: z.string().email('Invalid email format'),
});

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * POST /api/auth/resend-verification
 *
 * Resend email verification link with rate limiting
 *
 * Rate Limits:
 * - 1 resend per 5 minutes per email address
 * - 3 resends per hour per IP address
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = resendSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.errors[0]?.message,
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const normalizedEmail = email.toLowerCase();
    const ipAddress = getClientIp(request);

    // ===================================
    // RATE LIMITING CHECKS
    // ===================================

    // Check email-based rate limit (1 per 5 minutes)
    const emailAttempts = await countRecentResendAttemptsByEmail(
      normalizedEmail,
      5
    );

    if (emailAttempts > 0) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message:
            'Please wait 5 minutes before requesting another verification email',
          retryAfter: 300, // 5 minutes in seconds
        },
        {
          status: 429,
          headers: {
            'Retry-After': '300',
          },
        }
      );
    }

    // Check IP-based rate limit (3 per hour)
    const ipAttempts = await countRecentResendAttemptsByIP(ipAddress, 60);

    if (ipAttempts >= 3) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message:
            'Too many verification requests from your location. Please try again later',
          retryAfter: 3600, // 1 hour in seconds
        },
        {
          status: 429,
          headers: {
            'Retry-After': '3600',
          },
        }
      );
    }

    // ===================================
    // RECORD ATTEMPT (ALWAYS - FOR SECURITY)
    // ===================================
    // Record attempt even if email doesn't exist
    // This prevents email enumeration attacks
    await recordEmailResendAttempt(normalizedEmail, ipAddress);

    // ===================================
    // CHECK USER & SEND EMAIL
    // ===================================

    const supabase = getSupabaseClient();
    const { data: user } = await supabase
      .from('users')
      .select('id, email, email_verified, name')
      .eq('email', normalizedEmail)
      .single();

    // If user exists and email not verified, send verification email
    if (user && !user.email_verified) {
      // Invalidate old verification tokens
      await invalidateUserEmailVerifications(user.id);

      // Create new verification token
      const verification = await createEmailVerification({
        userId: user.id,
        email: user.email,
        expiresInHours: 48,
      });

      // Build verification URL
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verification.token}`;

      // Render email template
      const html = renderToString(
        EmailVerificationEmail({
          verificationUrl,
          email: user.email,
        })
      );

      const text = emailVerificationPlainText({
        verificationUrl,
        email: user.email,
      });

      // Send email
      const emailResult = await sendEmail({
        to: user.email,
        subject: 'Verify your email address',
        html,
        text,
      });

      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error);
        // Don't reveal email send failure to user (security)
      }

      // Audit log
      await logAudit({
        user_id: user.id,
        action: 'email.verification_resent',
        resource_type: 'user',
        resource_id: user.id,
        details: {
          ip_address: ipAddress,
          email: normalizedEmail,
        },
      });
    }

    // ===================================
    // GENERIC RESPONSE (SECURITY)
    // ===================================
    // Always return same response whether email exists or not
    // This prevents email enumeration attacks
    return NextResponse.json({
      success: true,
      message:
        'If your email address is registered and not yet verified, a verification link has been sent',
    });
  } catch (error) {
    console.error('Resend verification error:', error);

    // Generic error response (don't leak internal details)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process your request. Please try again later',
      },
      { status: 500 }
    );
  }
}
