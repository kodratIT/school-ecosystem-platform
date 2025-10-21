-- ============================================================================
-- STORY-031: End Session / Single Logout - Session Management
-- ============================================================================
-- Description: User session tracking and single logout support
-- Author: AI Assistant
-- Date: 2025-01-21
-- ============================================================================

-- ============================================================================
-- 1. ADD LOGOUT URIs TO OAUTH CLIENTS
-- ============================================================================

-- Add logout redirect URIs columns
ALTER TABLE oauth_clients
ADD COLUMN IF NOT EXISTS post_logout_redirect_uris JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS front_channel_logout_uri TEXT,
ADD COLUMN IF NOT EXISTS back_channel_logout_uri TEXT;

-- Add comments
COMMENT ON COLUMN oauth_clients.post_logout_redirect_uris IS 'Array of allowed post-logout redirect URIs (OIDC RP-Initiated Logout)';
COMMENT ON COLUMN oauth_clients.front_channel_logout_uri IS 'Front-channel logout URI (loaded in iframe)';
COMMENT ON COLUMN oauth_clients.back_channel_logout_uri IS 'Back-channel logout URI (HTTP POST)';

-- ============================================================================
-- 2. USER SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES oauth_clients(client_id) ON DELETE SET NULL,
  session_token TEXT NOT NULL UNIQUE,
  
  -- Session metadata
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(20), -- 'desktop', 'mobile', 'tablet', 'unknown'
  device_name TEXT,
  browser TEXT,
  os TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  terminated_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT user_sessions_device_type_check CHECK (
    device_type IN ('desktop', 'mobile', 'tablet', 'unknown')
  )
);

-- Add comments
COMMENT ON TABLE user_sessions IS 'Active user sessions for single logout and session management';
COMMENT ON COLUMN user_sessions.session_token IS 'Unique session identifier (from cookie or token)';
COMMENT ON COLUMN user_sessions.client_id IS 'OAuth client that initiated the session';
COMMENT ON COLUMN user_sessions.device_type IS 'Device type: desktop, mobile, tablet, unknown';
COMMENT ON COLUMN user_sessions.last_activity_at IS 'Last activity timestamp (updated on token refresh)';
COMMENT ON COLUMN user_sessions.terminated_at IS 'When session was terminated (NULL if active)';

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
  ON user_sessions(user_id) 
  WHERE terminated_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_sessions_token 
  ON user_sessions(session_token) 
  WHERE terminated_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_sessions_expires 
  ON user_sessions(expires_at)
  WHERE terminated_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_sessions_client_id 
  ON user_sessions(client_id)
  WHERE terminated_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity 
  ON user_sessions(last_activity_at DESC)
  WHERE terminated_at IS NULL;

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS user_sessions_select_own ON user_sessions;
DROP POLICY IF EXISTS user_sessions_insert_own ON user_sessions;
DROP POLICY IF EXISTS user_sessions_update_own ON user_sessions;
DROP POLICY IF EXISTS user_sessions_delete_own ON user_sessions;
DROP POLICY IF EXISTS user_sessions_admin_all ON user_sessions;

-- Users can view their own sessions
CREATE POLICY user_sessions_select_own ON user_sessions
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'school_admin')
    )
  );

-- System can insert sessions
CREATE POLICY user_sessions_insert_own ON user_sessions
  FOR INSERT
  WITH CHECK (true); -- Allow system to create sessions

-- Users can update their own sessions
CREATE POLICY user_sessions_update_own ON user_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY user_sessions_delete_own ON user_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can manage all sessions
CREATE POLICY user_sessions_admin_all ON user_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'school_admin')
    )
  );

