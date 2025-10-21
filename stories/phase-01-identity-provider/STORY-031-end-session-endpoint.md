# STORY-031: End Session / Single Logout (RP-Initiated Logout)

**Epic**: Phase 1 - Identity Provider  
**Priority**: P2 (Optional - Enhanced SSO)  
**Story Points**: 3  
**Estimated Duration**: 3 days  
**Dependencies**: STORY-021 (SSO), STORY-025 (OAuth Clients)

---

## 📋 User Story

**As a** user  
**I want** to logout from all connected applications when I logout from one  
**So that** my session is completely terminated across the ecosystem

---

## 🎯 Background

**Current State:**
- Users can logout from Identity Provider
- BUT sessions remain active in Service Providers
- No single logout mechanism
- Users must manually logout from each app

**Problem:**
```
User logs out from IdP
→ IdP session terminated ✅
→ Service Provider sessions still active ❌
→ Security risk (shared computer, kiosk, etc.)
```

**Solution: RP-Initiated Logout (OIDC)**
Implement OIDC End Session endpoint that:
1. Accepts logout request from Service Provider
2. Terminates IdP session
3. Optionally notifies all other SPs (logout propagation)
4. Redirects back to SP

---

## 🎯 Acceptance Criteria

### AC1: End Session Endpoint

- [ ] Implement GET/POST `/api/oidc/endsession`
- [ ] Accept `id_token_hint` parameter (optional)
- [ ] Accept `post_logout_redirect_uri` parameter (optional)
- [ ] Accept `state` parameter (optional)
- [ ] Validate id_token_hint if provided
- [ ] Validate post_logout_redirect_uri is registered
- [ ] Terminate IdP session
- [ ] Redirect to post_logout_redirect_uri or default

### AC2: Session Tracking

- [ ] Track active sessions per user
- [ ] Store: session_id, user_id, client_id, created_at, last_activity
- [ ] Update last_activity on token refresh
- [ ] Link sessions to Service Providers
- [ ] Delete session on logout

### AC3: Logout Confirmation Page

- [ ] Show if no post_logout_redirect_uri provided
- [ ] Display "You have been logged out" message
- [ ] List applications where user may still be logged in
- [ ] "Continue to login" button
- [ ] Professional design

### AC4: OAuth Client Configuration

- [ ] Add post_logout_redirect_uris field to oauth_clients
- [ ] Allow multiple URIs (JSON array)
- [ ] Validate URI format
- [ ] UI for managing logout URIs

### AC5: Front-Channel Logout (Optional)

- [ ] Register front_channel_logout_uri per client
- [ ] On logout, load logout URIs in hidden iframes
- [ ] SPs clear their sessions via iframe
- [ ] Timeout handling (5 seconds per SP)

---

## 🔧 Technical Implementation

### Database Schema

```sql
-- Add logout URIs to oauth_clients
ALTER TABLE oauth_clients
ADD COLUMN post_logout_redirect_uris JSONB DEFAULT '[]',
ADD COLUMN front_channel_logout_uri TEXT,
ADD COLUMN back_channel_logout_uri TEXT;

-- Active sessions table
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES oauth_clients(client_id),
  session_token TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  terminated_at TIMESTAMPTZ
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id) WHERE terminated_at IS NULL;
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token) WHERE terminated_at IS NULL;
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Function to get active sessions for user
CREATE OR REPLACE FUNCTION get_active_sessions(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  client_id TEXT,
  client_name TEXT,
  last_activity_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.client_id,
    c.name as client_name,
    s.last_activity_at
  FROM user_sessions s
  LEFT JOIN oauth_clients c ON s.client_id = c.client_id
  WHERE s.user_id = p_user_id
    AND s.terminated_at IS NULL
    AND s.expires_at > now()
  ORDER BY s.last_activity_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to terminate all sessions for user
CREATE OR REPLACE FUNCTION terminate_user_sessions(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE user_sessions
  SET terminated_at = now()
  WHERE user_id = p_user_id
    AND terminated_at IS NULL;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;
```

---

### End Session Endpoint

