# Identity Provider

Centralized authentication service for School Ecosystem using Better Auth.

## Features

- ✅ Email/Password authentication
- ✅ Google OAuth (configurable)
- ✅ Session management
- ✅ Protected routes
- ✅ Type-safe auth utilities

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required variables:
- `IDENTITY_DB_URL` - Supabase project URL
- `IDENTITY_DB_SERVICE_KEY` - Supabase service role key
- `AUTH_SECRET` - Generate with `openssl rand -hex 32`

### 3. Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

## Pages

- `/` - Home page
- `/login` - Sign in page
- `/register` - Sign up page
- `/dashboard` - Protected dashboard (requires auth)

## Authentication

### Email/Password

Users can register and login with email and password.

```typescript
import { signUp, signIn } from '@/lib/auth-client';

// Sign up
await signUp.email({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe',
});

// Sign in
await signIn.email({
  email: 'user@example.com',
  password: 'password123',
});
```

### Google OAuth (Optional)

To enable Google sign-in:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env.local`

### Protected Routes

Use auth utilities to protect server components:

```typescript
import { getCurrentUser, requireAuth } from '@/lib/auth-utils';

// Get current user (returns null if not authenticated)
const user = await getCurrentUser();

// Require authentication (throws if not authenticated)
const session = await requireAuth();
```

## API Routes

- `POST /api/auth/sign-in/email` - Email/password sign in
- `POST /api/auth/sign-up/email` - Email/password sign up
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session
- `GET /api/auth/callback/google` - Google OAuth callback

## Development

```bash
# Run dev server
pnpm dev

# Type check
pnpm typecheck

# Lint
pnpm lint

# Build
pnpm build
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: Better Auth 1.3
- **Database**: Supabase PostgreSQL (via @repo/database-identity)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Links

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Supabase Docs](https://supabase.com/docs)
