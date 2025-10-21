import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  validateToken,
  markTokenUsed,
  getUserById,
  updateUserPassword,
} from '@repo/database-identity';
import { logAudit } from '@repo/database-identity';
import { hashPassword } from '@repo/database-identity';
import { getClientIp } from '@/lib/rate-limit';

const resetPasswordSchema = z
  .object({
    token: z.string().uuid('Invalid token format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;
    const clientIp = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    // Validate token
    const tokenValidation = await validateToken(token);

    if (!tokenValidation.valid) {
      let errorMessage = 'Invalid or expired reset link';

      if (tokenValidation.reason === 'expired') {
        errorMessage = 'This reset link has expired. Please request a new one.';
      } else if (tokenValidation.reason === 'already_used') {
        errorMessage =
          'This reset link has already been used. Please request a new one.';
      }

      // Log failed attempt
      await logAudit({
        action: 'password_reset_failed',
        resource: 'password_reset',
        resource_id: tokenValidation.token?.id || null,
        user_id: tokenValidation.token?.user_id || null,
        school_id: null,
        ip_address: clientIp,
        user_agent: userAgent,
        details: {
          reason: tokenValidation.reason || 'invalid_token',
          token_id: tokenValidation.token?.id,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 400 }
      );
    }

    const resetToken = tokenValidation.token!;

    // Get user
    const user = await getUserById(resetToken.user_id);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    await updateUserPassword(user.id, hashedPassword);

    // Mark token as used
    await markTokenUsed(token);

    // Log successful password reset
    await logAudit({
      action: 'password_reset_success',
      resource: 'password_reset',
      resource_id: resetToken.id,
      user_id: user.id,
      school_id: user.school_id,
      ip_address: clientIp,
      user_agent: userAgent,
      details: {
        email: user.email,
        token_id: resetToken.id,
      },
    });

    // TODO: Send confirmation email (Task 4)
    // TODO: Invalidate all user sessions (security best practice)
    // This would require session management integration
    console.log('Password reset successful:', {
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      message:
        'Password reset successful. You can now login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while resetting your password.',
      },
      { status: 500 }
    );
  }
}
