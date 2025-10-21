# STORY-032: Comprehensive Session Management & Device Control

**Epic**: Phase 1 - Identity Provider  
**Priority**: P2 (Optional - User Security & Control)  
**Story Points**: 3  
**Estimated Duration**: 3 days  
**Dependencies**: STORY-031 (End Session)

---

## 📋 User Story

**As a** user  
**I want** to view and manage all my active sessions across devices  
**So that** I can control my account security and revoke suspicious sessions

---

## 🎯 Background

**Current State (After STORY-031):**
- ✅ Sessions tracked in database
- ✅ Sessions terminated on logout
- ✅ Basic session functions exist
- ❌ No user-facing session management UI
- ❌ Users cannot see active sessions
- ❌ Cannot revoke individual sessions

**Problem:**
```
User suspects compromised account
→ Cannot see active sessions
→ Cannot identify suspicious logins
→ Must change password (nuclear option)
→ Bad UX
```

**Solution:**
Comprehensive session management dashboard where users can:
- View all active sessions
- See device/browser/location info
- Identify suspicious activity
- Revoke individual sessions
- Logout all other devices
- View login history

---

## 🎯 Acceptance Criteria

### AC1: Active Sessions Dashboard

- [ ] Page shows all active sessions
- [ ] Display for each session:
  - Device type (Desktop/Mobile/Tablet)
  - Browser name and version
  - Operating system
  - IP address (partially masked)
  - Location (city, country)
  - Last activity timestamp
  - "Current device" indicator
- [ ] Sort by last activity (most recent first)
- [ ] Professional card-based UI

### AC2: Session Information

- [ ] Parse User-Agent string for device info
- [ ] Detect browser (Chrome, Firefox, Safari, Edge, etc.)
- [ ] Detect OS (Windows, macOS, Linux, iOS, Android)
- [ ] Detect device type (Desktop, Mobile, Tablet)
- [ ] GeoIP lookup for location (city, country)
- [ ] Show session duration
- [ ] Show OAuth client name (which app)

### AC3: Session Revocation

- [ ] "Revoke" button per session
- [ ] Confirmation modal before revoke
- [ ] Cannot revoke current session (use logout instead)
- [ ] "Logout All Other Devices" button (global)
- [ ] Confirmation modal for bulk revoke
- [ ] Success notification after revoke
- [ ] Auto-refresh session list

### AC4: Login History

- [ ] Tab showing login history (last 30 days)
- [ ] Display for each login:
  - Timestamp
  - Device info
  - Location
  - Success/Failed status
  - OAuth client used
- [ ] Filter by date range
- [ ] Export to CSV (optional)

### AC5: Security Notifications

- [ ] Detect new device login
- [ ] Detect login from new location
- [ ] Detect suspicious activity patterns
- [ ] Email notification for new device (optional)
- [ ] Flag suspicious sessions in UI
- [ ] Quick "Not me?" revoke action

### AC6: Device Management (Nice to Have)

- [ ] Name devices ("My iPhone", "Work Laptop")
- [ ] Device persistence (remember across sessions)
- [ ] Trusted devices list
- [ ] Auto-revoke unknown devices option

---

## 🔧 Technical Implementation

### Database Schema Enhancement

