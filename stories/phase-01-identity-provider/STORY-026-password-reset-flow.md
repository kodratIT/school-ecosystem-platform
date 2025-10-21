# STORY-026: Password Reset Flow

**Epic**: Phase 1 - Identity Provider  
**Priority**: P0 (CRITICAL - Production Blocker)  
**Story Points**: 2  
**Estimated Duration**: 2 days  
**Dependencies**: STORY-015 (Better Auth)

---

## 📋 User Story

**As a** registered user  
**I want** to reset my password if I forget it  
**So that** I can regain access to my account without contacting support

---

## 🎯 Acceptance Criteria

### AC1: Forgot Password Request
- [ ] User can access `/forgot-password` page
- [ ] User enters email address
- [ ] System validates email format
- [ ] System checks if email exists in database
- [ ] Success message shown even if email not found (security)
- [ ] Rate limiting: max 3 requests per hour per IP
- [ ] Rate limiting: max 1 request per 5 minutes per email

### AC2: Password Reset Email
- [ ] Email sent with reset link
- [ ] Link contains secure token (UUID v4)
- [ ] Token expires after 1 hour
- [ ] Token is single-use only
- [ ] Email template is professional and branded
- [ ] Email includes expiration time
- [ ] Email includes security note about not sharing

### AC3: Reset Password Page
- [ ] User can access `/reset-password?token={token}` page
- [ ] System validates token exists
- [ ] System checks token not expired
- [ ] System checks token not already used
- [ ] User enters new password
- [ ] Password validation (min 8 chars, mix of chars)
- [ ] User confirms new password
- [ ] Passwords must match

### AC4: Password Update
- [ ] Old password is replaced
- [ ] Password is hashed before storage
- [ ] User sessions are invalidated (force re-login)
- [ ] Success notification shown
- [ ] Confirmation email sent
- [ ] User redirected to login page

### AC5: Security & Audit
- [ ] Audit log created for password reset request
- [ ] Audit log created for password reset completion
- [ ] Failed attempts logged
- [ ] Token stored securely in database
- [ ] Token deleted after use
- [ ] IP address logged with request

---

## 🔧 Technical Implementation

### Database Schema

#### New Table: password_reset_tokens

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token) WHERE used_at IS NULL;
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Auto-cleanup expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_tokens
  WHERE expires_at < now() OR used_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Run cleanup daily
-- Note: Setup in cron or scheduled job
```

---

### API Endpoints

#### 1. POST /api/auth/forgot-password

**Request:**
```typescript
{
  email: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "If the email exists, a reset link has been sent.";
}
```

**Logic:**
1. Validate email format
2. Check rate limiting (IP + email)
3. Find user by email
4. If user exists:
   - Invalidate old reset tokens for user
   - Create new token (expires in 1 hour)
   - Send email with reset link
5. Return success regardless (security)
6. Log audit event

**Rate Limiting:**
- 3 requests per hour per IP
- 1 request per 5 minutes per email

---

#### 2. POST /api/auth/reset-password

**Request:**
```typescript
{
  token: string;
  password: string;
  confirmPassword: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Password reset successful. Please login.";
}
```

**Logic:**
1. Validate token format (UUID)
2. Find token in database
3. Check token not expired
4. Check token not used
5. Validate password strength
6. Check passwords match
7. Hash new password
8. Update user password
9. Mark token as used
10. Invalidate all user sessions
11. Send confirmation email
12. Log audit event

---

#### 3. GET /api/auth/verify-reset-token

**Request:**
```typescript
?token={uuid}
```

**Response:**
```typescript
{
  valid: boolean;
  email?: string; // Partially masked
  expiresAt?: string;
}
```

**Logic:**
1. Validate token
2. Check expiration
3. Check not used
4. Return validity status
5. Return masked email (for UX)

---

### Email Templates

#### Forgot Password Email

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2563eb;">Reset Your Password</h1>
    
    <p>Hello,</p>
    
    <p>You requested to reset your password for your Ekosistem Sekolah account.</p>
    
    <p>Click the button below to reset your password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{resetUrl}}" 
         style="display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Reset Password
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
      Or copy and paste this link into your browser:<br>
      <a href="{{resetUrl}}">{{resetUrl}}</a>
    </p>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>Important:</strong>
      </p>
      <ul style="margin: 8px 0; padding-left: 20px; font-size: 14px;">
        <li>This link expires in <strong>1 hour</strong></li>
        <li>This link can only be used once</li>
        <li>If you didn't request this, please ignore this email</li>
        <li>Never share this link with anyone</li>
      </ul>
    </div>
    
    <p style="color: #666; font-size: 14px;">
      If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; text-align: center;">
      Ekosistem Sekolah - Identity Provider<br>
      This is an automated email, please do not reply.
    </p>
  </div>
</body>
</html>
```

