# STORY-029: Token Audit Logging & Analytics

**Epic**: Phase 1 - Identity Provider  
**Priority**: P1 (Important - Security Monitoring)  
**Story Points**: 1  
**Estimated Duration**: 1 day  
**Dependencies**: STORY-021 (SSO), STORY-023 (UserInfo)

---

## 📋 User Story

**As a** system administrator  
**I want** comprehensive audit logs for all token operations  
**So that** I can monitor security, detect anomalies, and investigate incidents

---

## 🎯 Background

**Current State:**
- Basic audit logs exist
- BUT token operations not fully tracked
- No analytics or dashboard
- Hard to detect abuse patterns

**What's Missing:**
- Token issuance tracking
- Token refresh tracking
- Token usage tracking (UserInfo calls)
- Failed authentication attempts
- Token revocation events
- Analytics dashboard

---

## 🎯 Acceptance Criteria

### AC1: Token Operation Logging

- [ ] Log token issuance (authorization_code grant)
- [ ] Log token issuance (refresh_token grant)
- [ ] Log token issuance (client_credentials grant)
- [ ] Log token refresh operations
- [ ] Log UserInfo endpoint access
- [ ] Log failed token requests
- [ ] Include: user_id, client_id, grant_type, scopes, IP, user_agent

### AC2: Security Event Logging

- [ ] Log invalid authorization codes
- [ ] Log expired tokens
- [ ] Log invalid client credentials
- [ ] Log PKCE verification failures
- [ ] Log rate limit violations
- [ ] Log suspicious patterns

### AC3: Audit Dashboard

- [ ] Total tokens issued (daily/weekly/monthly)
- [ ] Tokens by grant type chart
- [ ] Tokens by client chart
- [ ] Failed attempts chart
- [ ] Recent token activity table
- [ ] Filter by date range, client, user

### AC4: Analytics Queries

- [ ] Most active clients
- [ ] Most active users
- [ ] Peak usage times
- [ ] Average token lifetime
- [ ] Refresh token usage rate
- [ ] Failed authentication rate

---

## 🔧 Technical Implementation

### Database Schema Enhancement

```sql
-- Enhanced audit logging for tokens
-- Using existing audit_logs table, add token-specific actions

-- Token operations audit actions:
-- 'token.issued.authorization_code'
-- 'token.issued.refresh_token'
-- 'token.issued.client_credentials'
-- 'token.refreshed'
-- 'token.userinfo_accessed'
-- 'token.validation_failed'
-- 'token.pkce_failed'
-- 'token.expired'

-- Create view for token analytics
CREATE OR REPLACE VIEW token_analytics AS
SELECT 
  DATE(created_at) as date,
  action,
  details->>'client_id' as client_id,
  details->>'grant_type' as grant_type,
  COUNT(*) as count
FROM audit_logs
WHERE action LIKE 'token.%'
GROUP BY DATE(created_at), action, details->>'client_id', details->>'grant_type';

-- Create function for token stats
CREATE OR REPLACE FUNCTION get_token_stats(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_client_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  total_issued BIGINT,
  total_refreshed BIGINT,
  total_failed BIGINT,
  unique_users BIGINT,
  unique_clients BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE action LIKE 'token.issued.%') as total_issued,
    COUNT(*) FILTER (WHERE action = 'token.refreshed') as total_refreshed,
    COUNT(*) FILTER (WHERE action LIKE 'token.%failed%') as total_failed,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT details->>'client_id') as unique_clients
  FROM audit_logs
  WHERE 
    action LIKE 'token.%'
    AND created_at >= p_start_date
    AND created_at <= p_end_date
    AND (p_client_id IS NULL OR details->>'client_id' = p_client_id);
END;
$$ LANGUAGE plpgsql;
```

---

### Enhanced Audit Functions

**File**: `packages/database-identity/src/queries/token-audit.ts`

```typescript
import { getSupabaseClient } from '../client';

export interface TokenAuditLog {
  user_id?: string;
  client_id: string;
  grant_type: string;
  scopes?: string[];
  ip_address?: string;
  user_agent?: string;
  error?: string;
}

/**
 * Log token issuance
 */
export async function logTokenIssued(data: TokenAuditLog) {
  const supabase = getSupabaseClient();
  
  await supabase.from('audit_logs').insert({
    user_id: data.user_id || null,
    action: `token.issued.${data.grant_type}`,
    resource_type: 'oauth_token',
    resource_id: data.client_id,
    details: {
      client_id: data.client_id,
      grant_type: data.grant_type,
      scopes: data.scopes,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
    },
  });
}

/**
 * Log token refresh
 */
export async function logTokenRefreshed(data: TokenAuditLog) {
  const supabase = getSupabaseClient();
  
  await supabase.from('audit_logs').insert({
    user_id: data.user_id,
    action: 'token.refreshed',
    resource_type: 'oauth_token',
    resource_id: data.client_id,
    details: {
      client_id: data.client_id,
      scopes: data.scopes,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
    },
  });
}

/**
 * Log UserInfo access
 */
export async function logUserInfoAccessed(data: TokenAuditLog) {
  const supabase = getSupabaseClient();
  
  await supabase.from('audit_logs').insert({
    user_id: data.user_id,
    action: 'token.userinfo_accessed',
    resource_type: 'oauth_token',
    resource_id: data.client_id,
    details: {
      client_id: data.client_id,
      scopes: data.scopes,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
    },
  });
}

/**
 * Log token validation failure
 */
export async function logTokenValidationFailed(data: TokenAuditLog) {
  const supabase = getSupabaseClient();
  
  await supabase.from('audit_logs').insert({
    user_id: data.user_id || null,
    action: 'token.validation_failed',
    resource_type: 'oauth_token',
    resource_id: data.client_id,
    details: {
      client_id: data.client_id,
      error: data.error,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
    },
  });
}

/**
 * Get token statistics
 */
export async function getTokenStats(
  startDate: Date,
  endDate: Date,
  clientId?: string
) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.rpc('get_token_stats', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
    p_client_id: clientId || null,
  });
  
  if (error) throw error;
  return data[0];
}

/**
 * Get token activity (recent logs)
 */
export async function getTokenActivity(
  limit: number = 50,
  clientId?: string
) {
  const supabase = getSupabaseClient();
  
  let query = supabase
    .from('audit_logs')
    .select('*')
    .like('action', 'token.%')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (clientId) {
    query = query.eq('details->>client_id', clientId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
```