```sql
-- Enhance user_sessions table (from STORY-031)
ALTER TABLE user_sessions
ADD COLUMN device_type VARCHAR(20), -- 'desktop', 'mobile', 'tablet'
ADD COLUMN browser VARCHAR(50),
ADD COLUMN browser_version VARCHAR(20),
ADD COLUMN os VARCHAR(50),
ADD COLUMN os_version VARCHAR(20),
ADD COLUMN location_city VARCHAR(100),
ADD COLUMN location_country VARCHAR(100),
ADD COLUMN location_lat DECIMAL(10, 8),
ADD COLUMN location_lon DECIMAL(11, 8),
ADD COLUMN is_suspicious BOOLEAN DEFAULT FALSE,
ADD COLUMN last_ip_address INET;

-- Create indexes
CREATE INDEX idx_user_sessions_user_last_activity 
ON user_sessions(user_id, last_activity_at DESC) 
WHERE terminated_at IS NULL;

CREATE INDEX idx_user_sessions_suspicious 
ON user_sessions(user_id, is_suspicious) 
WHERE terminated_at IS NULL AND is_suspicious = TRUE;

-- Login history table
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  success BOOLEAN NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  device_type VARCHAR(20),
  browser VARCHAR(50),
  os VARCHAR(50),
  location_city VARCHAR(100),
  location_country VARCHAR(100),
  client_id TEXT REFERENCES oauth_clients(client_id),
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_login_history_user_created 
ON login_history(user_id, created_at DESC);

CREATE INDEX idx_login_history_failed 
ON login_history(user_id, success) 
WHERE success = FALSE;

-- Trusted devices table (optional)
CREATE TABLE trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name VARCHAR(100),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, device_fingerprint)
);

CREATE INDEX idx_trusted_devices_user ON trusted_devices(user_id);

-- Function to get session statistics
CREATE OR REPLACE FUNCTION get_session_stats(p_user_id UUID)
RETURNS TABLE (
  active_sessions INTEGER,
  total_logins_30d INTEGER,
  failed_logins_30d INTEGER,
  unique_devices INTEGER,
  suspicious_sessions INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) 
     FROM user_sessions 
     WHERE user_id = p_user_id 
       AND terminated_at IS NULL 
       AND expires_at > now())::INTEGER as active_sessions,
    (SELECT COUNT(*) 
     FROM login_history 
     WHERE user_id = p_user_id 
       AND success = TRUE
       AND created_at >= now() - interval '30 days')::INTEGER as total_logins_30d,
    (SELECT COUNT(*) 
     FROM login_history 
     WHERE user_id = p_user_id 
       AND success = FALSE
       AND created_at >= now() - interval '30 days')::INTEGER as failed_logins_30d,
    (SELECT COUNT(DISTINCT device_type || browser) 
     FROM user_sessions 
     WHERE user_id = p_user_id 
       AND terminated_at IS NULL)::INTEGER as unique_devices,
    (SELECT COUNT(*) 
     FROM user_sessions 
     WHERE user_id = p_user_id 
       AND terminated_at IS NULL 
       AND is_suspicious = TRUE)::INTEGER as suspicious_sessions;
END;
$$ LANGUAGE plpgsql;
```

---

### User-Agent Parser Utility

**File**: `packages/utils/src/user-agent-parser.ts`

```typescript
import UAParser from 'ua-parser-js';

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  fullString: string;
}

/**
 * Parse User-Agent string to extract device information
 */
export function parseUserAgent(userAgent: string): DeviceInfo {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  // Determine device type
  let type: DeviceInfo['type'] = 'unknown';
  if (result.device.type === 'mobile') {
    type = 'mobile';
  } else if (result.device.type === 'tablet') {
    type = 'tablet';
  } else if (result.device.type === undefined) {
    // Undefined usually means desktop
    type = 'desktop';
  }
  
  return {
    type,
    browser: result.browser.name || 'Unknown Browser',
    browserVersion: result.browser.version || '',
    os: result.os.name || 'Unknown OS',
    osVersion: result.os.version || '',
    fullString: userAgent,
  };
}

/**
 * Get device icon based on type
 */
export function getDeviceIcon(type: string): string {
  switch (type) {
    case 'mobile':
      return '📱';
    case 'tablet':
      return '📱';
    case 'desktop':
      return '💻';
    default:
      return '🖥️';
  }
}

/**
 * Get browser icon
 */
export function getBrowserIcon(browser: string): string {
  const normalized = browser.toLowerCase();
  if (normalized.includes('chrome')) return '🌐';
  if (normalized.includes('firefox')) return '🦊';
  if (normalized.includes('safari')) return '🧭';
  if (normalized.includes('edge')) return '🌊';
  if (normalized.includes('opera')) return '🎭';
  return '🌐';
}
```

---

### GeoIP Lookup Utility

**File**: `packages/utils/src/geoip.ts`

```typescript
/**
 * Get location info from IP address
 * Using ip-api.com free service (or ipapi.co, ipinfo.io)
 */
export interface LocationInfo {
  city: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
}

export async function getLocationFromIP(
  ip: string
): Promise<LocationInfo | null> {
  try {
    // Skip private/local IPs
    if (
      ip === 'unknown' ||
      ip.startsWith('127.') ||
      ip.startsWith('192.168.') ||
      ip.startsWith('10.')
    ) {
      return null;
    }
    
    // Use ip-api.com (free, no auth required, 45 req/min)
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        city: data.city || 'Unknown',
        country: data.country || 'Unknown',
        countryCode: data.countryCode || '',
        lat: data.lat || 0,
        lon: data.lon || 0,
      };
    }
    
    return null;
  } catch (error) {
    console.error('GeoIP lookup failed:', error);
    return null;
  }
}

/**
 * Format location for display
 */
export function formatLocation(location: LocationInfo | null): string {
  if (!location) return 'Unknown Location';
  
  if (location.city && location.country) {
    return `${location.city}, ${location.country}`;
  }
  
  if (location.country) {
    return location.country;
  }
  
  return 'Unknown Location';
}

/**
 * Get country flag emoji from country code
 */
export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
}
```

---

### Session Management API