**File**: `apps/identity-provider/app/api/oidc/endsession/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@repo/jwt';
import { getOAuthClientByClientId } from '@repo/database-identity';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const id_token_hint = searchParams.get('id_token_hint');
  const post_logout_redirect_uri = searchParams.get('post_logout_redirect_uri');
  const state = searchParams.get('state');
  
  let client_id: string | undefined;
  let user_id: string | undefined;
  
  // Verify id_token_hint if provided
  if (id_token_hint) {
    try {
      const payload = await verifyIdToken(id_token_hint);
      client_id = payload.aud as string;
      user_id = payload.sub;
    } catch (error) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Invalid id_token_hint' },
        { status: 400 }
      );
    }
  }
  
  // Validate post_logout_redirect_uri
  if (post_logout_redirect_uri && client_id) {
    const client = await getOAuthClientByClientId(client_id);
    if (!client) {
      return NextResponse.json(
        { error: 'invalid_client', error_description: 'Client not found' },
        { status: 400 }
      );
    }
    
    // Check if URI is registered
    const logoutUris = client.post_logout_redirect_uris || [];
    if (!logoutUris.includes(post_logout_redirect_uri)) {
      return NextResponse.json(
        { 
          error: 'invalid_request', 
          error_description: 'post_logout_redirect_uri not registered' 
        },
        { status: 400 }
      );
    }
  }
  
  // Terminate IdP session
  const cookieStore = cookies();
  cookieStore.delete('session_token');
  
  // Terminate all user sessions in database
  if (user_id) {
    await terminateUserSessions(user_id);
    
    // Audit log
    await logAudit({
      user_id,
      action: 'auth.logout',
      resource_type: 'session',
      resource_id: user_id,
      details: {
        client_id,
        method: 'endsession',
      },
    });
  }
  
  // Redirect to post_logout_redirect_uri or logout confirmation page
  if (post_logout_redirect_uri) {
    const redirectUrl = new URL(post_logout_redirect_uri);
    if (state) {
      redirectUrl.searchParams.set('state', state);
    }
    return NextResponse.redirect(redirectUrl.toString());
  }
  
  // Show logout confirmation page
  return NextResponse.redirect('/logout-confirm');
}

export const POST = GET; // Support both GET and POST
```

---

### Logout Confirmation Page

**File**: `apps/identity-provider/app/logout-confirm/page.tsx`

```typescript
'use client';

import { CheckCircle, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function LogoutConfirmPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
        </div>
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          You've Been Logged Out
        </h1>
        
        <p className="text-center text-gray-600 mb-6">
          Your session has been terminated successfully.
        </p>
        
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900 mb-2">
            <strong>Important:</strong>
          </p>
          <p className="text-sm text-blue-800">
            You may still be logged in to some applications. 
            Please close your browser or logout from those applications individually for complete security.
          </p>
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign In Again
          </Link>
          
          <Link
            href="/"
            className="block text-center text-sm text-gray-600 hover:text-gray-900"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

### OAuth Client Form Update

**File**: `components/oauth-clients/client-form.tsx`

Add logout URIs field:

```typescript
// In the form, add:

<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Post-Logout Redirect URIs
  </label>
  <textarea
    value={formData.post_logout_redirect_uris?.join('\n') || ''}
    onChange={(e) => setFormData({
      ...formData,
      post_logout_redirect_uris: e.target.value.split('\n').filter(uri => uri.trim())
    })}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
    rows={3}
    placeholder="https://app.example.com/logout&#10;https://app.example.com/signed-out"
  />
  <p className="text-sm text-gray-500 mt-1">
    URIs where users can be redirected after logout. One per line.
  </p>
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Front-Channel Logout URI (Optional)
  </label>
  <input
    type="url"
    value={formData.front_channel_logout_uri || ''}
    onChange={(e) => setFormData({
      ...formData,
      front_channel_logout_uri: e.target.value
    })}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
    placeholder="https://app.example.com/logout-iframe"
  />
  <p className="text-sm text-gray-500 mt-1">
    URI to load in iframe for front-channel logout propagation.
  </p>
</div>
```

---

### Front-Channel Logout (Advanced)

**File**: `apps/identity-provider/app/logout-propagate/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPropagatePage() {
  const router = useRouter();
  const [clients, setClients] = useState<string[]>([]);
  const [completed, setCompleted] = useState(0);
  
  useEffect(() => {
    // Get clients to logout from
    fetch('/api/session/active-clients')
      .then(res => res.json())
      .then(data => {
        setClients(data.clients || []);
      });
  }, []);
  
  useEffect(() => {
    if (completed === clients.length && clients.length > 0) {
      // All logouts complete
      setTimeout(() => {
        router.push('/logout-confirm');
      }, 1000);
    }
  }, [completed, clients.length, router]);
  
  const handleIframeLoad = () => {
    setCompleted(prev => prev + 1);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          Signing you out from all applications...
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {completed} / {clients.length} completed
        </p>
      </div>
      
      {/* Hidden iframes for front-channel logout */}
      <div style={{ display: 'none' }}>
        {clients.map((logoutUri, index) => (
          <iframe
            key={index}
            src={logoutUri}
            onLoad={handleIframeLoad}
            onError={handleIframeLoad}
            style={{ display: 'none' }}
          />
        ))}
      </div>
    </div>
  );
}
```

---

### Service Provider Integration Example

**Client-side implementation:**

```typescript
// In Service Provider app

