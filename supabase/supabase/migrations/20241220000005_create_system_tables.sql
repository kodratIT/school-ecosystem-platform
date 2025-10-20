-- ============================================
-- SYSTEM TABLES
-- ============================================
-- Audit logs, preferences, and system settings
-- Created: 2024-12-20
-- Story: STORY-013

-- ============================================
-- AUDIT_LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    
    -- Action details
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    
    -- Change tracking
    old_values JSONB,
    new_values JSONB,
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_school_id ON audit_logs(school_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
COMMENT ON TABLE audit_logs IS 'System audit trail for compliance and debugging';

-- ============================================
-- USER_PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- UI preferences
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language VARCHAR(5) DEFAULT 'id',
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    
    -- Custom settings
    settings JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
COMMENT ON TABLE user_preferences IS 'User-specific preferences and settings';

CREATE TRIGGER user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SYSTEM_SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    
    -- Setting key-value
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    
    -- Metadata
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(school_id, key)
);

CREATE INDEX idx_system_settings_school_id ON system_settings(school_id);
CREATE INDEX idx_system_settings_key ON system_settings(key);
COMMENT ON TABLE system_settings IS 'School-specific and global system settings';
COMMENT ON COLUMN system_settings.school_id IS 'NULL for global settings';

CREATE TRIGGER system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS: Audit logs - super admins only
CREATE POLICY "Super admins can view audit logs"
    ON audit_logs FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "School admins can view school audit logs"
    ON audit_logs FOR SELECT TO authenticated
    USING (
        school_id IN (
            SELECT school_id FROM users WHERE id = auth.uid() AND role = 'school_admin'
        )
    );

-- RLS: User preferences - own only
CREATE POLICY "Users can manage own preferences"
    ON user_preferences FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- RLS: System settings
CREATE POLICY "Authenticated users can view public settings"
    ON system_settings FOR SELECT TO authenticated
    USING (is_public = true);

CREATE POLICY "Admins can manage settings"
    ON system_settings FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (
                role = 'super_admin' 
                OR (role = 'school_admin' AND school_id = system_settings.school_id)
            )
        )
    );