**File**: `apps/identity-provider/app/api/user/sessions/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@repo/database-identity';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/user/sessions
 * Get all active sessions for current user
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = getSupabaseClient();
  
  // Get current session token
  const currentSessionToken = request.cookies.get('session_token')?.value;
  
  // Get all active sessions
  const { data: sessions, error } = await supabase
    .from('user_sessions')
    .select('*, oauth_clients(name)')
    .eq('user_id', user.id)
    .is('terminated_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('last_activity_at', { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Mark current session
  const sessionsWithCurrent = sessions.map(session => ({
    ...session,
    isCurrent: session.session_token === currentSessionToken,
  }));
  
  return NextResponse.json({ sessions: sessionsWithCurrent });
}
```

**File**: `apps/identity-provider/app/api/user/sessions/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@repo/database-identity';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@repo/database-identity';

/**
 * DELETE /api/user/sessions/:id
 * Revoke a specific session
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const sessionId = params.id;
  const supabase = getSupabaseClient();
  
  // Get current session
  const currentSessionToken = request.cookies.get('session_token')?.value;
  
  // Get the session to revoke
  const { data: session } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
  
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  
  // Verify session belongs to current user
  if (session.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Prevent revoking current session (should use logout instead)
  if (session.session_token === currentSessionToken) {
    return NextResponse.json(
      { error: 'Cannot revoke current session. Use logout instead.' },
      { status: 400 }
    );
  }
  
  // Terminate session
  await supabase
    .from('user_sessions')
    .update({ terminated_at: new Date().toISOString() })
    .eq('id', sessionId);
  
  // Audit log
  await logAudit({
    user_id: user.id,
    action: 'session.revoked',
    resource_type: 'session',
    resource_id: sessionId,
    details: {
      device: session.device_type,
      browser: session.browser,
      ip_address: session.ip_address,
    },
  });
  
  return NextResponse.json({ success: true });
}
```

**File**: `apps/identity-provider/app/api/user/sessions/revoke-all/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@repo/database-identity';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@repo/database-identity';

/**
 * POST /api/user/sessions/revoke-all
 * Revoke all sessions except current one
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = getSupabaseClient();
  const currentSessionToken = request.cookies.get('session_token')?.value;
  
  // Terminate all sessions except current
  const { data, error } = await supabase
    .from('user_sessions')
    .update({ terminated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .neq('session_token', currentSessionToken || '')
    .is('terminated_at', null)
    .select();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Audit log
  await logAudit({
    user_id: user.id,
    action: 'session.revoked_all',
    resource_type: 'session',
    resource_id: user.id,
    details: {
      count: data?.length || 0,
    },
  });
  
  return NextResponse.json({ 
    success: true,
    revokedCount: data?.length || 0,
  });
}
```

---

### Active Sessions Dashboard

