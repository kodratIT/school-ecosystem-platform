# OpenID Connect Migration Summary

## Executive Summary

Phase 1 telah diupdate dari **OAuth 2.0** ke **OpenID Connect (OIDC)** untuk compliance dengan industry standards.

### Key Changes

| Aspect | Before (OAuth 2.0) | After (OIDC) |
|--------|-------------------|--------------|
| **Protocol** | OAuth 2.0 + JWT | OpenID Connect 1.0 |
| **Stories** | 10 stories | **13 stories (+3)** |
| **Duration** | 3 weeks | **4 weeks (+1 week)** |
| **Tokens** | access_token + refresh_token | **id_token** + access_token + refresh_token |
| **Endpoints** | 2 (authorize, token) | **5** (authorize, token, userinfo, discovery, jwks) |
| **Token Signing** | HS256 (symmetric) | **RS256 (asymmetric)** |
| **Discovery** | None | **Auto-discovery** |
| **Standard Claims** | Custom | **OIDC standard claims** |

---

## What is OpenID Connect?

**Simple Answer:**
> OpenID Connect = OAuth 2.0 + Identity Layer

**Analogy:**
- **OAuth 2.0**: Seperti kartu akses hotel (access control)
- **OpenID Connect**: Kartu akses + KTP digital (identity + access control)

**Real Example:**
```
OAuth 2.0:
"App X boleh posting ke Twitter saya" → Authorization ✅

OpenID Connect:
"Login dengan Google" → Identity ✅ + Authorization ✅
```

---

## Why OpenID Connect?

### Problems with OAuth 2.0 Only

1. **No Standard Identity Token**
   ```json
   // OAuth 2.0: Custom claims in access token
   {
     "sub": "user-123",
     "email": "user@school.com",  // Custom
     "name": "Budi",              // Custom
     "role": "teacher"            // Custom
   }
   ```

2. **No Standard User Endpoint**
   - Setiap provider beda-beda
   - Tidak ada auto-discovery
   - Harus hardcode URLs

3. **Not Interoperable**
   - Tidak bisa integrate dengan external IdP
   - Tidak comply dengan standards
   - Susah untuk audit/compliance

### Benefits of OpenID Connect

1. **ID Token for Identity**
   ```json
   // Dedicated ID token
   {
     "sub": "user-123",
     "email": "user@school.com",  // STANDARD
     "name": "Budi Santoso",      // STANDARD
     "picture": "https://...",    // STANDARD
     "role": "teacher"            // Custom (still allowed)
   }
   ```

2. **Standard UserInfo Endpoint**
   ```
   GET /api/oidc/userinfo
   Authorization: Bearer <access_token>
   
   → Returns fresh user data
   ```

3. **Auto-Discovery**
   ```
   GET /.well-known/openid-configuration
   
   → Returns all endpoint URLs automatically
   → Clients can auto-configure
   ```

4. **Industry Standard**
   - Used by Google, Microsoft, Facebook
   - Can federate with external IdPs
   - Audit-friendly
   - Future-proof

---

## What Changes in Implementation?

### 1. Token Changes

