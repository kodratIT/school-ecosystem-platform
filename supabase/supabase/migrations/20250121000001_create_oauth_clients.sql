-- ============================================
-- CREATE OAUTH CLIENTS TABLE
-- ============================================
-- OAuth 2.0 / OIDC client registration
-- Created: 2025-01-21
-- Story: STORY-025

-- ============================================
-- OAUTH CLIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Client credentials
    client_id VARCHAR(255) UNIQUE NOT NULL DEFAULT 'client_' || gen_random_uuid()::text,
    client_secret_hash VARCHAR(255) NOT NULL,
    
    -- Client information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    homepage_url TEXT,
    
    -- OAuth configuration
    redirect_uris TEXT[] NOT NULL DEFAULT '{}',
    post_logout_redirect_uris TEXT[] DEFAULT '{}',
    allowed_scopes TEXT[] DEFAULT '{openid,profile,email}',
    grant_types TEXT[] DEFAULT '{authorization_code,refresh_token}',
    response_types TEXT[] DEFAULT '{code}',
    
    -- Token settings (in seconds)
    access_token_lifetime INTEGER DEFAULT 900, -- 15 minutes
    refresh_token_lifetime INTEGER DEFAULT 2592000, -- 30 days
    id_token_lifetime INTEGER DEFAULT 3600, -- 1 hour
    
    -- Security settings
    require_pkce BOOLEAN DEFAULT false,
    require_consent BOOLEAN DEFAULT true,
    trusted BOOLEAN DEFAULT false, -- Skip consent if true
    
    -- Client type
    is_confidential BOOLEAN DEFAULT true, -- true = can keep secrets (server-side), false = public (SPA/mobile)
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_redirect_uris CHECK (array_length(redirect_uris, 1) > 0),
    CONSTRAINT valid_token_lifetime CHECK (
        access_token_lifetime > 0 AND
        refresh_token_lifetime > 0 AND
        id_token_lifetime > 0
    ),
    CONSTRAINT valid_grant_types CHECK (array_length(grant_types, 1) > 0),
    CONSTRAINT valid_response_types CHECK (array_length(response_types, 1) > 0)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_oauth_clients_client_id ON oauth_clients(client_id);
CREATE INDEX idx_oauth_clients_is_active ON oauth_clients(is_active);
CREATE INDEX idx_oauth_clients_created_by ON oauth_clients(created_by);
CREATE INDEX idx_oauth_clients_created_at ON oauth_clients(created_at DESC);
CREATE INDEX idx_oauth_clients_name ON oauth_clients(name);

-- ============================================
-- TRIGGER FOR UPDATED_AT
-- ============================================
-- Reuse the update_updated_at_column function from previous migrations
CREATE TRIGGER update_oauth_clients_updated_at
    BEFORE UPDATE ON oauth_clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE oauth_clients ENABLE ROW LEVEL SECURITY;

-- Super admins can do everything
CREATE POLICY oauth_clients_super_admin_all
    ON oauth_clients
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- All authenticated users can read active clients (for SSO flow)
CREATE POLICY oauth_clients_read_active
    ON oauth_clients
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Service role bypass RLS (for server-side operations)
CREATE POLICY oauth_clients_service_role_all
    ON oauth_clients
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE oauth_clients IS 'OAuth 2.0 / OIDC registered clients (Service Providers)';
COMMENT ON COLUMN oauth_clients.id IS 'Primary key UUID';
COMMENT ON COLUMN oauth_clients.client_id IS 'Public client identifier (OAuth client_id)';
COMMENT ON COLUMN oauth_clients.client_secret_hash IS 'Bcrypt hashed client secret (never store plain text)';
COMMENT ON COLUMN oauth_clients.name IS 'Application name shown to users';
COMMENT ON COLUMN oauth_clients.description IS 'Optional description of the application';
COMMENT ON COLUMN oauth_clients.logo_url IS 'URL to application logo';
COMMENT ON COLUMN oauth_clients.homepage_url IS 'Application homepage URL';
COMMENT ON COLUMN oauth_clients.redirect_uris IS 'Allowed redirect URIs for OAuth flow (exact match)';
COMMENT ON COLUMN oauth_clients.post_logout_redirect_uris IS 'Allowed URIs after logout';
COMMENT ON COLUMN oauth_clients.allowed_scopes IS 'Scopes this client is allowed to request';
COMMENT ON COLUMN oauth_clients.grant_types IS 'Allowed OAuth grant types';
COMMENT ON COLUMN oauth_clients.response_types IS 'Allowed OAuth response types';
COMMENT ON COLUMN oauth_clients.access_token_lifetime IS 'Access token lifetime in seconds';
COMMENT ON COLUMN oauth_clients.refresh_token_lifetime IS 'Refresh token lifetime in seconds';
COMMENT ON COLUMN oauth_clients.id_token_lifetime IS 'ID token lifetime in seconds';
COMMENT ON COLUMN oauth_clients.require_pkce IS 'Require PKCE (Proof Key for Code Exchange) for authorization code flow';
COMMENT ON COLUMN oauth_clients.require_consent IS 'Show consent screen to users';
COMMENT ON COLUMN oauth_clients.trusted IS 'If true, skip consent screen (first-party apps only)';
COMMENT ON COLUMN oauth_clients.is_confidential IS 'True for server-side apps that can keep secrets, false for public clients (SPA/mobile)';
COMMENT ON COLUMN oauth_clients.is_active IS 'Client active status (inactive clients cannot authenticate)';
COMMENT ON COLUMN oauth_clients.created_by IS 'User who created this client';
COMMENT ON COLUMN oauth_clients.created_at IS 'Timestamp when client was created';
COMMENT ON COLUMN oauth_clients.updated_at IS 'Timestamp of last update';
COMMENT ON COLUMN oauth_clients.last_used_at IS 'Timestamp of last successful authentication';

-- ============================================
-- SEED DATA (Optional - Example Clients)
-- ============================================
-- Uncomment if you want to create example clients

-- Example: PPDB Application (Service Provider)
-- INSERT INTO oauth_clients (
--     client_id,
--     client_secret_hash,
--     name,
--     description,
--     homepage_url,
--     redirect_uris,
--     allowed_scopes,
--     trusted,
--     created_by
-- ) VALUES (
--     'ppdb-app-client',
--     '$2a$10$example.hash.here', -- Replace with actual bcrypt hash
--     'PPDB Application',
--     'Student registration and admission system',
--     'http://localhost:3001',
--     ARRAY['http://localhost:3001/api/auth/callback'],
--     ARRAY['openid', 'profile', 'email', 'school'],
--     true, -- Trusted first-party app
--     (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1)
-- );

-- ============================================
-- MIGRATION VERIFICATION
-- ============================================
-- Verify table created successfully
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'oauth_clients') THEN
        RAISE EXCEPTION 'oauth_clients table was not created';
    END IF;
    
    RAISE NOTICE 'oauth_clients table created successfully';
END $$;
