# STORY-030: OAuth Consent Screen

**Epic**: Phase 1 - Identity Provider  
**Priority**: P2 (Optional - Third-party Apps)  
**Story Points**: 2  
**Estimated Duration**: 2 days  
**Dependencies**: STORY-021 (SSO), STORY-025 (OAuth Clients)

---

## 📋 User Story

**As a** user  
**I want** to review and approve what data a third-party app can access  
**So that** I can make informed decisions about my data privacy

---

## 🎯 Background

**Current State:**
- `require_consent` flag exists in oauth_clients table
- BUT no consent UI implemented
- Consent always skipped
- Users never see what apps are requesting

**Use Case:**
Third-party apps requesting access to user data should show consent screen where users can:
- See what app is requesting access
- See what scopes/permissions are requested
- Approve or deny access
- View previously granted consents
- Revoke access

**Note**: First-party (trusted) apps can skip consent.

---

## 🎯 Acceptance Criteria

### AC1: Consent Screen UI

- [ ] Show after successful login (in authorize flow)
- [ ] Display app name and description
- [ ] Display app logo (if available)
- [ ] List all requested scopes with explanations
- [ ] Show "Allow" and "Deny" buttons
- [ ] Professional and trustworthy design
- [ ] Mobile responsive

### AC2: Scope Explanations

- [ ] `openid` → "Verify your identity"
- [ ] `profile` → "Access your name and profile picture"
- [ ] `email` → "Access your email address"
- [ ] `phone` → "Access your phone number"
- [ ] `address` → "Access your postal address"
- [ ] `offline_access` → "Keep access when you're offline"
- [ ] Custom scopes → Use scope description

### AC3: User Consent Storage

- [ ] Save user consent decisions
- [ ] Store: user_id, client_id, scopes, granted_at
- [ ] Skip consent if already granted (same scopes)
- [ ] Show consent again if new scopes requested
- [ ] Allow users to revoke consent

### AC4: Consent Management Page

- [ ] List all apps user has granted access to
- [ ] Show granted scopes per app
- [ ] Show last accessed date
- [ ] "Revoke Access" button
- [ ] Confirmation modal before revoke

### AC5: Trusted Apps (Skip Consent)

- [ ] If `require_consent = false`, skip consent screen
- [ ] First-party apps don't need consent
- [ ] System apps auto-approved
- [ ] Admin can mark apps as trusted

---

## 🔧 Technical Implementation

### Database Schema

```sql
-- User consents table
CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
  scopes TEXT[] NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  UNIQUE(user_id, client_id)
);

CREATE INDEX idx_user_consents_user_id ON user_consents(user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_user_consents_client_id ON user_consents(client_id);

-- Function to check if consent needed
CREATE OR REPLACE FUNCTION needs_consent(
  p_user_id UUID,
  p_client_id TEXT,
  p_requested_scopes TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE
  v_consent RECORD;
BEGIN
  -- Get existing consent
  SELECT * INTO v_consent
  FROM user_consents
  WHERE user_id = p_user_id
    AND client_id = p_client_id
    AND revoked_at IS NULL;
  
  -- No consent exists
  IF NOT FOUND THEN
    RETURN TRUE;
  END IF;
  
  -- Check if all requested scopes are granted
  IF p_requested_scopes <@ v_consent.scopes THEN
    RETURN FALSE; -- All scopes granted, no consent needed
  ELSE
    RETURN TRUE; -- New scopes requested
  END IF;
END;
$$ LANGUAGE plpgsql;
```

---

### Consent Screen Component