#### Before (OAuth 2.0):
```json
{
  "access_token": "eyJ...",
  "refresh_token": "abc...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

Access token contains everything (identity + authorization).

#### After (OIDC):
```json
{
  "id_token": "eyJ...",        // NEW: For identity
  "access_token": "eyJ...",    // For authorization
  "refresh_token": "abc...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

**Separation of concerns:**
- **ID Token**: Who is the user? (identity)
- **Access Token**: What can user do? (authorization)

### 2. Endpoint Changes

#### Before:
```
/api/sso/authorize  → OAuth 2.0 authorization
/api/sso/token      → Get tokens
```

#### After:
```
/api/oidc/authorize                   → OIDC authorization
/api/oidc/token                       → Get tokens (with ID token)
/api/oidc/userinfo                    → NEW: Get user info
/api/oidc/logout                      → NEW: End session
/.well-known/openid-configuration     → NEW: Auto-discovery
/.well-known/jwks.json                → NEW: Public keys
```

### 3. JWT Signing Changes

#### Before:
```typescript
// HS256 (Symmetric key)
const token = jwt.sign(payload, SECRET_KEY, {
  algorithm: 'HS256'
});

// Problem: Same key for signing AND verification
// If Service Provider has the key, they can create fake tokens!
```

#### After:
```typescript
// RS256 (Asymmetric key pair)
const token = jwt.sign(payload, PRIVATE_KEY, {
  algorithm: 'RS256',
  keyid: 'key-1'
});

// Benefits:
// - Private key stays on IdP (signing)
// - Public key shared to Service Providers (verification)
// - Service Providers cannot create fake tokens
```

### 4. Scope Changes

#### Before:
```
scope=read:students write:grades
```
All custom scopes.

#### After:
```
scope=openid profile email school read:students
```

**Standard scopes:**
- `openid` - REQUIRED (triggers OIDC flow)
- `profile` - Returns name, picture, etc
- `email` - Returns email, email_verified
- `offline_access` - Returns refresh token

**Custom scopes:**
- `school` - Returns school-specific data
- `read:students` - Permission to read students
- `write:grades` - Permission to write grades

### 5. Claims Changes

#### Before (Custom):
```json
{
  "sub": "user-123",
  "email": "user@school.com",
  "name": "Budi",
  "role": "teacher"
}
```

#### After (Standard + Custom):
```json
{
  // Standard OIDC claims
  "sub": "user-123",
  "iss": "https://idp.school.com",
  "aud": "client-id",
  "exp": 1735516800,
  "iat": 1735513200,
  "auth_time": 1735513200,
  "nonce": "xyz789",
  
  // Standard profile claims
  "email": "user@school.com",
  "email_verified": true,
  "name": "Budi Santoso",
  "given_name": "Budi",
  "family_name": "Santoso",
  "picture": "https://...",
  "locale": "id_ID",
  
  // Custom claims
  "role": "teacher",
  "school_id": "school-456"
}
```

---

## Story Changes

### Modified Stories (2)

#### STORY-019: JWT Service → JWT Service + OIDC
**Added:**
- RS256 signing (asymmetric)
- RSA key pair generation
- JWKS endpoint support
- ID token generation
- Separate access token & ID token

**Duration:** 2 days → **4 days**

#### STORY-021: SSO → OIDC SSO
**Added:**
- Scope validation (must include 'openid')
- Nonce handling
- prompt parameter support
- max_age validation
- ID token in response

**Duration:** 3 days → **3 days** (same)

### New Stories (3)

#### STORY-022: OIDC Discovery Endpoint (NEW)
**Tasks:**
- Implement `/.well-known/openid-configuration`
- Implement `/.well-known/jwks.json`
- Return all OIDC configuration

**Duration:** **1 day**

#### STORY-023: OIDC UserInfo Endpoint (NEW)
**Tasks:**
- Implement `/api/oidc/userinfo`
- Support Bearer token authentication
- Return standard OIDC claims

**Duration:** **1 day**

#### STORY-024: OIDC Client SDK (NEW)
**Tasks:**
- Create `@repo/oidc-client` package
- Auto-discovery support
- Token validation helpers
- UserInfo request helpers

**Duration:** **2 days**

---

## Timeline Comparison

### Before (OAuth 2.0):
```
Week 1: Foundation (4 stories)
Week 2: RBAC & App (3 stories)
Week 3: SSO (3 stories)

Total: 3 weeks, 10 stories
```

### After (OIDC):
```
Week 1: Foundation (4 stories) - unchanged
Week 2: RBAC & App (3 stories) - unchanged
Week 3: OIDC Core (3 stories) - JWT + Discovery + UserInfo
Week 4: SSO & SDK (3 stories) - OIDC SSO + Client SDK + Dashboard

Total: 4 weeks, 13 stories
```

**Impact:** +1 week, +3 stories

---

## Technical Deep Dive

### OIDC Flow

```
1. User → Service Provider
   "Saya mau login"

2. Service Provider → IdP
   GET /api/oidc/authorize?
     client_id=ppdb-app&
     redirect_uri=https://ppdb.school.com/callback&
     response_type=code&
     scope=openid profile email&
     state=random-state&
     nonce=random-nonce

3. IdP → User
   "Silakan login"

4. User → IdP
   Email + Password

5. IdP validates & redirects
   → https://ppdb.school.com/callback?code=abc123&state=random-state

6. Service Provider → IdP
   POST /api/oidc/token
   {
     "grant_type": "authorization_code",
     "code": "abc123",
     "client_id": "ppdb-app",
     "client_secret": "secret-123",
     "redirect_uri": "https://ppdb.school.com/callback"
   }

7. IdP → Service Provider
   {
     "id_token": "eyJ...",      // Identity token
     "access_token": "eyJ...",  // Authorization token
     "refresh_token": "xyz...",
     "expires_in": 900
   }

8. Service Provider validates ID token
   - Verify signature using public key from JWKS
   - Verify issuer, audience, expiration
   - Verify nonce matches
   → User identity confirmed!

9. Service Provider creates session
   session.set('user', id_token_payload)

10. Optional: Get fresh user data
    GET /api/oidc/userinfo
    Authorization: Bearer <access_token>
```

### Token Verification

**ID Token Verification:**
```typescript
async function verifyIdToken(idToken: string) {
  // 1. Get public key from JWKS
  const jwks = await fetch('https://idp.school.com/.well-known/jwks.json');
  const publicKey = findKeyById(jwks, token.header.kid);
  
  // 2. Verify signature
  const payload = jwt.verify(idToken, publicKey, {
    algorithms: ['RS256']
  });
  
  // 3. Verify claims
  assert(payload.iss === 'https://idp.school.com');
  assert(payload.aud === 'ppdb-app');
  assert(payload.exp > Date.now() / 1000);
  assert(payload.nonce === storedNonce);
  
  return payload; // ✅ Valid!
}
```

**Why RS256 is Better:**
```
HS256 (Symmetric):
┌──────────────┐
│   IdP        │ Has: SECRET_KEY
│   SP         │ Has: SECRET_KEY  ← PROBLEM!
└──────────────┘
→ Service Provider can forge tokens!

RS256 (Asymmetric):
┌──────────────┐
│   IdP        │ Has: PRIVATE_KEY (signing)
│   SP         │ Has: PUBLIC_KEY (verify only)
└──────────────┘
→ Service Provider can only verify, not create! ✅
```

---

## Code Examples

### Service Provider Using OIDC Client

```typescript
// apps/ppdb/lib/auth.ts
import { OIDCClient } from '@repo/oidc-client';

const oidcClient = new OIDCClient({
  issuer: 'https://idp.school-ecosystem.com',
  clientId: 'ppdb-app',
  clientSecret: process.env.OIDC_CLIENT_SECRET!,
  redirectUri: 'https://ppdb.school.com/callback',
});

// Auto-discover endpoints
await oidcClient.discover();

// Login route
export async function login() {
  const authUrl = oidcClient.getAuthorizationUrl({
    scope: 'openid profile email school',
    state: generateState(),
    nonce: generateNonce(),
  });
  
  redirect(authUrl);
}

// Callback route
export async function callback(request: Request) {
  // Exchange code for tokens
  const tokens = await oidcClient.handleCallback(request.url);
  
  // Validate ID token
  const user = await oidcClient.validateIdToken(tokens.id_token);
  
  // Get fresh user info
  const userInfo = await oidcClient.getUserInfo(tokens.access_token);
  
  // Create session
  await createSession({
    user: userInfo,
    tokens: tokens,
  });
  
  redirect('/dashboard');
}

// Get user data in API route
export async function getCurrentUser(request: Request) {
  const session = await getSession(request);
  
  // Option 1: Use ID token (cached)
  return session.user;
  
  // Option 2: Get fresh data from UserInfo
  const userInfo = await oidcClient.getUserInfo(session.accessToken);
  return userInfo;
}
```

### Comparison: OAuth 2.0 vs OIDC

**OAuth 2.0 (Before):**
```typescript
// Login
const authUrl = `https://idp.school.com/api/sso/authorize?client_id=ppdb&redirect_uri=...`;

// Callback
const response = await fetch('https://idp.school.com/api/sso/token', {
  method: 'POST',
  body: JSON.stringify({ code, client_id, client_secret })
});

const { access_token } = await response.json();

// Decode JWT to get user (PROBLEM: Using access token for identity)
const user = jwt.decode(access_token);

// Create session
session.set('user', user);
```

**OIDC (After):**
```typescript
// Login (with OIDC scopes)
const authUrl = client.getAuthorizationUrl({
  scope: 'openid profile email',  // OIDC scopes
  nonce: 'random-nonce'           // Security
});

// Callback
const tokens = await client.handleCallback(callbackUrl);
// Returns: { id_token, access_token, refresh_token }

// Validate ID token (dedicated for identity)
const user = await client.validateIdToken(tokens.id_token);

// Get fresh user data
const userInfo = await client.getUserInfo(tokens.access_token);

// Create session
session.set('user', userInfo);
session.set('tokens', tokens);
```

---

## Migration Path

### Phase 1: Implement OIDC (4 weeks)
- Keep focus on OIDC from the start
- No need for backward compatibility yet
- All new Service Providers use OIDC

### Future: Add OAuth 2.0 Compatibility (Optional)
If needed, can add OAuth 2.0 endpoints later:
```
/api/oidc/*  → OIDC (primary)
/api/oauth/* → OAuth 2.0 (compatibility)
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('OIDCTokenManager', () => {
  it('should generate valid ID token', () => {
    const idToken = tokenManager.generateIdToken(payload);
    expect(idToken).toBeDefined();
    
    const decoded = jwt.decode(idToken, { complete: true });
    expect(decoded.header.alg).toBe('RS256');
    expect(decoded.payload.iss).toBe('https://idp.school.com');
  });
  
  it('should verify ID token with public key', () => {
    const idToken = tokenManager.generateIdToken(payload);
    const verified = tokenManager.verifyToken(idToken);
    expect(verified.sub).toBe(payload.sub);
  });
});
```

### Integration Tests
```typescript
describe('OIDC Flow', () => {
  it('should complete full OIDC flow', async () => {
    // 1. Discovery
    const discovery = await fetch('/.well-known/openid-configuration');
    expect(discovery.ok).toBe(true);
    
    // 2. Authorization
    const authUrl = getAuthorizationUrl();
    const response = await fetch(authUrl);
    expect(response.status).toBe(302);
    
    // 3. Token exchange
    const tokens = await exchangeCodeForTokens(code);
    expect(tokens.id_token).toBeDefined();
    expect(tokens.access_token).toBeDefined();
    
    // 4. UserInfo
    const userInfo = await fetch('/api/oidc/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    expect(userInfo.ok).toBe(true);
  });
});
```

### Manual Testing
```bash
# 1. Test discovery
curl http://localhost:3000/.well-known/openid-configuration | jq

# 2. Test JWKS
curl http://localhost:3000/.well-known/jwks.json | jq

# 3. Test authorization (manual browser)
open "http://localhost:3000/api/oidc/authorize?client_id=ppdb&redirect_uri=http://localhost:3001/callback&response_type=code&scope=openid%20profile%20email&state=abc&nonce=xyz"

# 4. Test token exchange (after getting code)
curl -X POST http://localhost:3000/api/oidc/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "code": "...",
    "client_id": "ppdb",
    "client_secret": "secret",
    "redirect_uri": "http://localhost:3001/callback"
  }' | jq

# 5. Test UserInfo (with access token)
curl http://localhost:3000/api/oidc/userinfo \
  -H "Authorization: Bearer <access_token>" | jq
```

---

## Documentation Updates Needed

### 1. Update Phase 1 README
- Change "OAuth 2.0" to "OpenID Connect"
- Add +3 new stories
- Update duration to 4 weeks

### 2. Update Individual Stories
- STORY-019: Add RS256 tasks
- STORY-021: Add OIDC-specific tasks
- Add STORY-022, 023, 024

### 3. Create New Docs
- [x] oidc-design.md - Architecture & design
- [x] oidc-implementation-plan.md - Detailed plan
- [x] oidc-migration-summary.md - This document

### 4. Update AI-QUICK-START.md
- Mention OIDC instead of OAuth 2.0
- Update Phase 1 description

---

## Risk Assessment

### Low Risk ✅
- **Standard Protocol**: OIDC is well-documented
- **Library Support**: Many JWT libraries support RS256
- **Clear Separation**: ID token vs access token

### Medium Risk ⚠️
- **Key Management**: Need to securely store RSA private key
- **Complexity**: More endpoints and validation
- **Learning Curve**: Team needs to understand OIDC

### Mitigation
- Use environment variables for keys
- Comprehensive documentation
- Step-by-step implementation guide
- Reference implementations

---

## Decision

✅ **Approved to proceed with OpenID Connect**

**Reasons:**
1. Future-proof architecture
2. Industry standard compliance
3. Better security (RS256)
4. Separation of concerns (ID token vs access token)
5. Easier integration with external systems
6. Only +1 week additional time

**Next Steps:**
1. Review this summary ✅
2. Start with Week 1 stories (Foundation)
3. Week 3: Implement OIDC core features
4. Week 4: Complete SSO & SDK
5. Test thoroughly
6. Deploy Phase 1

---

## Questions & Answers

**Q: Kenapa tidak stick dengan OAuth 2.0?**  
A: OAuth 2.0 bagus untuk authorization, tapi OIDC lebih baik untuk authentication. Kita butuh keduanya.

**Q: Apakah lebih susah dari OAuth 2.0?**  
A: Sedikit lebih complex (+3 stories), tapi benefits-nya worth it (standard compliance, better security).

**Q: Bisa integrate dengan Google/Microsoft SSO?**  
A: Ya! OIDC adalah protocol yang sama yang mereka pakai. Bisa federate nanti.

**Q: Bagaimana dengan apps yang sudah jalan dengan OAuth 2.0?**  
A: Ini fresh implementation, jadi tidak ada backward compatibility issue. Semua Service Provider akan pakai OIDC dari awal.

**Q: RS256 lebih aman dari HS256?**  
A: Ya, karena Service Provider hanya dapat public key (tidak bisa forge tokens). HS256 menggunakan shared secret (risk: SP bisa create fake tokens).

---

## Conclusion

**OpenID Connect adalah pilihan yang tepat untuk Identity Provider** karena:

1. ✅ Industry standard untuk authentication
2. ✅ Separation of concerns (identity vs authorization)
3. ✅ Better security dengan RS256
4. ✅ Auto-discovery untuk clients
5. ✅ Future-proof untuk external integrations
6. ✅ Only +1 week extra development time

**Total Investment:**
- Time: +1 week (4 weeks vs 3 weeks)
- Stories: +3 stories (13 vs 10)
- Complexity: Medium (well-documented standard)

**Return:**
- Standards compliance ✅
- Better security ✅
- Easier integrations ✅
- Future-proof architecture ✅

**Ready to implement! 🚀**