---

### Update Token Endpoint

**File**: `apps/identity-provider/app/api/sso/token/route.ts`

Add audit logging:

```typescript
import { 
  logTokenIssued, 
  logTokenRefreshed, 
  logTokenValidationFailed 
} from '@repo/database-identity';

export async function POST(request: Request) {
  const body = await request.json();
  const { grant_type, code, refresh_token, client_id, client_secret } = body;
  
  // Get IP and user agent
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  try {
    // ... existing validation ...
    
    if (grant_type === 'authorization_code') {
      // ... exchange code for tokens ...
      
      // LOG: Token issued
      await logTokenIssued({
        user_id: user.id,
        client_id,
        grant_type: 'authorization_code',
        scopes: tokens.scope?.split(' '),
        ip_address: ip,
        user_agent: userAgent,
      });
      
      return NextResponse.json(tokens);
    }
    
    if (grant_type === 'refresh_token') {
      // ... refresh tokens ...
      
      // LOG: Token refreshed
      await logTokenRefreshed({
        user_id: user.id,
        client_id,
        grant_type: 'refresh_token',
        scopes: newTokens.scope?.split(' '),
        ip_address: ip,
        user_agent: userAgent,
      });
      
      return NextResponse.json(newTokens);
    }
    
  } catch (error) {
    // LOG: Token validation failed
    await logTokenValidationFailed({
      client_id,
      grant_type,
      error: error.message,
      ip_address: ip,
      user_agent: userAgent,
    });
    
    throw error;
  }
}
```

---

### Update UserInfo Endpoint

**File**: `apps/identity-provider/app/api/oidc/userinfo/route.ts`

```typescript
import { logUserInfoAccessed } from '@repo/database-identity';

export async function GET(request: Request) {
  // ... existing code ...
  
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // LOG: UserInfo accessed
  await logUserInfoAccessed({
    user_id: user.id,
    client_id: tokenPayload.client_id,
    scopes: tokenPayload.scope?.split(' '),
    ip_address: ip,
    user_agent: userAgent,
  });
  
  return NextResponse.json(userInfo);
}
```

---

### Analytics Dashboard

**File**: `apps/identity-provider/app/(dashboard)/analytics/tokens/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { BarChart, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

export default function TokenAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/tokens?range=${dateRange}`);
      const data = await response.json();
      setStats(data.stats);
      setActivity(data.activity);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Token Analytics</h1>

      {/* Date Range Selector */}
      <div className="flex gap-2">
        {['7d', '30d', '90d'].map(range => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-4 py-2 rounded ${
              dateRange === range 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <BarChart className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Tokens Issued</p>
              <p className="text-2xl font-bold">{stats?.total_issued || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Tokens Refreshed</p>
              <p className="text-2xl font-bold">{stats?.total_refreshed || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Unique Users</p>
              <p className="text-2xl font-bold">{stats?.unique_users || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Failed Attempts</p>
              <p className="text-2xl font-bold">{stats?.total_failed || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Token Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activity.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      log.action.includes('failed') 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {log.details?.client_id || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {log.user_id || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {log.details?.ip_address || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

---

## 📝 Tasks

### Task 1: Database Functions (1 hour)
- [ ] Create token_analytics view
- [ ] Create get_token_stats function
- [ ] Test queries

### Task 2: Audit Functions (2 hours)
- [ ] Implement logTokenIssued
- [ ] Implement logTokenRefreshed
- [ ] Implement logUserInfoAccessed
- [ ] Implement logTokenValidationFailed
- [ ] Implement getTokenStats
- [ ] Implement getTokenActivity

### Task 3: Update Endpoints (2 hours)
- [ ] Add logging to /token endpoint
- [ ] Add logging to /userinfo endpoint
- [ ] Add logging to failed cases
- [ ] Test all cases

### Task 4: Analytics Dashboard (2 hours)
- [ ] Create analytics page
- [ ] Stats cards
- [ ] Activity table
- [ ] Date range filter
- [ ] Test UI

### Task 5: Testing (1 hour)
- [ ] Test audit logs creation
- [ ] Test analytics queries
- [ ] Test dashboard
- [ ] Verify all events logged

**Total**: 8 hours (~1 day)

---

## ✅ Definition of Done

- [ ] Database views/functions created
- [ ] Audit functions implemented
- [ ] All endpoints logging events
- [ ] Analytics dashboard working
- [ ] All tests passing
- [ ] Documentation complete

---

**Status**: 📝 Ready for Implementation  
**Phase**: 1.5
