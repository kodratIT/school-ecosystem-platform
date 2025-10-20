/**
 * Custom Auth Implementation
 * Using @repo/database-identity instead of Better Auth database adapter
 * This gives us full control over our database schema
 */

import { getSupabaseClient } from '@repo/database-identity';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'default-secret-change-this'
);

export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string | null;
  };
  expires: string;
}

/**
 * Create session token
 */
export async function createSessionToken(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify session token
 */
export async function verifySessionToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { userId: string };
  } catch {
    return null;
  }
}

/**
 * Get current session from cookies
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('idp-session')?.value;

  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  // Get user from database
  const supabase = getSupabaseClient();
  const { data: user } = await supabase
    .from('users')
    .select('id, email, name, avatar')
    .eq('id', payload.userId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single();

  if (!user) return null;

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    },
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Create session cookie
 */
export async function createSession(userId: string): Promise<void> {
  const token = await createSessionToken(userId);
  const cookieStore = await cookies();

  cookieStore.set('idp-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Delete session cookie
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('idp-session');
}

export const auth = {
  getSession,
  createSession,
  deleteSession,
};

export type Auth = typeof auth;
