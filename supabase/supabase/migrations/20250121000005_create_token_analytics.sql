-- ============================================
-- STORY-029: Token Audit Logging & Analytics
-- Migration: Create analytics views & functions
-- ============================================

-- ============================================
-- 1. TOKEN ANALYTICS VIEW
-- ============================================

CREATE OR REPLACE VIEW token_analytics AS
SELECT 
  DATE(created_at) as date,
  action,
  metadata->>'client_id' as client_id,
  metadata->>'grant_type' as grant_type,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_users
FROM audit_logs
WHERE action LIKE 'token.%'
GROUP BY DATE(created_at), action, metadata->>'client_id', metadata->>'grant_type';

COMMENT ON VIEW token_analytics IS 
  'Daily aggregated token statistics by action, client, and grant type';

-- ============================================
-- 2. TOKEN STATS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_token_stats(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_client_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  total_issued BIGINT,
  total_refreshed BIGINT,
  total_failed BIGINT,
  total_userinfo_accessed BIGINT,
  unique_users BIGINT,
  unique_clients BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE action LIKE 'token.issued.%') as total_issued,
    COUNT(*) FILTER (WHERE action = 'token.refreshed') as total_refreshed,
    COUNT(*) FILTER (WHERE action LIKE 'token.%failed%' OR action LIKE 'token.%expired%') as total_failed,
    COUNT(*) FILTER (WHERE action = 'token.userinfo_accessed') as total_userinfo_accessed,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT metadata->>'client_id') as unique_clients
  FROM audit_logs
  WHERE 
    action LIKE 'token.%'
    AND created_at >= p_start_date
    AND created_at <= p_end_date
    AND (p_client_id IS NULL OR metadata->>'client_id' = p_client_id);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_token_stats(TIMESTAMPTZ, TIMESTAMPTZ, TEXT) IS 
  'Get aggregated token statistics for a date range, optionally filtered by client_id';