**File**: `apps/identity-provider/app/consent/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

interface ConsentRequest {
  client: {
    client_id: string;
    name: string;
    description: string;
    logo_url?: string;
  };
  scopes: string[];
  redirectUri: string;
  state?: string;
}

const scopeDescriptions: Record<string, { title: string; description: string }> = {
  openid: {
    title: 'Verify your identity',
    description: 'Allows the app to verify who you are',
  },
  profile: {
    title: 'Access your profile',
    description: 'Includes your name, username, and profile picture',
  },
  email: {
    title: 'Access your email address',
    description: 'Read your email address',
  },
  phone: {
    title: 'Access your phone number',
    description: 'Read your phone number',
  },
  address: {
    title: 'Access your postal address',
    description: 'Read your full address',
  },
  offline_access: {
    title: 'Access your data while offline',
    description: 'Keep access to your data even when you\'re not using the app',
  },
};

export default function ConsentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [consent, setConsent] = useState<ConsentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Get consent request from session
    fetch('/api/consent/request')
      .then(res => res.json())
      .then(data => {
        setConsent(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load consent request:', err);
        setLoading(false);
      });
  }, []);

  const handleAllow = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/consent/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: consent?.client.client_id,
          scopes: consent?.scopes,
          approved: true,
        }),
      });

      const data = await response.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (error) {
      console.error('Failed to grant consent:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeny = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/consent/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: consent?.client.client_id,
          approved: false,
        }),
      });

      const data = await response.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (error) {
      console.error('Failed to deny consent:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">Loading...</div>
    </div>;
  }

  if (!consent) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-600">Invalid consent request</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Authorization Request</h1>
          </div>
          <p className="text-blue-100">
            An application wants to access your account
          </p>
        </div>

        {/* App Info */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            {consent.client.logo_url ? (
              <img
                src={consent.client.logo_url}
                alt={consent.client.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                {consent.client.name[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {consent.client.name}
              </h2>
              {consent.client.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {consent.client.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            This app would like to:
          </h3>
          <div className="space-y-3">
            {consent.scopes.map(scope => {
              const info = scopeDescriptions[scope] || {
                title: scope,
                description: `Access ${scope}`,
              };
              return (
                <div key={scope} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{info.title}</p>
                    <p className="text-sm text-gray-600">{info.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning */}
        <div className="px-6 pb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Important:</strong> Only approve if you trust this application. 
              You can revoke access anytime from your account settings.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 flex gap-3">
          <button
            onClick={handleDeny}
            disabled={submitting}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 font-medium transition-colors"
          >
            Deny
          </button>
          <button
            onClick={handleAllow}
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
          >
            {submitting ? 'Processing...' : 'Allow'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### Consent Management Page

**File**: `apps/identity-provider/app/(dashboard)/settings/consents/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Shield, Trash2, Clock } from 'lucide-react';

export default function ConsentsPage() {
  const [consents, setConsents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    loadConsents();
  }, []);

  const loadConsents = async () => {
    try {
      const response = await fetch('/api/user/consents');
      const data = await response.json();
      setConsents(data);
    } catch (error) {
      console.error('Failed to load consents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (consentId: string) => {
    if (!confirm('Revoke access for this application? You will need to re-authorize if you use it again.')) {
      return;
    }

    setRevoking(consentId);
    try {
      await fetch(`/api/user/consents/${consentId}`, {
        method: 'DELETE',
      });
      await loadConsents();
    } catch (error) {
      console.error('Failed to revoke consent:', error);
    } finally {
      setRevoking(null);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">App Permissions</h1>
        <p className="text-gray-600 mt-2">
          Manage applications that have access to your account
        </p>
      </div>

      {consents.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No applications have access to your account</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {consents.map(consent => (
            <div key={consent.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{consent.client_name}</h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      Granted {new Date(consent.granted_at).toLocaleDateString()}
                    </span>
                    {consent.last_used_at && (
                      <span>
                        • Last used {new Date(consent.last_used_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Permissions:</p>
                    <div className="flex flex-wrap gap-2">
                      {consent.scopes.map((scope: string) => (
                        <span
                          key={scope}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRevoke(consent.id)}
                  disabled={revoking === consent.id}
                  className="ml-4 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 📝 Tasks

### Task 1: Database (1 hour)
- [ ] Create user_consents table
- [ ] Create needs_consent function
- [ ] Test queries

### Task 2: Consent Flow (3 hours)
- [ ] Update /authorize to check consent
- [ ] Create consent screen page
- [ ] Create /api/consent/grant endpoint
- [ ] Handle approve/deny

### Task 3: Consent Management (2 hours)
- [ ] Create consents list page
- [ ] Create revoke endpoint
- [ ] Test revocation

### Task 4: Testing (2 hours)
- [ ] Test consent required flow
- [ ] Test consent skip for trusted apps
- [ ] Test new scopes trigger consent
- [ ] Test revocation

**Total**: 8 hours (~1 day)

---

**Status**: 📝 Ready for Implementation  
**Phase**: 1.6 (Optional)
