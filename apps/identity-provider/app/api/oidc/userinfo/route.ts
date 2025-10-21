import { NextRequest, NextResponse } from 'next/server';
import { OIDCTokenManager } from '@repo/jwt';
import { getUserById, logUserInfoAccessed } from '@repo/database-identity';
import type { AccessTokenPayload } from '@repo/jwt';

const tokenManager = new OIDCTokenManager();

/**
 * GET /api/oidc/userinfo
 *
 * OpenID Connect UserInfo endpoint
 * Returns user claims based on access token and scope
 */
export async function GET(request: NextRequest) {
  return handleUserInfoRequest(request);
}

/**
 * POST /api/oidc/userinfo
 *
 * Alternative method for UserInfo request
 */
export async function POST(request: NextRequest) {
  return handleUserInfoRequest(request);
}

async function handleUserInfoRequest(request: NextRequest) {
  // Get IP and user agent for audit logging
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    // Extract access token from Authorization header
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          error: 'invalid_token',
          error_description: 'Missing or invalid Authorization header',
        },
        {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer error="invalid_token"',
          },
        }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Verify and decode access token
    let payload: AccessTokenPayload;
    try {
      payload = tokenManager.verifyToken<AccessTokenPayload>(accessToken);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        {
          error: 'invalid_token',
          error_description: 'Token verification failed',
        },
        {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer error="invalid_token"',
          },
        }
      );
    }

    // Get fresh user data from database
    const user = await getUserById(payload.sub);

    if (!user) {
      return NextResponse.json(
        {
          error: 'invalid_token',
          error_description: 'User not found',
        },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        {
          error: 'invalid_token',
          error_description: 'User is not active',
        },
        { status: 401 }
      );
    }

    // Build claims based on scope
    const scopes = payload.scope.split(' ');
    const claims = buildUserInfoClaims(user, scopes);

    // LOG: UserInfo accessed successfully
    await logUserInfoAccessed({
      user_id: user.id as string,
      client_id: payload.aud as string,
      grant_type: 'access_token',
      scopes,
      ip_address: ip,
      user_agent: userAgent,
    });

    return NextResponse.json(claims, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        Pragma: 'no-cache',
      },
    });
  } catch (error) {
    console.error('UserInfo endpoint error:', error);

    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Build UserInfo claims based on requested scopes
 */
function buildUserInfoClaims(user: Record<string, unknown>, scopes: string[]) {
  const claims: Record<string, unknown> = {
    // Always return sub (required)
    sub: user.id,
  };

  // Profile scope
  if (scopes.includes('profile')) {
    if (user.name) claims.name = user.name;
    if (user.given_name) claims.given_name = user.given_name;
    if (user.family_name) claims.family_name = user.family_name;
    if (user.nickname) claims.nickname = user.nickname;
    if (user.preferred_username)
      claims.preferred_username = user.preferred_username;
    if (user.avatar) claims.picture = user.avatar;
    if (user.website) claims.website = user.website;
    if (user.gender) claims.gender = user.gender;
    if (user.birth_date) claims.birthdate = user.birth_date;
    if (user.locale) claims.locale = user.locale;
    if (user.timezone) claims.zoneinfo = user.timezone;
    if (user.updated_at) {
      claims.updated_at = Math.floor(
        new Date(user.updated_at).getTime() / 1000
      );
    }
  }

  // Email scope
  if (scopes.includes('email')) {
    claims.email = user.email;
    claims.email_verified = user.email_verified || false;
  }

  // Phone scope
  if (scopes.includes('phone')) {
    if (user.phone) claims.phone_number = user.phone;
    if (user.phone_verified !== undefined) {
      claims.phone_number_verified = user.phone_verified;
    }
  }

  // Custom school scope
  if (scopes.includes('school')) {
    if (user.role) claims.role = user.role;
    if (user.school_id) claims.school_id = user.school_id;

    // Include school details if available (from JOIN)
    if (user.school_name) claims.school_name = user.school_name;
    if (user.department) claims.department = user.department;
  }

  // Remove undefined/null values
  Object.keys(claims).forEach((key) => {
    if (claims[key] === undefined || claims[key] === null) {
      delete claims[key];
    }
  });

  return claims;
}
