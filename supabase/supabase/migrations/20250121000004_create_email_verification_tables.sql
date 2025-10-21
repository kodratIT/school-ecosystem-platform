-- ============================================
-- STORY-028: Email Verification Resend
-- Migration: Create email verification tables
-- ============================================

-- ============================================
-- 1. EMAIL VERIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '48 hours'),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_email_verifications_token ON email_verifications(token) 
  WHERE verified_at IS NULL;

CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);

CREATE INDEX idx_email_verifications_expires_at ON email_verifications(expires_at)
  WHERE verified_at IS NULL;

-- Comments
COMMENT ON TABLE email_verifications IS 'Email verification tokens for user registration';
COMMENT ON COLUMN email_verifications.token IS 'Unique UUID token sent in verification email';
COMMENT ON COLUMN email_verifications.expires_at IS 'Token expiration (48 hours from creation)';
COMMENT ON COLUMN email_verifications.verified_at IS 'Timestamp when token was used';

-- ============================================
-- 2. EMAIL RESEND ATTEMPTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS email_resend_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for rate limiting queries
CREATE INDEX idx_email_resend_attempts_email 
  ON email_resend_attempts(email, attempted_at);

CREATE INDEX idx_email_resend_attempts_ip 
  ON email_resend_attempts(ip_address, attempted_at);

-- Comments
COMMENT ON TABLE email_resend_attempts IS 'Track email verification resend attempts for rate limiting';
COMMENT ON COLUMN email_resend_attempts.ip_address IS 'Client IP address for IP-based rate limiting';
COMMENT ON COLUMN email_resend_attempts.attempted_at IS 'Timestamp of resend request';

-- ============================================
-- 3. AUTO-UPDATE TIMESTAMP TRIGGER
-- ============================================

CREATE TRIGGER update_email_verifications_updated_at
  BEFORE UPDATE ON email_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. CLEANUP FUNCTIONS
-- ============================================

-- Cleanup old email resend attempts (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_email_resend_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM email_resend_attempts
  WHERE attempted_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_email_resend_attempts() IS 
  'Remove email resend attempts older than 24 hours. Run daily via cron.';

-- Cleanup expired verification tokens (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_expired_email_verifications()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verifications
  WHERE expires_at < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_email_verifications() IS 
  'Remove expired email verification tokens older than 7 days. Run daily via cron.';

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_resend_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own verification records
CREATE POLICY email_verifications_select_own 
  ON email_verifications
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Policy: Service role can do anything
CREATE POLICY email_verifications_service_full 
  ON email_verifications
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY email_resend_attempts_service_full 
  ON email_resend_attempts
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 6. HELPER FUNCTION: Get Active Verification Token
-- ============================================

CREATE OR REPLACE FUNCTION get_active_verification_token(p_user_id UUID)
RETURNS TABLE (
  token UUID,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ev.token,
    ev.expires_at,
    ev.created_at
  FROM email_verifications ev
  WHERE ev.user_id = p_user_id
    AND ev.verified_at IS NULL
    AND ev.expires_at > now()
  ORDER BY ev.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_active_verification_token(UUID) IS 
  'Get the most recent active (unused, not expired) verification token for a user';
