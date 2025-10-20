import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000',
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
