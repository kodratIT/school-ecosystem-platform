import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/auth-client';

/**
 * GET /api/sso/logout
 * Logout from IdP and all Service Providers
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const returnTo = searchParams.get('returnTo');

  // Logout from IdP
  await signOut();

  // TODO: Implement logout propagation to all SPs
  // For now, just redirect back

  if (returnTo) {
    return NextResponse.redirect(returnTo);
  }

  return NextResponse.redirect(new URL('/login', request.url));
}
