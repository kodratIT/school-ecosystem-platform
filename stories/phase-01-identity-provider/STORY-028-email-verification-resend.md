# STORY-028: Email Verification Resend

**Epic**: Phase 1 - Identity Provider  
**Priority**: P1 (Important - UX Enhancement)  
**Story Points**: 1  
**Estimated Duration**: 1 day  
**Dependencies**: STORY-015 (Better Auth), STORY-018 (Auth Pages)

---

## 📋 User Story

**As a** newly registered user  
**I want** to resend my verification email if I didn't receive it  
**So that** I can verify my account without contacting support or re-registering

---

## 🎯 Background

**Current Problem:**
- Users receive verification email on signup
- If email is lost/spam/delayed, users are stuck
- TODO comment in code: `// TODO: Implement resend verification email API`
- Users must contact admin or create new account

**Solution:**
Implement resend functionality with rate limiting to prevent abuse.

---

## 🎯 Acceptance Criteria

### AC1: Resend API Endpoint
- [ ] User can request verification email resend
- [ ] Accepts email address or uses authenticated session
- [ ] Validates email exists in system
- [ ] Checks if email already verified
- [ ] Generates new verification token
- [ ] Invalidates old verification tokens
- [ ] Sends email with new token
- [ ] Returns success (generic message for security)

### AC2: Rate Limiting
- [ ] Maximum 1 resend per 5 minutes per email
- [ ] Maximum 3 resends per hour per IP address
- [ ] Clear error messages when rate limited
- [ ] Rate limit tracked in database or cache
- [ ] Show remaining time until next resend allowed

### AC3: UI Integration
- [ ] "Resend verification email" button on verify page
- [ ] Button shows loading state
- [ ] Button disables after click (show countdown)
- [ ] Success notification shown
- [ ] Error handling with user-friendly messages
- [ ] Countdown timer shows when can resend again

