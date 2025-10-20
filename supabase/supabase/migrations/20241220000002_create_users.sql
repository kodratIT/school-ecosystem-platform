-- ============================================
-- USERS TABLE - All System Users
-- ============================================
-- Central user table for authentication
-- Created: 2024-12-20
-- Story: STORY-013

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    
    -- Authentication
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    email_verified_at TIMESTAMPTZ,
    password_hash TEXT,
    
    -- Profile
    name VARCHAR(255) NOT NULL,
    given_name VARCHAR(100),
    family_name VARCHAR(100),
    avatar TEXT,
    phone VARCHAR(20),
    phone_verified BOOLEAN NOT NULL DEFAULT false,
    
    -- Role
    role VARCHAR(50) NOT NULL CHECK (
        role IN ('super_admin', 'school_admin', 'teacher', 'student', 'parent', 'finance_staff', 'staff')
    ),
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_banned BOOLEAN NOT NULL DEFAULT false,
    banned_reason TEXT,
    banned_at TIMESTAMPTZ,
    
    -- Login tracking
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    login_count INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    locale VARCHAR(10) DEFAULT 'id_ID',
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Trigger
CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS: View own profile
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- RLS: Super admins see all
CREATE POLICY "Super admins view all users"
    ON users FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.id = auth.uid() AND u.role = 'super_admin'
        )
    );

-- RLS: School admins see school users
CREATE POLICY "School admins view school users"
    ON users FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users AS u
            WHERE u.id = auth.uid()
            AND u.role = 'school_admin'
            AND u.school_id = users.school_id
        )
    );

-- Comments
COMMENT ON TABLE users IS 'Central user table for authentication across all schools';
COMMENT ON COLUMN users.role IS 'Primary role: super_admin, school_admin, teacher, student, parent, etc';
