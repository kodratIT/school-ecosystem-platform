# STORY-027: PKCE Support (Proof Key for Code Exchange)

**Epic**: Phase 1 - Identity Provider  
**Priority**: P1 (Important - Security Enhancement)  
**Story Points**: 2  
**Estimated Duration**: 2 days  
**Dependencies**: STORY-021 (SSO), STORY-025 (OAuth Clients)

---

## 📋 User Story

**As a** SPA or mobile app developer  
**I want** PKCE support in the authorization flow  
**So that** my public clients are protected from authorization code interception attacks

---

## 🎯 Background

### What is PKCE?

PKCE (Proof Key for Code Exchange - pronounced "pixy") is an OAuth 2.0 security extension designed to prevent authorization code interception attacks, particularly for:
- Single Page Applications (SPAs)
- Mobile applications
- Any public client that cannot securely store client secrets

### How PKCE Works

```
1. Client generates random code_verifier (43-128 chars)
2. Client creates code_challenge = BASE64URL(SHA256(code_verifier))
3. Client sends code_challenge to /authorize endpoint
4. IdP stores code_challenge with authorization code
5. Client exchanges code + code_verifier to /token endpoint
6. IdP verifies SHA256(code_verifier) === stored code_challenge
7. If valid, issue tokens
```

### Why PKCE is Important

**Without PKCE:**
```
Attacker intercepts authorization code
→ Can exchange it for tokens (public clients have no secret)
→ Gains unauthorized access
```

**With PKCE:**
```
Attacker intercepts authorization code
→ Cannot exchange without code_verifier
→ code_verifier never transmitted (only hash)
→ Attack prevented ✅
```

---

## 🎯 Acceptance Criteria

### AC1: Authorization Endpoint Enhancement

- [ ] Accept `code_challenge` parameter (optional)
- [ ] Accept `code_challenge_method` parameter (optional, default: S256)
- [ ] Validate code_challenge format (base64url, 43-128 chars)
- [ ] Support methods: "S256" (required), "plain" (optional)
- [ ] Store code_challenge with authorization code
- [ ] Store code_challenge_method with authorization code
- [ ] Return error if invalid code_challenge format
- [ ] Return error if unsupported code_challenge_method

### AC2: Token Endpoint Enhancement

- [ ] Accept `code_verifier` parameter (conditional)
- [ ] Validate code_verifier format (base64url, 43-128 chars)
- [ ] Retrieve stored code_challenge and method
- [ ] Verify code_challenge based on method:
  - S256: SHA256(code_verifier) === code_challenge
  - plain: code_verifier === code_challenge
- [ ] Return error if verification fails
- [ ] Return error if code_verifier missing when PKCE used
- [ ] Delete code_challenge after successful verification

### AC3: OAuth Client PKCE Enforcement

- [ ] Use existing `require_pkce` flag in oauth_clients table
- [ ] If `require_pkce = true`:
  - MUST include code_challenge in authorize
  - MUST include code_verifier in token
  - Return error if missing
- [ ] If `require_pkce = false`:
  - PKCE is optional
  - Support both PKCE and non-PKCE flows
- [ ] Recommend PKCE for all public clients (is_confidential = false)

### AC4: Security Validations

- [ ] Code challenge must be base64url encoded
- [ ] Code challenge length: 43-128 characters
- [ ] Code verifier must be base64url encoded
- [ ] Code verifier length: 43-128 characters
- [ ] Code challenge and verifier must match
- [ ] Code challenge used only once (tied to auth code)
- [ ] Timing attack protection (constant-time comparison)

### AC5: Client Configuration

- [ ] OAuth Clients UI shows PKCE requirement
- [ ] Developers can enable/disable PKCE per client
- [ ] Warning shown for public clients without PKCE
- [ ] Documentation explains PKCE setup

---

## 🔧 Technical Implementation

### Database Schema Enhancement

#### Update: authorization_codes table

```sql
-- Add PKCE columns to authorization_codes table
ALTER TABLE authorization_codes
ADD COLUMN code_challenge TEXT,
ADD COLUMN code_challenge_method VARCHAR(10) DEFAULT 'S256';

-- Index for lookups
CREATE INDEX idx_authorization_codes_code ON authorization_codes(code);

-- Validation constraint
ALTER TABLE authorization_codes
ADD CONSTRAINT chk_code_challenge_method 
CHECK (code_challenge_method IN ('S256', 'plain'));
```

**Note**: If authorization_codes table doesn't exist yet, create it:

```sql
CREATE TABLE authorization_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  client_id TEXT NOT NULL REFERENCES oauth_clients(client_id),
  user_id UUID NOT NULL REFERENCES users(id),
  redirect_uri TEXT NOT NULL,
  scope TEXT[] DEFAULT '{}',
  code_challenge TEXT,
  code_challenge_method VARCHAR(10) DEFAULT 'S256',
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_authorization_codes_code ON authorization_codes(code);
CREATE INDEX idx_authorization_codes_client_id ON authorization_codes(client_id);
CREATE INDEX idx_authorization_codes_expires_at ON authorization_codes(expires_at);

-- Auto-cleanup expired codes (run daily)
CREATE OR REPLACE FUNCTION cleanup_expired_authorization_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM authorization_codes
  WHERE expires_at < now() OR used_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;
```

---

### PKCE Utility Functions

**File**: `packages/jwt/src/pkce.ts` (or create new @repo/oauth package)

```typescript
import crypto from 'crypto';

/**
 * PKCE Utility Functions
 * RFC 7636: Proof Key for Code Exchange
 */

// Base64URL encoding (no padding, URL-safe)
export function base64urlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Base64URL decoding
export function base64urlDecode(str: string): Buffer {
  // Add padding
  const padding = '='.repeat((4 - (str.length % 4)) % 4);
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
  return Buffer.from(base64, 'base64');
}

/**
 * Validate PKCE code_verifier format
 * Must be 43-128 characters, base64url encoded
 */
export function validateCodeVerifier(verifier: string): boolean {
  if (!verifier) return false;
  
  // Length check (43-128 chars)
  if (verifier.length < 43 || verifier.length > 128) {
    return false;
  }
  
  // Base64URL format check (only A-Z, a-z, 0-9, -, _)
  const base64urlRegex = /^[A-Za-z0-9_-]+$/;
  return base64urlRegex.test(verifier);
}

/**
 * Validate PKCE code_challenge format
 * Must be 43-128 characters, base64url encoded
 */
export function validateCodeChallenge(challenge: string): boolean {
  if (!challenge) return false;
  
  // Length check (43-128 chars)
  if (challenge.length < 43 || challenge.length > 128) {
    return false;
  }
  
  // Base64URL format check
  const base64urlRegex = /^[A-Za-z0-9_-]+$/;
  return base64urlRegex.test(challenge);
}

/**
 * Generate code_challenge from code_verifier
 * Method: S256 (SHA256) or plain
 */
export function generateCodeChallenge(
  verifier: string,
  method: 'S256' | 'plain' = 'S256'
): string {
  if (method === 'plain') {
    return verifier;
  }
  
  // S256: BASE64URL(SHA256(ASCII(code_verifier)))
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64urlEncode(hash);
}

/**
 * Verify code_verifier against code_challenge
 * Uses constant-time comparison to prevent timing attacks
 */
export function verifyCodeChallenge(
  verifier: string,
  challenge: string,
  method: 'S256' | 'plain' = 'S256'
): boolean {
  if (!verifier || !challenge) return false;
  
  // Validate formats
  if (!validateCodeVerifier(verifier)) return false;
  if (!validateCodeChallenge(challenge)) return false;
  
  // Generate expected challenge from verifier
  const expectedChallenge = generateCodeChallenge(verifier, method);
  
  // Constant-time comparison (prevent timing attacks)
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedChallenge),
      Buffer.from(challenge)
    );
  } catch {
    // Length mismatch (timingSafeEqual requires same length)
    return false;
  }
}

/**
 * Generate random code_verifier (for client-side use)
 * Returns 43-character base64url string (32 bytes of entropy)
 */
export function generateCodeVerifier(): string {
  const buffer = crypto.randomBytes(32);
  return base64urlEncode(buffer);
}

/**
 * Validate PKCE method
 */
export function validateCodeChallengeMethod(
  method: string
): method is 'S256' | 'plain' {
  return method === 'S256' || method === 'plain';
}
```

---

### API Endpoint Updates

#### 1. Update: /api/sso/authorize

**File**: `apps/identity-provider/app/api/sso/authorize/route.ts`

Add PKCE parameter handling:

```typescript
import { 
  validateCodeChallenge, 
  validateCodeChallengeMethod 
} from '@repo/jwt/pkce';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Existing parameters
  const client_id = searchParams.get('client_id');
  const redirect_uri = searchParams.get('redirect_uri');
  const response_type = searchParams.get('response_type');
  const scope = searchParams.get('scope');
  const state = searchParams.get('state');
  
  // PKCE parameters (NEW)
  const code_challenge = searchParams.get('code_challenge');
  const code_challenge_method = searchParams.get('code_challenge_method') || 'S256';
  
  // ... existing validations ...
  
  // Validate PKCE if provided
  if (code_challenge) {
    if (!validateCodeChallenge(code_challenge)) {
      return redirectWithError(
        redirect_uri,
        'invalid_request',
        'Invalid code_challenge format',
        state
      );
    }
    
    if (!validateCodeChallengeMethod(code_challenge_method)) {
      return redirectWithError(
        redirect_uri,
        'invalid_request',
        'Unsupported code_challenge_method. Use S256 or plain',
        state
      );
    }
  }
  
  // Get OAuth client
  const client = await getOAuthClientByClientId(client_id);
  
  if (!client) {
    return redirectWithError(
      redirect_uri,
      'invalid_client',
      'Client not found',
      state
    );
  }
  
  // Check if PKCE is required for this client
  if (client.require_pkce && !code_challenge) {
    return redirectWithError(
      redirect_uri,
      'invalid_request',
      'code_challenge required for this client',
      state
    );
  }
  
  // Warn if public client not using PKCE (security best practice)
  if (!client.is_confidential && !code_challenge) {
    console.warn(
      `⚠️ Public client ${client_id} not using PKCE - security risk!`
    );
  }
  
  // ... show login/consent page ...
  
  // After user approves, generate authorization code
  const authCode = crypto.randomUUID();
  
  // Store authorization code with PKCE data
  await supabase.from('authorization_codes').insert({
    code: authCode,
    client_id,
    user_id: user.id,
    redirect_uri,
    scope: scope?.split(' ') || [],
    code_challenge, // Store PKCE challenge
    code_challenge_method, // Store method
    expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });
  
  // Redirect back with authorization code
  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set('code', authCode);
  if (state) redirectUrl.searchParams.set('state', state);
  
  return NextResponse.redirect(redirectUrl.toString());
}
```

---

#### 2. Update: /api/sso/token

**File**: `apps/identity-provider/app/api/sso/token/route.ts`

Add PKCE verification:

```typescript
import { 
  verifyCodeChallenge, 
  validateCodeVerifier 
} from '@repo/jwt/pkce';
import { logAudit } from '@repo/database-identity';

export async function POST(request: Request) {
  const body = await request.json();
  
  const {
    grant_type,
    code,
    redirect_uri,
    client_id,
    client_secret,
    code_verifier, // PKCE parameter (NEW)
  } = body;
  
  // ... existing validations ...
  
  if (grant_type === 'authorization_code') {
    // Retrieve authorization code from database
    const { data: authCodeData, error } = await supabase
      .from('authorization_codes')
      .select('*')
      .eq('code', code)
      .single();
    
    if (error || !authCodeData) {
      return NextResponse.json(
        { 
          error: 'invalid_grant', 
          error_description: 'Invalid authorization code' 
        },
        { status: 400 }
      );
    }
    
    // Check if code is expired
    if (new Date(authCodeData.expires_at) < new Date()) {
      return NextResponse.json(
        { 
          error: 'invalid_grant', 
          error_description: 'Authorization code expired' 
        },
        { status: 400 }
      );
    }
    
    // Check if already used
    if (authCodeData.used_at) {
      return NextResponse.json(
        { 
          error: 'invalid_grant', 
          error_description: 'Authorization code already used' 
        },
        { status: 400 }
      );
    }
    
    // PKCE Verification (NEW)
    if (authCodeData.code_challenge) {
      // PKCE was used in authorization - verifier is required
      if (!code_verifier) {
        return NextResponse.json(
          { 
            error: 'invalid_request', 
            error_description: 'code_verifier required' 
          },
          { status: 400 }
        );
      }
      
      // Validate verifier format
      if (!validateCodeVerifier(code_verifier)) {
        return NextResponse.json(
          { 
            error: 'invalid_request', 
            error_description: 'Invalid code_verifier format' 
          },
          { status: 400 }
        );
      }
      
      // Verify code_verifier matches code_challenge
      const isValid = verifyCodeChallenge(
        code_verifier,
        authCodeData.code_challenge,
        authCodeData.code_challenge_method || 'S256'
      );
      
      if (!isValid) {
        // Log failed verification attempt
        await logAudit({
          user_id: authCodeData.user_id,
          action: 'token.pkce_verification_failed',
          resource_type: 'oauth_token',
          resource_id: authCodeData.code,
          details: {
            client_id,
            reason: 'code_verifier does not match code_challenge',
          },
        });
        
        return NextResponse.json(
          { 
            error: 'invalid_grant', 
            error_description: 'Invalid code_verifier' 
          },
          { status: 400 }
        );
      }
      
      // PKCE verification successful
      console.log(`✅ PKCE verification successful for client ${client_id}`);
    }
    
    // Mark authorization code as used
    await supabase
      .from('authorization_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('code', code);
    
    // ... continue with token generation ...
    
    // Generate tokens
    const tokens = await generateTokens(
      authCodeData.user_id,
      client_id,
      authCodeData.scope
    );
    
    return NextResponse.json(tokens);
  }
  
  // ... handle other grant types ...
}
```

---

### OAuth Clients UI Enhancement

**File**: `components/oauth-clients/client-form.tsx`

Add PKCE information:

```typescript
// In the security section of the form, add:

<div className="space-y-4">
  <h3 className="font-semibold text-gray-900">Security Settings</h3>
  
  {/* Existing fields: is_confidential, allowed_grant_types, etc. */}
  
  {/* PKCE Requirement */}
  <div className="flex items-start gap-3">
    <input
      type="checkbox"
      id="require_pkce"
      checked={formData.require_pkce}
      onChange={(e) => setFormData({ 
        ...formData, 
        require_pkce: e.target.checked 
      })}
      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    />
    <div className="flex-1">
      <label htmlFor="require_pkce" className="font-medium text-gray-700 cursor-pointer">
        Require PKCE (Proof Key for Code Exchange)
      </label>
      <p className="text-sm text-gray-600 mt-1">
        Enforce PKCE for enhanced security. Recommended for all public clients (SPAs, mobile apps).
      </p>
      
      {/* Warning for public clients without PKCE */}
      {!formData.is_confidential && !formData.require_pkce && (
        <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Security Warning:</strong> This is a public client without PKCE requirement. 
            Your authorization codes are vulnerable to interception attacks. 
            We strongly recommend enabling PKCE.
          </p>
        </div>
      )}
      
      {/* Info for confidential clients */}
      {formData.is_confidential && formData.require_pkce && (
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Note:</strong> PKCE is optional for confidential clients (server-side apps) 
            since they use client_secret. However, it provides an additional layer of security.
          </p>
        </div>
      )}
    </div>
  </div>
</div>
```

---

### Client-Side PKCE Implementation Example

**For SPA developers (documentation):**

