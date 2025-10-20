import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
  database: {
    provider: 'postgres',
    url: process.env.IDENTITY_DB_URL!,
    // Use custom table names to match our existing schema
    schema: {
      user: 'users',
      session: 'user_sessions',
      account: 'oauth_accounts',
      verification: 'verifications',
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Will enable after email service setup
    minPasswordLength: 8,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
      enabled: !!(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ),
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  advanced: {
    cookiePrefix: 'idp',
    generateId: () => crypto.randomUUID(),
  },

  plugins: [nextCookies()],
});

export type Auth = typeof auth;
