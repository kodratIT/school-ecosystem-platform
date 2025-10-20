import { auth } from './auth';
import { cache } from 'react';

/**
 * Get current session (server-side)
 * Cached per request
 */
export const getCurrentSession = cache(async () => {
  return await auth.getSession();
});

/**
 * Get current user (server-side)
 */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user || null;
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth() {
  const session = await getCurrentSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return !!session;
}