```typescript
/**
 * PKCE Helper Functions for Client-Side (Browser/SPA)
 * 
 * Usage:
 * 1. Call startAuthFlow() to initiate OAuth with PKCE
 * 2. User is redirected to IdP
 * 3. After approval, IdP redirects back to your callback URL
 * 4. Call handleCallback() to exchange code for tokens
 */

/**
 * Generate random string for code_verifier
 */
function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values)
    .map(x => charset[x % charset.length])
    .join('');
}

/**
 * Generate code_verifier (43-128 characters)
 */
function generateCodeVerifier(): string {
  return generateRandomString(64); // 64 chars (good entropy)
}

/**
 * Generate code_challenge from code_verifier using S256 method
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  // SHA-256 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  
  // Base64URL encode
  return base64urlEncode(new Uint8Array(hash));
}

function base64urlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Example: Start OAuth flow with PKCE
 */
async function startAuthFlow() {
  // 1. Generate code_verifier
  const codeVerifier = generateCodeVerifier();
  console.log('Generated code_verifier:', codeVerifier);
  
  // 2. Generate code_challenge
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  console.log('Generated code_challenge:', codeChallenge);
  
  // 3. Store code_verifier in sessionStorage (need it later)
  sessionStorage.setItem('pkce_code_verifier', codeVerifier);
  
  // 4. Generate state for CSRF protection
  const state = generateRandomString(32);
  sessionStorage.setItem('oauth_state', state);
  
  // 5. Build authorization URL
  const authUrl = new URL('https://idp.example.com/api/sso/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', 'your_client_id');
  authUrl.searchParams.set('redirect_uri', 'https://your-app.com/callback');
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  
  // 6. Redirect to IdP
  console.log('Redirecting to:', authUrl.toString());
  window.location.href = authUrl.toString();
}

/**
 * Example: Handle callback and exchange code for tokens
 */
async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  
  // Verify state (CSRF protection)
  const savedState = sessionStorage.getItem('oauth_state');
  if (state !== savedState) {
    throw new Error('Invalid state parameter - possible CSRF attack');
  }
  
  // Retrieve stored code_verifier
  const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
  if (!codeVerifier) {
    throw new Error('code_verifier not found in storage');
  }
  
  // Clean up
  sessionStorage.removeItem('pkce_code_verifier');
  sessionStorage.removeItem('oauth_state');
  
  // Exchange code for tokens
  const response = await fetch('https://idp.example.com/api/sso/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'https://your-app.com/callback',
      client_id: 'your_client_id',
      code_verifier: codeVerifier, // Include code_verifier for PKCE
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token exchange failed: ${error.error_description}`);
  }
  
  const tokens = await response.json();
  console.log('Tokens received:', tokens);
  
  // Store tokens
  localStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('id_token', tokens.id_token);
  if (tokens.refresh_token) {
    localStorage.setItem('refresh_token', tokens.refresh_token);
  }
  
  // Redirect to app
  window.location.href = '/dashboard';
}
```

---

## 📝 Tasks

### Task 1: Database Migration (1 hour)
- [ ] Create migration file: `20250121_add_pkce_to_authorization_codes.sql`
- [ ] Add code_challenge columns to authorization_codes
- [ ] Add constraints
- [ ] Test migration locally
- [ ] Apply to staging

### Task 2: PKCE Utility Functions (2 hours)
- [ ] Create `packages/jwt/src/pkce.ts` file
- [ ] Implement validation functions
- [ ] Implement challenge generation
- [ ] Implement verification with timing-safe compare
- [ ] Write unit tests (validation, generation, verification)
- [ ] Test all edge cases

### Task 3: Update Authorization Endpoint (2 hours)
- [ ] Import PKCE utilities
- [ ] Add code_challenge parameter handling
- [ ] Add code_challenge_method parameter
- [ ] Validate PKCE parameters
- [ ] Store with authorization code
- [ ] Enforce for clients with require_pkce
- [ ] Test with Postman/curl

### Task 4: Update Token Endpoint (3 hours)
- [ ] Import PKCE utilities
- [ ] Add code_verifier parameter handling
- [ ] Retrieve stored code_challenge
- [ ] Verify code_verifier
- [ ] Handle verification failures
- [ ] Add audit logging for failures
- [ ] Test success and failure cases

### Task 5: OAuth Clients UI (2 hours)
- [ ] Add PKCE checkbox to client form
- [ ] Add security warning for public clients
- [ ] Update client display to show PKCE status
- [ ] Add PKCE badge in clients table
- [ ] Test UI updates

### Task 6: Documentation (2 hours)
- [ ] API documentation for PKCE parameters
- [ ] Client-side implementation guide (JavaScript)
- [ ] Code examples (React, Vue, plain JS)
- [ ] Migration guide for existing clients
- [ ] Security best practices document

### Task 7: Testing (3 hours)
- [ ] Unit tests for PKCE utilities (10+ test cases)
- [ ] Integration tests for auth flow with PKCE
- [ ] Test PKCE enforcement for required clients
- [ ] Test error cases (invalid verifier, missing params)
- [ ] Security testing (timing attacks)
- [ ] End-to-end test with real SPA

**Total**: 15 hours (~2 days)

---

## 🔒 Security Considerations

1. **Timing Attack Protection**:
   - Use `crypto.timingSafeEqual()` for comparison
   - Prevent timing-based code_verifier guessing
   - Constant-time operations

2. **Method Support**:
   - S256 (SHA-256) is REQUIRED and RECOMMENDED
   - Plain method is OPTIONAL (less secure, avoid if possible)
   - Always prefer S256 for all clients

3. **Validation**:
   - Strict format validation (base64url only)
   - Length requirements (43-128 chars = 32-96 bytes entropy)
   - No padding characters allowed
   - Character set: A-Z, a-z, 0-9, -, _

4. **Storage**:
   - Store code_challenge with authorization code
   - Delete after successful verification
   - No need to hash (already hashed via SHA-256)
   - Tie to specific auth code (one-time use)

5. **Enforcement**:
   - Optional by default (backward compatible)
   - Required for clients with require_pkce flag
   - Strongly recommended for all public clients
   - Warn in logs if public client not using PKCE

6. **Error Handling**:
   - Generic error messages (don't reveal verification details)
   - Log failed attempts for security monitoring
   - Rate limit token endpoint
   - Audit trail for all verifications

---

## ✅ Definition of Done

- [ ] Database migration applied to all environments
- [ ] PKCE utility functions implemented and tested
- [ ] Authorization endpoint accepts and validates PKCE parameters
- [ ] Token endpoint verifies code_verifier
- [ ] OAuth Clients UI shows PKCE configuration
- [ ] All unit tests passing (>90% coverage)
- [ ] Integration tests passing
- [ ] Security audit completed
- [ ] Documentation published
- [ ] Client-side examples provided (JavaScript, React)
- [ ] Code reviewed and approved
- [ ] Deployed to staging
- [ ] Tested with real SPA client
- [ ] Production deployment plan approved

---

## 📚 References

- [RFC 7636 - PKCE Specification](https://tools.ietf.org/html/rfc7636)
- [OAuth 2.0 Security Best Current Practice](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
- [PKCE Playground](https://tonyxu-io.github.io/pkce-generator/)
- [Auth0 PKCE Guide](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-proof-key-for-code-exchange-pkce)
- [OWASP OAuth Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth_Security_Cheat_Sheet.html)

---

## 📊 Testing Checklist

### Unit Tests
- [ ] validateCodeVerifier() - valid inputs
- [ ] validateCodeVerifier() - invalid lengths
- [ ] validateCodeVerifier() - invalid characters
- [ ] validateCodeChallenge() - valid inputs
- [ ] validateCodeChallenge() - invalid formats
- [ ] generateCodeChallenge() - S256 method
- [ ] generateCodeChallenge() - plain method
- [ ] verifyCodeChallenge() - matching verifier/challenge
- [ ] verifyCodeChallenge() - non-matching pairs
- [ ] verifyCodeChallenge() - timing safety

### Integration Tests
- [ ] Auth flow with PKCE (happy path)
- [ ] Auth flow without PKCE (legacy support)
- [ ] PKCE required but not provided (error)
- [ ] Invalid code_challenge format (error)
- [ ] Invalid code_verifier format (error)
- [ ] code_verifier doesn't match challenge (error)
- [ ] code_verifier missing when required (error)
- [ ] Public client without PKCE (warning logged)

### Security Tests
- [ ] Timing attack resistance
- [ ] Code challenge reuse prevention
- [ ] Authorization code replay attack
- [ ] Invalid method handling

---

**Status**: 📝 Ready for Implementation  
**Assigned To**: TBD  
**Sprint**: Phase 1.5 (Security)