**File**: `apps/identity-provider/app/(dashboard)/settings/sessions/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { getDeviceIcon, getBrowserIcon } from '@repo/utils/user-agent-parser';
import { formatLocation, getCountryFlag } from '@repo/utils/geoip';

interface Session {
  id: string;
  device_type: string;
  browser: string;
  browser_version: string;
  os: string;
  ip_address: string;
  location_city: string;
  location_country: string;
  last_activity_at: string;
  created_at: string;
  is_suspicious: boolean;
  isCurrent: boolean;
  oauth_clients?: { name: string };
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/user/sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (sessionId: string) => {
    if (!confirm('Revoke this session? The user will be logged out from that device.')) {
      return;
    }

    setRevoking(sessionId);
    try {
      const response = await fetch(`/api/user/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadSessions();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to revoke session');
      }
    } catch (error) {
      console.error('Failed to revoke session:', error);
      alert('Failed to revoke session');
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm('Logout all other devices? You will remain logged in on this device.')) {
      return;
    }

    try {
      const response = await fetch('/api/user/sessions/revoke-all', {
        method: 'POST',
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Successfully logged out ${data.revokedCount} device(s)`);
        await loadSessions();
      } else {
        alert(data.error || 'Failed to revoke sessions');
      }
    } catch (error) {
      console.error('Failed to revoke all sessions:', error);
      alert('Failed to revoke sessions');
    }
  };

  const getDeviceIconComponent = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="text-gray-600">Loading sessions...</div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Active Sessions</h1>
          <p className="text-gray-600 mt-1">
            Manage your account access across all devices
          </p>
        </div>
        {sessions.filter(s => !s.isCurrent).length > 0 && (
          <button
            onClick={handleRevokeAll}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout All Other Devices
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Active Sessions</p>
          <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Current Device</p>
          <p className="text-2xl font-bold text-green-600">
            {sessions.find(s => s.isCurrent)?.device_type || 'Unknown'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Suspicious Activity</p>
          <p className="text-2xl font-bold text-red-600">
            {sessions.filter(s => s.is_suspicious).length}
          </p>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`bg-white rounded-lg shadow p-6 ${
              session.isCurrent ? 'border-2 border-green-500' : ''
            } ${session.is_suspicious ? 'border-2 border-red-500' : ''}`}
          >
            <div className="flex items-start justify-between">
              {/* Device Info */}
              <div className="flex items-start gap-4 flex-1">
                {/* Icon */}
                <div className={`p-3 rounded-lg ${
                  session.isCurrent ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {getDeviceIconComponent(session.device_type)}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {session.browser} on {session.os}
                    </h3>
                    {session.isCurrent && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        Current Device
                      </span>
                    )}
                    {session.is_suspicious && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Suspicious
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    {/* Location */}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {session.location_country && getCountryFlag(session.location_country.substring(0, 2))}
                        {' '}
                        {session.location_city}, {session.location_country}
                      </span>
                    </div>

                    {/* Last Activity */}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        Last active: {new Date(session.last_activity_at).toLocaleString()}
                      </span>
                    </div>

                    {/* IP Address */}
                    <div className="text-xs text-gray-500 font-mono">
                      IP: {session.ip_address?.replace(/\.\d+$/, '.xxx')}
                    </div>

                    {/* App */}
                    {session.oauth_clients?.name && (
                      <div className="text-xs text-gray-500">
                        App: {session.oauth_clients.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {!session.isCurrent && (
                <button
                  onClick={() => handleRevoke(session.id)}
                  disabled={revoking === session.id}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  {revoking === session.id ? 'Revoking...' : 'Revoke'}
                </button>
              )}
            </div>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No active sessions</p>
          </div>
        )}
      </div>

      {/* Security Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Security Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Regularly review your active sessions</li>
          <li>Revoke sessions you don't recognize</li>
          <li>Use strong, unique passwords</li>
          <li>Enable two-factor authentication (coming soon)</li>
          <li>Logout from public/shared computers</li>
        </ul>
      </div>
    </div>
  );
}
```

---

## 📝 Tasks

### Task 1: Database Schema (2 hours)
- [ ] Add device info columns to user_sessions
- [ ] Create login_history table
- [ ] Create trusted_devices table
- [ ] Create get_session_stats function
- [ ] Test migrations

### Task 2: Utilities (3 hours)
- [ ] Install ua-parser-js library
- [ ] Implement user-agent parser
- [ ] Implement GeoIP lookup
- [ ] Write unit tests
- [ ] Test with various user agents

### Task 3: Session APIs (4 hours)
- [ ] GET /api/user/sessions endpoint
- [ ] DELETE /api/user/sessions/:id endpoint
- [ ] POST /api/user/sessions/revoke-all endpoint
- [ ] GET /api/user/login-history endpoint
- [ ] Test all endpoints

### Task 4: Session Tracking (3 hours)
- [ ] Update login to save device info
- [ ] Update session on each request (last_activity)
- [ ] Detect new devices
- [ ] Flag suspicious sessions
- [ ] Test tracking

### Task 5: Dashboard UI (4 hours)
- [ ] Create sessions page
- [ ] Session cards with device info
- [ ] Revoke functionality
- [ ] Revoke all functionality
- [ ] Test UI

### Task 6: Login History (2 hours)
- [ ] Login history tab
- [ ] Display history table
- [ ] Filter functionality
- [ ] Test display

### Task 7: Testing (3 hours)
- [ ] Unit tests for utilities
- [ ] Integration tests for APIs
- [ ] E2E tests for UI
- [ ] Security testing
- [ ] Multi-device testing

**Total**: 21 hours (~3 days)

---

## 🔒 Security Considerations

1. **IP Masking**:
   - Display partial IP (xxx.xxx.xxx.123)
   - Store full IP for security
   - Comply with privacy regulations

2. **Session Security**:
   - Cannot revoke current session
   - Confirmation before bulk revoke
   - Audit log all revocations

3. **Privacy**:
   - User consent for location tracking
   - Option to disable GeoIP
   - GDPR compliance

4. **Suspicious Detection**:
   - New location (>100km from last)
   - New device type
   - Multiple failed logins
   - Rapid location changes

---

## ✅ Definition of Done

- [ ] Database schema updated
- [ ] All utilities implemented
- [ ] All API endpoints working
- [ ] Dashboard UI complete
- [ ] Login history working
- [ ] Device detection accurate
- [ ] GeoIP working
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Deployed to staging

---

## 📚 References

- [ua-parser-js](https://github.com/faisalman/ua-parser-js)
- [ip-api.com](https://ip-api.com/)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

---

**Status**: 📝 Ready for Implementation  
**Phase**: 2.0 (User Security Features)