### AC4: Security
- [ ] Generic response (don't reveal if email exists)
- [ ] Token is cryptographically secure (UUID)
- [ ] Token expires (24-48 hours)
- [ ] Single-use tokens
- [ ] Audit log for resend attempts
- [ ] IP address logging

---

## 🔧 Technical Implementation

### Database Schema

#### Update: verification_tokens table (if exists) or email_verifications

```sql
-- If table doesn't exist, create it
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '48 hours'),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_email_verifications_token ON email_verifications(token) WHERE verified_at IS NULL;
CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);

-- Track resend attempts for rate limiting
CREATE TABLE IF NOT EXISTS email_resend_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_email_resend_attempts_email ON email_resend_attempts(email, attempted_at);
CREATE INDEX idx_email_resend_attempts_ip ON email_resend_attempts(ip_address, attempted_at);

-- Cleanup old attempts (run daily)
CREATE OR REPLACE FUNCTION cleanup_old_email_resend_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM email_resend_attempts
  WHERE attempted_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql;
```

---

### API Endpoint

**File**: `apps/identity-provider/app/api/auth/resend-verification/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@repo/database-identity';
import { sendVerificationEmail } from '@/lib/email';
import { logAudit } from '@repo/database-identity';

// Rate limiting helper
async function checkRateLimit(email: string, ip: string): Promise<{
  allowed: boolean;
  retryAfter?: number;
  reason?: string;
}> {
  const supabase = getSupabaseClient();
  const now = new Date();

  // Check email-based rate limit (1 per 5 minutes)
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const { data: emailAttempts } = await supabase
    .from('email_resend_attempts')
    .select('*')
    .eq('email', email)
    .gte('attempted_at', fiveMinutesAgo.toISOString());

  if (emailAttempts && emailAttempts.length > 0) {
    const lastAttempt = new Date(emailAttempts[0].attempted_at);
    const retryAfter = Math.ceil((lastAttempt.getTime() + 5 * 60 * 1000 - now.getTime()) / 1000);
    return {
      allowed: false,
      retryAfter,
      reason: 'Too many requests for this email. Please wait before trying again.',
    };
  }

  // Check IP-based rate limit (3 per hour)
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const { data: ipAttempts } = await supabase
    .from('email_resend_attempts')
    .select('*')
    .eq('ip_address', ip)
    .gte('attempted_at', oneHourAgo.toISOString());

  if (ipAttempts && ipAttempts.length >= 3) {
    return {
      allowed: false,
      reason: 'Too many requests from this IP. Please try again later.',
    };
  }

  return { allowed: true };
}

// Record attempt
async function recordAttempt(email: string, ip: string) {
  const supabase = getSupabaseClient();
  await supabase.from('email_resend_attempts').insert({
    email,
    ip_address: ip,
  });
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  
  try {
    const body = await request.json();
    const { email } = body;

    // Get IP address
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check rate limiting
    const rateLimitCheck = await checkRateLimit(email.toLowerCase(), ip);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          error: rateLimitCheck.reason,
          retryAfter: rateLimitCheck.retryAfter,
        },
        { 
          status: 429,
          headers: rateLimitCheck.retryAfter 
            ? { 'Retry-After': rateLimitCheck.retryAfter.toString() }
            : undefined,
        }
      );
    }

    // Find user by email
    const { data: user } = await supabase
      .from('users')
      .select('id, email, email_verified')
      .eq('email', email.toLowerCase())
      .single();

    // Record attempt (regardless of whether email exists - security)
    await recordAttempt(email.toLowerCase(), ip);

    // If user exists and email not verified, send email
    if (user && !user.email_verified) {
      // Invalidate old verification tokens
      await supabase
        .from('email_verifications')
        .update({ expires_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('verified_at', null);

      // Create new verification token
      const { data: verification } = await supabase
        .from('email_verifications')
        .insert({
          user_id: user.id,
          email: user.email,
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
        })
        .select('token')
        .single();

      if (verification) {
        // Send verification email
        await sendVerificationEmail(user.email, verification.token);

        // Audit log
        await logAudit({
          user_id: user.id,
          action: 'email.verification_resent',
          resource_type: 'user',
          resource_id: user.id,
          details: { ip_address: ip },
        });
      }
    }

    // Generic response (don't reveal if email exists)
    return NextResponse.json({
      success: true,
      message: 'If the email exists and is not verified, a new verification link has been sent.',
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
```

---

### UI Component Update

**File**: `components/auth/verify-email-content.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Mail, Clock, CheckCircle } from 'lucide-react';

interface VerifyEmailContentProps {
  email: string;
}

export function VerifyEmailContent({ email }: VerifyEmailContentProps) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    setResending(true);
    setError(null);
    setResent(false);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.retryAfter) {
          setCountdown(data.retryAfter);
          throw new Error(`Please wait ${data.retryAfter} seconds before trying again`);
        }
        throw new Error(data.error || 'Failed to resend email');
      }

      setResent(true);
      setCountdown(300); // 5 minutes cooldown
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      {/* Email Icon */}
      <div className="flex justify-center mb-4">
        <div className="bg-blue-100 rounded-full p-4">
          <Mail className="w-12 h-12 text-blue-600" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Verify Your Email
      </h1>

      {/* Description */}
      <p className="text-center text-gray-600 mb-6">
        We've sent a verification link to:
      </p>
      <p className="text-center font-semibold text-gray-900 mb-6">
        {email}
      </p>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-900">
          <strong>Next steps:</strong>
        </p>
        <ol className="text-sm text-blue-800 mt-2 space-y-1 list-decimal list-inside">
          <li>Check your email inbox</li>
          <li>Click the verification link</li>
          <li>You'll be redirected to login</li>
        </ol>
      </div>

      {/* Success message */}
      {resent && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-900">
                Email Sent!
              </p>
              <p className="text-sm text-green-800">
                Please check your inbox for the new verification link.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Resend button */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-3">
          Didn't receive the email?
        </p>
        <button
          onClick={handleResend}
          disabled={resending || countdown > 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {resending ? (
            'Sending...'
          ) : countdown > 0 ? (
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Wait {countdown}s
            </span>
          ) : (
            'Resend Verification Email'
          )}
        </button>
      </div>

      {/* Help text */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Check your spam folder if you don't see the email.
          <br />
          Still having trouble? Contact support.
        </p>
      </div>
    </div>
  );
}
```

---

## 📝 Tasks

### Task 1: Database Migration (30 min)
- [ ] Create email_resend_attempts table
- [ ] Add indexes
- [ ] Add cleanup function
- [ ] Test migration

### Task 2: API Endpoint (2 hours)
- [ ] Create /api/auth/resend-verification endpoint
- [ ] Implement rate limiting logic
- [ ] Email sending integration
- [ ] Error handling
- [ ] Test endpoint

### Task 3: UI Component (2 hours)
- [ ] Update VerifyEmailContent component
- [ ] Add resend button
- [ ] Add countdown timer
- [ ] Add success/error states
- [ ] Test UI

### Task 4: Testing (2 hours)
- [ ] Unit tests for rate limiting
- [ ] Integration tests for API
- [ ] Test countdown timer
- [ ] Test error states
- [ ] Test with real email

### Task 5: Documentation (30 min)
- [ ] API documentation
- [ ] User guide
- [ ] Rate limiting explanation

**Total**: 7 hours (~1 day)

---

## 🔒 Security Considerations

1. **Rate Limiting**:
   - Prevent email bombing
   - IP + Email based limits
   - Clear error messages

2. **Information Disclosure**:
   - Generic success messages
   - Don't reveal if email exists
   - Same response time

3. **Token Security**:
   - UUID tokens (secure)
   - Invalidate old tokens
   - Time-based expiration

4. **Audit Trail**:
   - Log all resend attempts
   - Track IP addresses
   - Monitor for abuse

---

## ✅ Definition of Done

- [ ] Database tables created
- [ ] API endpoint implemented
- [ ] Rate limiting functional
- [ ] UI component updated
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Tested with real email
- [ ] Deployed to staging

---

**Status**: 📝 Ready for Implementation  
**Assigned To**: TBD  
**Sprint**: Phase 1.5