#### Password Reset Confirmation Email

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #10b981;">Password Reset Successful</h1>
    
    <p>Hello,</p>
    
    <p>Your password has been successfully reset for your Ekosistem Sekolah account.</p>
    
    <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 12px; margin: 20px 0;">
      <p style="margin: 0;">
        <strong>✓ Your password was changed on {{resetDate}}</strong>
      </p>
    </div>
    
    <p>You can now login with your new password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{loginUrl}}" 
         style="display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Go to Login
      </a>
    </div>
    
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>⚠ Didn't change your password?</strong>
      </p>
      <p style="margin: 8px 0 0 0; font-size: 14px;">
        If you didn't make this change, your account may be compromised. Please contact support immediately.
      </p>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; text-align: center;">
      Ekosistem Sekolah - Identity Provider<br>
      This is an automated email, please do not reply.
    </p>
  </div>
</body>
</html>
```

---

### UI Components

#### Forgot Password Form

**File**: `components/auth/forgot-password-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate
      schema.parse({ email });

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setSuccess(true);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Check Your Email
        </h3>
        <p className="text-green-800 mb-4">
          If an account exists for {email}, we've sent password reset instructions.
        </p>
        <p className="text-sm text-green-700">
          Please check your email and follow the instructions. The link will expire in 1 hour.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your email"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>

      <p className="text-sm text-gray-600 text-center">
        Remember your password?{' '}
        <a href="/login" className="text-blue-600 hover:underline">
          Back to Login
        </a>
      </p>
    </form>
  );
}
```

#### Reset Password Form

**File**: `components/auth/reset-password-form.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link');
      setValidating(false);
      return;
    }

    // Verify token
    fetch(`/api/auth/verify-reset-token?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setTokenValid(true);
          setEmail(data.email);
        } else {
          setError('This reset link is invalid or has expired');
        }
      })
      .catch(() => {
        setError('Failed to verify reset link');
      })
      .finally(() => {
        setValidating(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate
      schema.parse({ password, confirmPassword });

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return <div className="text-center">Verifying reset link...</div>;
  }

  if (!tokenValid) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Invalid Reset Link
        </h3>
        <p className="text-red-800 mb-4">{error}</p>
        <a
          href="/forgot-password"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Request New Link
        </a>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Password Reset Successful!
        </h3>
        <p className="text-green-800">
          Your password has been changed. Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800">
          Resetting password for: <strong>{email}</strong>
        </p>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          New Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Re-enter password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Resetting Password...' : 'Reset Password'}
      </button>
    </form>
  );
}
```

---

## 📝 Tasks

### Task 1: Database Migration (2 hours)
- [ ] Create migration file
- [ ] Add password_reset_tokens table
- [ ] Add indexes
- [ ] Add cleanup function
- [ ] Test migration

### Task 2: API Endpoints (4 hours)
- [ ] Implement POST /api/auth/forgot-password
- [ ] Implement POST /api/auth/reset-password
- [ ] Implement GET /api/auth/verify-reset-token
- [ ] Add rate limiting
- [ ] Add validation
- [ ] Test endpoints

### Task 3: Email Integration (2 hours)
- [ ] Setup email service (Resend/SendGrid)
- [ ] Create email templates
- [ ] Implement email sending
- [ ] Test email delivery

### Task 4: UI Components (3 hours)
- [ ] Update forgot-password form
- [ ] Create reset-password page
- [ ] Add error handling
- [ ] Add success states
- [ ] Test user flow

### Task 5: Testing & Audit (3 hours)
- [ ] Unit tests for APIs
- [ ] Integration tests
- [ ] Security audit
- [ ] Rate limiting tests
- [ ] Token expiration tests

### Task 6: Documentation (1 hour)
- [ ] API documentation
- [ ] User guide
- [ ] Email template guide
- [ ] Security notes

**Total**: 15 hours (~2 days)

---

## 🔒 Security Considerations

1. **Token Security**:
   - Use UUID v4 (cryptographically secure)
   - Store token hash in database (optional)
   - Single-use tokens
   - Short expiration (1 hour)

2. **Rate Limiting**:
   - Prevent email bombing
   - Prevent brute force
   - IP-based limits
   - Email-based limits

3. **Information Disclosure**:
   - Never confirm if email exists
   - Generic success messages
   - Masked email in verification

4. **Audit Trail**:
   - Log all password reset requests
   - Log successful resets
   - Log failed attempts
   - Include IP and user agent

5. **Session Invalidation**:
   - Force re-login after reset
   - Invalidate all sessions
   - Prevent session fixation

---

## ✅ Definition of Done

- [ ] Database migration applied
- [ ] All API endpoints implemented
- [ ] Email integration working
- [ ] UI components created
- [ ] Rate limiting functional
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Deployed to staging
- [ ] User testing passed

---

## 📚 References

- [OWASP Password Reset Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
- [Better Auth Documentation](https://www.better-auth.com/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

---

**Status**: 📝 Ready for Implementation  
**Assigned To**: TBD  
**Sprint**: Phase 1.5
