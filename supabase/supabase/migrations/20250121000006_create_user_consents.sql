-- ============================================================================
-- STORY-030: OAuth Consent Screen - User Consents System
-- ============================================================================
-- Description: User consent management for OAuth applications
-- Author: AI Assistant
-- Date: 2025-01-21
-- ============================================================================

-- ============================================================================
-- 1. USER CONSENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  
  -- Constraints
  CONSTRAINT user_consents_scopes_not_empty CHECK (array_length(scopes, 1) > 0),
  CONSTRAINT unique_user_client_consent UNIQUE(user_id, client_id)
);

-- Add comments
COMMENT ON TABLE user_consents IS 'Stores user consent decisions for OAuth applications';
COMMENT ON COLUMN user_consents.user_id IS 'User who granted consent';
COMMENT ON COLUMN user_consents.client_id IS 'OAuth client that received consent';
COMMENT ON COLUMN user_consents.scopes IS 'Array of granted scopes';
COMMENT ON COLUMN user_consents.granted_at IS 'When consent was first granted';
COMMENT ON COLUMN user_consents.last_used_at IS 'Last time the consent was used';
COMMENT ON COLUMN user_consents.revoked_at IS 'When consent was revoked (NULL if active)';
COMMENT ON COLUMN user_consents.ip_address IS 'IP address when consent was granted';
COMMENT ON COLUMN user_consents.user_agent IS 'User agent when consent was granted';

-- ============================================================================
-- 2. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_consents_user_id 
  ON user_consents(user_id) 
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_consents_client_id 
  ON user_consents(client_id) 
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_consents_granted_at 
  ON user_consents(granted_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_consents_revoked_at 
  ON user_consents(revoked_at) 
  WHERE revoked_at IS NOT NULL;

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS user_consents_select_own ON user_consents;
DROP POLICY IF EXISTS user_consents_insert_own ON user_consents;
DROP POLICY IF EXISTS user_consents_update_own ON user_consents;
DROP POLICY IF EXISTS user_consents_delete_own ON user_consents;
DROP POLICY IF EXISTS user_consents_select_admin ON user_consents;

-- Users can view their own consents
CREATE POLICY user_consents_select_own ON user_consents
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'school_admin')
    )
  );

-- Users can insert their own consents
CREATE POLICY user_consents_insert_own ON user_consents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own consents
CREATE POLICY user_consents_update_own ON user_consents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete (revoke) their own consents
CREATE POLICY user_consents_delete_own ON user_consents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all consents
CREATE POLICY user_consents_select_admin ON user_consents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'school_admin')
    )
  );

-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