/**
 * Initiate logout via IdP
 */
async function initiateLogout() {
  // Get current ID token
  const idToken = localStorage.getItem('id_token');
  
  // Build logout URL
  const logoutUrl = new URL('https://idp.example.com/api/oidc/endsession');
  logoutUrl.searchParams.set('id_token_hint', idToken);
  logoutUrl.searchParams.set('post_logout_redirect_uri', 'https://app.example.com/logged-out');
  logoutUrl.searchParams.set('state', generateRandomString());
  
  // Clear local tokens
  localStorage.removeItem('access_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('refresh_token');
  
  // Redirect to IdP logout
  window.location.href = logoutUrl.toString();
}

/**
 * Handle front-channel logout (iframe)
 * Host this at: https://app.example.com/logout-iframe
 */
function handleFrontChannelLogout() {
  // Clear local tokens
  localStorage.removeItem('access_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('refresh_token');
  
  // Clear session cookie
  document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // Notify parent frame (IdP)
  window.parent.postMessage('logout_complete', '*');
}
```

---

## 📝 Tasks

### Task 1: Database Schema (1 hour)
- [ ] Add logout URI columns to oauth_clients
- [ ] Create user_sessions table
- [ ] Create session management functions
- [ ] Test schema

### Task 2: End Session Endpoint (3 hours)
- [ ] Implement /api/oidc/endsession
- [ ] id_token_hint validation
- [ ] post_logout_redirect_uri validation
- [ ] Session termination
- [ ] Test endpoint

### Task 3: Session Tracking (3 hours)
- [ ] Track sessions on login
- [ ] Update on token refresh
- [ ] Terminate on logout
- [ ] Get active sessions API
- [ ] Test tracking

### Task 4: Logout Confirmation Page (2 hours)
- [ ] Create logout-confirm page
- [ ] Professional design
- [ ] List active sessions (optional)
- [ ] Test page

### Task 5: OAuth Client UI (2 hours)
- [ ] Add logout URIs to form
- [ ] Validation
- [ ] Display in client details
- [ ] Test UI

### Task 6: Front-Channel Logout (4 hours - Optional)
- [ ] Implement logout propagation page
- [ ] Iframe loading logic
- [ ] Timeout handling
- [ ] Test with multiple SPs

### Task 7: Testing (3 hours)
- [ ] Test basic logout flow
- [ ] Test with redirect URI
- [ ] Test session termination
- [ ] Test with multiple clients
- [ ] Test front-channel logout

**Total**: 18 hours (~3 days, or 1.5 days without front-channel)

---

## 🔒 Security Considerations

1. **URI Validation**:
   - Strictly validate post_logout_redirect_uri
   - Only allow registered URIs
   - Prevent open redirects

2. **Token Validation**:
   - Verify id_token_hint signature
   - Check token not expired
   - Validate audience

3. **Session Security**:
   - Terminate all sessions on logout
   - No lingering session data
   - Clear cookies securely

4. **CSRF Protection**:
   - Use state parameter
   - Validate state on return

---

## ✅ Definition of Done

- [ ] Database schema updated
- [ ] End session endpoint implemented
- [ ] Session tracking functional
- [ ] Logout confirmation page created
- [ ] OAuth client UI updated
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Tested with real Service Provider

---

## 📚 References

- [OIDC Session Management](https://openid.net/specs/openid-connect-session-1_0.html)
- [OIDC RP-Initiated Logout](https://openid.net/specs/openid-connect-rpinitiated-1_0.html)
- [OIDC Front-Channel Logout](https://openid.net/specs/openid-connect-frontchannel-1_0.html)
- [OIDC Back-Channel Logout](https://openid.net/specs/openid-connect-backchannel-1_0.html)

---

**Status**: 📝 Ready for Implementation  
**Phase**: 1.6 (Optional - Enhanced SSO)
