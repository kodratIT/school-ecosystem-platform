import { NextRequest, NextResponse } from 'next/server';
import { validateToken, getTokenWithUser } from '@repo/database-identity';

/**
 * Verify reset token validity
 * Used by frontend to check token before showing reset form
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Token is required',
        },
        { status: 400 }
      );
    }

    // Validate token
    const validation = await validateToken(token);

    if (!validation.valid) {
      return NextResponse.json({
        valid: false,
        reason: validation.reason,
      });
    }

    // Get token with user info for display
    const tokenWithUser = await getTokenWithUser(token);

    if (!tokenWithUser || !tokenWithUser.user) {
      return NextResponse.json({
        valid: false,
        reason: 'user_not_found',
      });
    }

    // Mask email for privacy (show first 2 chars and domain)
    const email = tokenWithUser.user.email;
    const [localPart, domain] = email.split('@');
    const maskedEmail =
      localPart.length > 2
        ? `${localPart.slice(0, 2)}${'*'.repeat(localPart.length - 2)}@${domain}`
        : `${localPart[0]}*@${domain}`;

    return NextResponse.json({
      valid: true,
      email: maskedEmail,
      expiresAt: validation.token?.expires_at,
    });
  } catch (error) {
    console.error('Verify reset token error:', error);
    return NextResponse.json(
      {
        valid: false,
        error: 'An error occurred while verifying the token.',
      },
      { status: 500 }
    );
  }
}