-- ============================================================================
-- 5. SESSION MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function: Get active sessions for user
CREATE OR REPLACE FUNCTION get_active_sessions(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  client_id TEXT,
  client_name TEXT,
  client_logo_url TEXT,
  session_token TEXT,
  device_type VARCHAR(20),
  device_name TEXT,
  browser TEXT,
  os TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.client_id,
    c.name AS client_name,
    c.logo_url AS client_logo_url,
    s.session_token,
    s.device_type,
    s.device_name,
    s.browser,
    s.os,
    s.ip_address,
    s.created_at,
    s.last_activity_at,
    s.expires_at
  FROM user_sessions s
  LEFT JOIN oauth_clients c ON s.client_id = c.client_id
  WHERE s.user_id = p_user_id
    AND s.terminated_at IS NULL
    AND s.expires_at > now()
  ORDER BY s.last_activity_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_active_sessions IS 'Get all active sessions for a user with client details';

-- Function: Create user session
CREATE OR REPLACE FUNCTION create_user_session(
  p_user_id UUID,
  p_client_id TEXT,
  p_session_token TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_device_type VARCHAR(20) DEFAULT 'unknown',
  p_device_name TEXT DEFAULT NULL,
  p_browser TEXT DEFAULT NULL,
  p_os TEXT DEFAULT NULL,
  p_expires_in_seconds INTEGER DEFAULT 86400
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
BEGIN
  INSERT INTO user_sessions (
    user_id,
    client_id,
    session_token,
    ip_address,
    user_agent,
    device_type,
    device_name,
    browser,
    os,
    expires_at
  )
  VALUES (
    p_user_id,
    p_client_id,
    p_session_token,
    p_ip_address,
    p_user_agent,
    p_device_type,
    p_device_name,
    p_browser,
    p_os,
    now() + (p_expires_in_seconds || ' seconds')::interval
  )
  RETURNING id INTO v_session_id;
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_user_session IS 'Create new user session with device info';

-- Function: Update session activity
CREATE OR REPLACE FUNCTION update_session_activity(
  p_session_token TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_sessions
  SET last_activity_at = now()
  WHERE session_token = p_session_token
    AND terminated_at IS NULL
    AND expires_at > now();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_session_activity IS 'Update last_activity_at for a session';

-- Function: Terminate session by token
CREATE OR REPLACE FUNCTION terminate_session(
  p_session_token TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_sessions
  SET terminated_at = now()
  WHERE session_token = p_session_token
    AND terminated_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION terminate_session IS 'Terminate a session by token';

-- Function: Terminate all sessions for user
CREATE OR REPLACE FUNCTION terminate_user_sessions(
  p_user_id UUID,
  p_except_token TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE user_sessions
  SET terminated_at = now()
  WHERE user_id = p_user_id
    AND terminated_at IS NULL
    AND (p_except_token IS NULL OR session_token != p_except_token);
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION terminate_user_sessions IS 'Terminate all sessions for a user, optionally except one';

-- Function: Terminate session by ID
CREATE OR REPLACE FUNCTION terminate_session_by_id(
  p_session_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_sessions
  SET terminated_at = now()
  WHERE id = p_session_id
    AND user_id = p_user_id
    AND terminated_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION terminate_session_by_id IS 'Terminate a specific session by ID (with user verification)';

-- Function: Clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE user_sessions
  SET terminated_at = now()
  WHERE terminated_at IS NULL
    AND expires_at < now();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION clean_expired_sessions IS 'Mark expired sessions as terminated (for cleanup job)';

-- Function: Get session by token
CREATE OR REPLACE FUNCTION get_session_by_token(
  p_session_token TEXT
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  client_id TEXT,
  created_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.user_id,
    s.client_id,
    s.created_at,
    s.last_activity_at,
    s.expires_at
  FROM user_sessions s
  WHERE s.session_token = p_session_token
    AND s.terminated_at IS NULL
    AND s.expires_at > now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_session_by_token IS 'Get session details by token';

-- Function: Get clients with active sessions for user
CREATE OR REPLACE FUNCTION get_user_session_clients(
  p_user_id UUID
)
RETURNS TABLE (
  client_id TEXT,
  client_name TEXT,
  front_channel_logout_uri TEXT,
  back_channel_logout_uri TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    c.client_id,
    c.name AS client_name,
    c.front_channel_logout_uri,
    c.back_channel_logout_uri
  FROM user_sessions s
  JOIN oauth_clients c ON s.client_id = c.client_id
  WHERE s.user_id = p_user_id
    AND s.terminated_at IS NULL
    AND s.expires_at > now()
    AND (c.front_channel_logout_uri IS NOT NULL OR c.back_channel_logout_uri IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_session_clients IS 'Get clients with logout URIs for front/back channel logout';

-- ============================================================================
-- 6. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_sessions') = 1,
    'user_sessions table not created';
  
  ASSERT (SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_name = 'oauth_clients' AND column_name = 'post_logout_redirect_uris') = 1,
    'post_logout_redirect_uris column not added';
  
  RAISE NOTICE '✅ STORY-031 Migration Complete: User Sessions & Logout URIs';
  RAISE NOTICE '   - oauth_clients: Added 3 logout URI columns';
  RAISE NOTICE '   - user_sessions table created';
  RAISE NOTICE '   - 5 indexes created';
  RAISE NOTICE '   - 5 RLS policies created';
  RAISE NOTICE '   - 9 session management functions created';
END $$;