-- Function: Check if consent is needed
CREATE OR REPLACE FUNCTION needs_consent(
  p_user_id UUID,
  p_client_id TEXT,
  p_requested_scopes TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE
  v_consent RECORD;
  v_client RECORD;
BEGIN
  -- Check if client exists and requires consent
  SELECT * INTO v_client
  FROM oauth_clients
  WHERE client_id = p_client_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Client not found: %', p_client_id;
  END IF;
  
  -- If client doesn't require consent (trusted app), return FALSE
  IF v_client.require_consent = FALSE THEN
    RETURN FALSE;
  END IF;
  
  -- Get existing active consent
  SELECT * INTO v_consent
  FROM user_consents
  WHERE user_id = p_user_id
    AND client_id = p_client_id
    AND revoked_at IS NULL;
  
  -- No consent exists
  IF NOT FOUND THEN
    RETURN TRUE;
  END IF;
  
  -- Check if all requested scopes are already granted
  -- p_requested_scopes <@ v_consent.scopes means "is subset of"
  IF p_requested_scopes <@ v_consent.scopes THEN
    RETURN FALSE; -- All scopes granted, no consent needed
  ELSE
    RETURN TRUE; -- New scopes requested, need consent
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION needs_consent IS 'Check if user consent is needed for OAuth client and scopes';

-- Function: Grant user consent
CREATE OR REPLACE FUNCTION grant_user_consent(
  p_user_id UUID,
  p_client_id TEXT,
  p_scopes TEXT[],
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_consent_id UUID;
BEGIN
  -- Insert or update consent
  INSERT INTO user_consents (
    user_id,
    client_id,
    scopes,
    granted_at,
    last_used_at,
    revoked_at,
    ip_address,
    user_agent
  )
  VALUES (
    p_user_id,
    p_client_id,
    p_scopes,
    now(),
    now(),
    NULL,
    p_ip_address,
    p_user_agent
  )
  ON CONFLICT (user_id, client_id) DO UPDATE SET
    scopes = EXCLUDED.scopes,
    granted_at = now(),
    last_used_at = now(),
    revoked_at = NULL,
    ip_address = EXCLUDED.ip_address,
    user_agent = EXCLUDED.user_agent
  RETURNING id INTO v_consent_id;
  
  RETURN v_consent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION grant_user_consent IS 'Grant user consent for OAuth client';

-- Function: Update consent last used
CREATE OR REPLACE FUNCTION update_consent_last_used(
  p_user_id UUID,
  p_client_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_consents
  SET last_used_at = now()
  WHERE user_id = p_user_id
    AND client_id = p_client_id
    AND revoked_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_consent_last_used IS 'Update last_used_at timestamp for consent';

-- Function: Revoke user consent
CREATE OR REPLACE FUNCTION revoke_user_consent(
  p_user_id UUID,
  p_client_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_consents
  SET revoked_at = now()
  WHERE user_id = p_user_id
    AND client_id = p_client_id
    AND revoked_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION revoke_user_consent IS 'Revoke user consent for OAuth client';

-- Function: Get user consents
CREATE OR REPLACE FUNCTION get_user_consents(
  p_user_id UUID,
  p_include_revoked BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  client_id TEXT,
  client_name TEXT,
  client_description TEXT,
  client_logo_url TEXT,
  scopes TEXT[],
  granted_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.id,
    uc.user_id,
    uc.client_id,
    oc.name AS client_name,
    oc.description AS client_description,
    oc.logo_url AS client_logo_url,
    uc.scopes,
    uc.granted_at,
    uc.last_used_at,
    uc.revoked_at
  FROM user_consents uc
  JOIN oauth_clients oc ON uc.client_id = oc.client_id
  WHERE uc.user_id = p_user_id
    AND (p_include_revoked OR uc.revoked_at IS NULL)
  ORDER BY uc.granted_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_consents IS 'Get all consents for a user with client details';

-- Function: Get consent by ID
CREATE OR REPLACE FUNCTION get_consent_by_id(
  p_consent_id UUID
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  client_id TEXT,
  client_name TEXT,
  client_description TEXT,
  client_logo_url TEXT,
  scopes TEXT[],
  granted_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.id,
    uc.user_id,
    uc.client_id,
    oc.name AS client_name,
    oc.description AS client_description,
    oc.logo_url AS client_logo_url,
    uc.scopes,
    uc.granted_at,
    uc.last_used_at,
    uc.revoked_at
  FROM user_consents uc
  JOIN oauth_clients oc ON uc.client_id = oc.client_id
  WHERE uc.id = p_consent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_consent_by_id IS 'Get consent details by ID';

-- ============================================================================
-- 5. TRIGGER: Update last_used_at on authorization
-- ============================================================================

CREATE OR REPLACE FUNCTION update_consent_on_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Update consent last_used_at when authorization code is created
  UPDATE user_consents
  SET last_used_at = now()
  WHERE user_id = NEW.user_id
    AND client_id = NEW.client_id
    AND revoked_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_consent_on_auth ON authorization_codes;

CREATE TRIGGER trigger_update_consent_on_auth
  AFTER INSERT ON authorization_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_consent_on_auth();

COMMENT ON TRIGGER trigger_update_consent_on_auth ON authorization_codes IS 'Update consent last_used_at when auth code is created';

-- ============================================================================
-- 6. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON user_consents TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_consents') = 1,
    'user_consents table not created';
  
  RAISE NOTICE '✅ STORY-030 Migration Complete: User Consents System';
  RAISE NOTICE '   - user_consents table created';
  RAISE NOTICE '   - 4 indexes created';
  RAISE NOTICE '   - 5 RLS policies created';
  RAISE NOTICE '   - 6 functions created';
  RAISE NOTICE '   - 1 trigger created';
END $$;