-- ============================================
-- 3. TOKENS BY GRANT TYPE FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_tokens_by_grant_type(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_client_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  grant_type TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    metadata->>'grant_type' as grant_type,
    COUNT(*) as count
  FROM audit_logs
  WHERE 
    action LIKE 'token.issued.%'
    AND created_at >= p_start_date
    AND created_at <= p_end_date
    AND (p_client_id IS NULL OR metadata->>'client_id' = p_client_id)
  GROUP BY metadata->>'grant_type'
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_tokens_by_grant_type(TIMESTAMPTZ, TIMESTAMPTZ, TEXT) IS 
  'Get token counts grouped by grant type (authorization_code, refresh_token, client_credentials)';

-- ============================================
-- 4. TOKENS BY CLIENT FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_tokens_by_client(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  client_id TEXT,
  client_name TEXT,
  token_count BIGINT,
  unique_users BIGINT,
  last_used TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.metadata->>'client_id' as client_id,
    oc.name as client_name,
    COUNT(*) as token_count,
    COUNT(DISTINCT al.user_id) as unique_users,
    MAX(al.created_at) as last_used
  FROM audit_logs al
  LEFT JOIN oauth_clients oc ON oc.client_id = al.metadata->>'client_id'
  WHERE 
    al.action LIKE 'token.issued.%'
    AND al.created_at >= p_start_date
    AND al.created_at <= p_end_date
  GROUP BY al.metadata->>'client_id', oc.name
  ORDER BY token_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_tokens_by_client(TIMESTAMPTZ, TIMESTAMPTZ, INTEGER) IS 
  'Get top N clients by token issuance with their names and statistics';

-- ============================================
-- 5. FAILED TOKEN ATTEMPTS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_failed_token_attempts(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  created_at TIMESTAMPTZ,
  action TEXT,
  client_id TEXT,
  user_id UUID,
  error TEXT,
  ip_address TEXT,
  user_agent TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.created_at,
    al.action,
    al.metadata->>'client_id' as client_id,
    al.user_id,
    al.metadata->>'error' as error,
    al.ip_address,
    al.user_agent
  FROM audit_logs al
  WHERE 
    (al.action LIKE 'token.%failed%' OR al.action LIKE 'token.%expired%')
    AND al.created_at >= p_start_date
    AND al.created_at <= p_end_date
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_failed_token_attempts(TIMESTAMPTZ, TIMESTAMPTZ, INTEGER) IS 
  'Get recent failed token operations for security monitoring';

-- ============================================
-- 6. TOKEN ACTIVITY TIMELINE FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_token_activity_timeline(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_interval TEXT DEFAULT 'hour'
)
RETURNS TABLE (
  time_bucket TIMESTAMPTZ,
  issued_count BIGINT,
  refreshed_count BIGINT,
  failed_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    date_trunc(p_interval, created_at) as time_bucket,
    COUNT(*) FILTER (WHERE action LIKE 'token.issued.%') as issued_count,
    COUNT(*) FILTER (WHERE action = 'token.refreshed') as refreshed_count,
    COUNT(*) FILTER (WHERE action LIKE 'token.%failed%') as failed_count
  FROM audit_logs
  WHERE 
    action LIKE 'token.%'
    AND created_at >= p_start_date
    AND created_at <= p_end_date
  GROUP BY time_bucket
  ORDER BY time_bucket DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_token_activity_timeline(TIMESTAMPTZ, TIMESTAMPTZ, TEXT) IS 
  'Get time-series data for token operations (hour, day, week, month)';

-- ============================================
-- 7. MOST ACTIVE USERS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_most_active_users(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  token_count BIGINT,
  unique_clients BIGINT,
  last_active TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.user_id,
    u.email as user_email,
    u.name as user_name,
    COUNT(*) as token_count,
    COUNT(DISTINCT al.metadata->>'client_id') as unique_clients,
    MAX(al.created_at) as last_active
  FROM audit_logs al
  INNER JOIN users u ON u.id = al.user_id
  WHERE 
    al.action LIKE 'token.%'
    AND al.user_id IS NOT NULL
    AND al.created_at >= p_start_date
    AND al.created_at <= p_end_date
  GROUP BY al.user_id, u.email, u.name
  ORDER BY token_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_most_active_users(TIMESTAMPTZ, TIMESTAMPTZ, INTEGER) IS 
  'Get top N most active users by token operations';

-- ============================================
-- 8. SUSPICIOUS ACTIVITY DETECTION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION detect_suspicious_token_activity(
  p_lookback_hours INTEGER DEFAULT 1,
  p_failed_threshold INTEGER DEFAULT 5
)
RETURNS TABLE (
  ip_address TEXT,
  client_id TEXT,
  failed_attempts BIGINT,
  unique_users BIGINT,
  first_attempt TIMESTAMPTZ,
  last_attempt TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.ip_address,
    al.metadata->>'client_id' as client_id,
    COUNT(*) as failed_attempts,
    COUNT(DISTINCT al.user_id) as unique_users,
    MIN(al.created_at) as first_attempt,
    MAX(al.created_at) as last_attempt
  FROM audit_logs al
  WHERE 
    al.action LIKE 'token.%failed%'
    AND al.created_at >= now() - (p_lookback_hours || ' hours')::INTERVAL
  GROUP BY al.ip_address, al.metadata->>'client_id'
  HAVING COUNT(*) >= p_failed_threshold
  ORDER BY failed_attempts DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION detect_suspicious_token_activity(INTEGER, INTEGER) IS 
  'Detect suspicious patterns: multiple failed token attempts from same IP/client';

-- ============================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================

-- Index for token-related audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_token 
  ON audit_logs(action) 
  WHERE action LIKE 'token.%';

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at_token 
  ON audit_logs(created_at) 
  WHERE action LIKE 'token.%';

-- Index for client_id queries (JSONB)
CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata_client_id 
  ON audit_logs((metadata->>'client_id')) 
  WHERE action LIKE 'token.%';

-- Index for grant_type queries (JSONB)
CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata_grant_type 
  ON audit_logs((metadata->>'grant_type')) 
  WHERE action LIKE 'token.%';
