-- =====================================================
-- Migration: Create Authorization Codes Table
-- Story: STORY-027 - PKCE Support
-- Description: Table for storing OAuth authorization codes with PKCE support
-- Author: System
-- Date: 2025-01-21
-- =====================================================

-- Create authorization_codes table
CREATE TABLE IF NOT EXISTS authorization_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  client_id TEXT NOT NULL REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  redirect_uri TEXT NOT NULL,
  scope TEXT[] DEFAULT '{}',
  
  -- PKCE Support
  code_challenge TEXT,
  code_challenge_method VARCHAR(10) DEFAULT 'S256',
  
  -- Timestamps and usage tracking
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_authorization_codes_code 
  ON authorization_codes(code) 
  WHERE used_at IS NULL;

CREATE INDEX idx_authorization_codes_user_id 
  ON authorization_codes(user_id);

CREATE INDEX idx_authorization_codes_client_id 
  ON authorization_codes(client_id);

CREATE INDEX idx_authorization_codes_expires_at 
  ON authorization_codes(expires_at);

-- Comments
COMMENT ON TABLE authorization_codes IS 'Stores OAuth authorization codes with PKCE support';
COMMENT ON COLUMN authorization_codes.code IS 'Unique authorization code (UUID)';
COMMENT ON COLUMN authorization_codes.code_challenge IS 'PKCE code challenge (BASE64URL of SHA256(code_verifier))';
COMMENT ON COLUMN authorization_codes.code_challenge_method IS 'PKCE method: S256 (SHA-256) or plain';
COMMENT ON COLUMN authorization_codes.expires_at IS 'Code expiration time (typically 1 minute from creation)';
COMMENT ON COLUMN authorization_codes.used_at IS 'Timestamp when code was exchanged (null if unused)';

-- Validation constraints
ALTER TABLE authorization_codes
ADD CONSTRAINT chk_code_challenge_method 
CHECK (code_challenge_method IN ('S256', 'plain'));

-- Validation: code_challenge and method must both be present or both be null
ALTER TABLE authorization_codes
ADD CONSTRAINT chk_pkce_consistency
CHECK (
  (code_challenge IS NULL AND code_challenge_method IS NULL) OR
  (code_challenge IS NOT NULL AND code_challenge_method IS NOT NULL)
);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_authorization_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-update
CREATE TRIGGER update_authorization_codes_updated_at
  BEFORE UPDATE ON authorization_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_authorization_codes_updated_at();

-- Function to cleanup expired authorization codes
CREATE OR REPLACE FUNCTION cleanup_expired_authorization_codes()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete expired or used codes older than 5 minutes
  DELETE FROM authorization_codes
  WHERE expires_at < now() OR (used_at IS NOT NULL AND used_at < now() - INTERVAL '5 minutes');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_expired_authorization_codes() IS 'Cleans up expired and used authorization codes. Returns count of deleted codes.';

-- Enable Row Level Security
ALTER TABLE authorization_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can view all authorization codes
CREATE POLICY "Admins can view all authorization codes"
  ON authorization_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('Super Admin', 'School Admin')
    )
  );

-- Service role can manage all codes (for API operations)
CREATE POLICY "Service role can manage authorization codes"
  ON authorization_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view their own authorization codes
CREATE POLICY "Users can view their own authorization codes"
  ON authorization_codes
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Grant permissions
GRANT SELECT ON authorization_codes TO authenticated;
GRANT ALL ON authorization_codes TO service_role;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION cleanup_expired_authorization_codes() TO service_role;
GRANT EXECUTE ON FUNCTION update_authorization_codes_updated_at() TO service_role;
