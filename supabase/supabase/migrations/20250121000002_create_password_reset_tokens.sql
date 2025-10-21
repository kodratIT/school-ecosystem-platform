-- =====================================================
-- Migration: Create Password Reset Tokens Table
-- Story: STORY-026 - Password Reset Flow
-- Description: Table for managing password reset tokens
-- Author: System
-- Date: 2025-01-21
-- =====================================================

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_password_reset_tokens_token 
  ON password_reset_tokens(token) 
  WHERE used_at IS NULL;

CREATE INDEX idx_password_reset_tokens_user_id 
  ON password_reset_tokens(user_id);

CREATE INDEX idx_password_reset_tokens_expires_at 
  ON password_reset_tokens(expires_at);

-- Add comment on table
COMMENT ON TABLE password_reset_tokens IS 'Stores password reset tokens with expiration and usage tracking';
COMMENT ON COLUMN password_reset_tokens.token IS 'Unique UUID token sent to user email';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Token expiration time (typically 1 hour from creation)';
COMMENT ON COLUMN password_reset_tokens.used_at IS 'Timestamp when token was used (null if unused)';
COMMENT ON COLUMN password_reset_tokens.ip_address IS 'IP address from which reset was requested';
COMMENT ON COLUMN password_reset_tokens.user_agent IS 'User agent string from reset request';

-- Create function to cleanup expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete expired or used tokens
  DELETE FROM password_reset_tokens
  WHERE expires_at < now() OR used_at IS NOT NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment on function
COMMENT ON FUNCTION cleanup_expired_password_reset_tokens() IS 'Cleans up expired and used password reset tokens. Returns count of deleted tokens.';

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_password_reset_tokens_updated_at
  BEFORE UPDATE ON password_reset_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admin can view all tokens
CREATE POLICY "Admins can view all password reset tokens"
  ON password_reset_tokens
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

-- System/service can manage all tokens (for API operations)
CREATE POLICY "Service role can manage password reset tokens"
  ON password_reset_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON password_reset_tokens TO authenticated;
GRANT ALL ON password_reset_tokens TO service_role;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION cleanup_expired_password_reset_tokens() TO service_role;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO service_role;
