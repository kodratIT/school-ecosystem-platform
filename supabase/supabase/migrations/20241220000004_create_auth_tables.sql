-- ============================================
-- AUTH SUPPORT TABLES
-- ============================================
-- User sessions and OAuth accounts
-- Created: 2024-12-20
-- Story: STORY-013

-- ============================================
-- USER_SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session data
    token TEXT NOT NULL UNIQUE,
    refresh_token TEXT UNIQUE,
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
COMMENT ON TABLE user_sessions IS 'Active user sessions for tracking and management';

-- ============================================
-- OAUTH_ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- OAuth provider info
    provider VARCHAR(50) NOT NULL CHECK (
        provider IN ('google', 'microsoft', 'github', 'facebook')
    ),
    provider_account_id VARCHAR(255) NOT NULL,
    
    -- OAuth tokens
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    token_type VARCHAR(50),
    scope TEXT,
    
    -- Profile data from provider
    provider_profile JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(provider, provider_account_id)
);

CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX idx_oauth_accounts_provider ON oauth_accounts(provider);
COMMENT ON TABLE oauth_accounts IS 'OAuth provider accounts linked to users';

CREATE TRIGGER oauth_accounts_updated_at
    BEFORE UPDATE ON oauth_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_accounts ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only see their own sessions
CREATE POLICY "Users can view own sessions"
    ON user_sessions FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions"
    ON user_sessions FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- RLS: Users can only see their own OAuth accounts
CREATE POLICY "Users can view own oauth accounts"
    ON oauth_accounts FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own oauth accounts"
    ON oauth_accounts FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- RLS: Super admins can see all
CREATE POLICY "Super admins can view all sessions"
    ON user_sessions FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Super admins can view all oauth accounts"
    ON oauth_accounts FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );
