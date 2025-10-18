# STORY-013: Implement Identity Database Schema

**Epic**: Phase 1 - Identity Provider  
**Sprint**: Week 3  
**Story Points**: 5  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **implement the complete Identity database schema in Supabase** so that **the Identity Provider can store users, schools, roles, permissions, and audit logs with proper Row Level Security**.

This is the foundation database for the entire ecosystem's authentication and authorization system.

---

## 🎯 Goals

- Create Identity database in Supabase
- Implement all 11 tables with proper relationships
- Setup Row Level Security (RLS) policies
- Create database indexes for performance
- Setup triggers for audit logging
- Create database functions for common operations
- Seed initial data (roles, permissions)

---

## ✅ Acceptance Criteria

- [ ] Supabase project created for Identity DB
- [ ] All 11 tables created:
  - schools
  - users
  - user_sessions
  - roles
  - permissions
  - role_permissions
  - user_roles
  - oauth_accounts
  - audit_logs
  - user_preferences
  - system_settings
- [ ] All RLS policies implemented
- [ ] Database indexes created
- [ ] Triggers for audit logging
- [ ] Initial seed data inserted
- [ ] Database documented with comments
- [ ] Connection tested from local

---

## 📋 Tasks

### Task 1: Create Supabase Project

```bash
# Go to https://app.supabase.com
# Create new project:
# - Name: "school-ecosystem-identity"
# - Region: Southeast Asia (Singapore)
# - Password: [Generate strong password]

# Save credentials to .env.local
```

**File:** `.env.local` (update)

```bash
# Identity Database
IDENTITY_DB_URL=https://xxxxx.supabase.co
IDENTITY_DB_SERVICE_KEY=eyJhbG...
NEXT_PUBLIC_IDENTITY_DB_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_IDENTITY_DB_ANON_KEY=eyJhbG...
```

---

### Task 2: Create Schools Table

**File:** `supabase/migrations/001_create_schools.sql`

```sql
-- ============================================
-- SCHOOLS TABLE
-- ============================================
-- Represents tenants in multi-tenant system
-- Each school is a separate organization

CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    logo TEXT,
    
    -- Official Info
    npsn VARCHAR(8) NOT NULL UNIQUE, -- Nomor Pokok Sekolah Nasional
    education_level VARCHAR(20) NOT NULL CHECK (
        education_level IN ('tk', 'sd', 'smp', 'sma', 'smk')
    ),
    
    -- Contact
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    website TEXT,
    
    -- Address
    address TEXT NOT NULL,
    village VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(5),
    
    -- Principal
    principal_name VARCHAR(255) NOT NULL,
    principal_phone VARCHAR(20) NOT NULL,
    
    -- Status & Subscription
    is_active BOOLEAN NOT NULL DEFAULT true,
    subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (
        subscription_tier IN ('free', 'basic', 'premium', 'enterprise')
    ),
    subscription_starts_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_schools_slug ON schools(slug);
CREATE INDEX idx_schools_npsn ON schools(npsn);
CREATE INDEX idx_schools_is_active ON schools(is_active);
CREATE INDEX idx_schools_deleted_at ON schools(deleted_at) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE schools IS 'Tenants - each school is a separate organization';
COMMENT ON COLUMN schools.npsn IS 'Nomor Pokok Sekolah Nasional - unique national school ID';
COMMENT ON COLUMN schools.slug IS 'URL-friendly identifier for school';
COMMENT ON COLUMN schools.subscription_tier IS 'Subscription level: free, basic, premium, enterprise';

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER schools_updated_at
    BEFORE UPDATE ON schools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

---

### Task 3: Create Users Table

**File:** `supabase/migrations/002_create_users.sql`

```sql
-- ============================================
-- USERS TABLE
-- ============================================
-- All users across all schools

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    
    -- Authentication
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    email_verified_at TIMESTAMPTZ,
    password_hash TEXT, -- NULL for OAuth-only users
    
    -- Profile
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    phone VARCHAR(20),
    
    -- Role (primary role)
    role VARCHAR(50) NOT NULL CHECK (
        role IN ('super_admin', 'school_admin', 'teacher', 'student', 'parent', 'finance_staff')
    ),
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_banned BOOLEAN NOT NULL DEFAULT false,
    banned_reason TEXT,
    banned_at TIMESTAMPTZ,
    
    -- Activity
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE users IS 'All users across the ecosystem';
COMMENT ON COLUMN users.school_id IS 'NULL for super_admin, otherwise required';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hash - NULL for OAuth-only users';
COMMENT ON COLUMN users.role IS 'Primary role - users can have multiple roles via user_roles table';

-- Updated at trigger
CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY users_select_own ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: School admins can read users in their school
CREATE POLICY users_select_school ON users
    FOR SELECT
    USING (
        school_id IN (
            SELECT school_id FROM users WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
        )
    );

-- Policy: Super admins can read all
CREATE POLICY users_select_super_admin ON users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
        )
    );
```

---

### Task 4: Create Sessions Table

**File:** `supabase/migrations/003_create_sessions.sql`

```sql
-- ============================================
-- USER SESSIONS TABLE
-- ============================================
-- Track active user sessions

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session Data
    token_hash TEXT NOT NULL UNIQUE,
    refresh_token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Device Info
    user_agent TEXT,
    ip_address INET,
    device_type VARCHAR(50), -- mobile, desktop, tablet
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_sessions_is_active ON user_sessions(is_active);

-- Comments
COMMENT ON TABLE user_sessions IS 'Active user sessions for tracking and invalidation';
COMMENT ON COLUMN user_sessions.token_hash IS 'SHA-256 hash of access token';
COMMENT ON COLUMN user_sessions.refresh_token_hash IS 'SHA-256 hash of refresh token';

-- Auto-delete expired sessions (run daily)
CREATE OR REPLACE FUNCTION delete_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY sessions_select_own ON user_sessions
    FOR SELECT
    USING (user_id = auth.uid());
```

---

### Task 5: Create Roles & Permissions Tables

**File:** `supabase/migrations/004_create_roles_permissions.sql`

```sql
-- ============================================
-- ROLES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    
    -- Scope
    is_system BOOLEAN NOT NULL DEFAULT false, -- System roles can't be deleted
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_roles_name ON roles(name);

COMMENT ON TABLE roles IS 'User roles for RBAC';
COMMENT ON COLUMN roles.is_system IS 'System roles cannot be modified or deleted';

CREATE TRIGGER roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- PERMISSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(50) NOT NULL, -- users, students, grades, etc.
    action VARCHAR(20) NOT NULL, -- create, read, update, delete, etc.
    description TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_permissions_name ON permissions(name);
CREATE UNIQUE INDEX idx_permissions_resource_action ON permissions(resource, action);

COMMENT ON TABLE permissions IS 'Granular permissions for RBAC';
COMMENT ON COLUMN permissions.resource IS 'Resource type (users, students, grades)';
COMMENT ON COLUMN permissions.action IS 'Action type (create, read, update, delete, list)';

-- ============================================
-- ROLE_PERMISSIONS TABLE
-- ============================================
-- Many-to-many relationship

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

COMMENT ON TABLE role_permissions IS 'Maps roles to their permissions';

-- ============================================
-- USER_ROLES TABLE
-- ============================================
-- Users can have multiple roles

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_roles_expires_at ON user_roles(expires_at) WHERE expires_at IS NOT NULL;

COMMENT ON TABLE user_roles IS 'Maps users to their roles';
COMMENT ON COLUMN user_roles.expires_at IS 'NULL = permanent, otherwise temporary role';
```

---

### Task 6: Create OAuth Accounts Table

**File:** `supabase/migrations/005_create_oauth_accounts.sql`

```sql
-- ============================================
-- OAUTH ACCOUNTS TABLE
-- ============================================
-- OAuth provider accounts linked to users

CREATE TABLE IF NOT EXISTS oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    provider VARCHAR(50) NOT NULL, -- google, microsoft, facebook
    provider_account_id VARCHAR(255) NOT NULL,
    
    -- OAuth Data
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    token_type VARCHAR(50),
    scope TEXT,
    id_token TEXT,
    
    -- Profile Data from Provider
    provider_email VARCHAR(255),
    provider_name VARCHAR(255),
    provider_avatar TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(provider, provider_account_id)
);

CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX idx_oauth_accounts_provider ON oauth_accounts(provider);
CREATE UNIQUE INDEX idx_oauth_provider_account ON oauth_accounts(provider, provider_account_id);

COMMENT ON TABLE oauth_accounts IS 'OAuth provider accounts linked to users';
COMMENT ON COLUMN oauth_accounts.provider IS 'OAuth provider: google, microsoft, etc.';

CREATE TRIGGER oauth_accounts_updated_at
    BEFORE UPDATE ON oauth_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE oauth_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY oauth_accounts_select_own ON oauth_accounts
    FOR SELECT
    USING (user_id = auth.uid());
```

---

### Task 7: Create Audit Logs Table

**File:** `supabase/migrations/006_create_audit_logs.sql`

```sql
-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
-- Track all important actions

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Who
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    
    -- What
    action VARCHAR(100) NOT NULL, -- login, logout, create_user, update_role, etc.
    resource_type VARCHAR(50), -- users, schools, roles, etc.
    resource_id UUID,
    
    -- Details
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB, -- Additional context
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (
        status IN ('success', 'failed', 'pending')
    ),
    error_message TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_school_id ON audit_logs(school_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);

-- Partition by month for performance (optional, for production)
-- CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
--     FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

COMMENT ON TABLE audit_logs IS 'Audit trail of all important actions';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context as JSON';

-- Function to log audit
CREATE OR REPLACE FUNCTION log_audit(
    p_action VARCHAR,
    p_resource_type VARCHAR DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
    v_user_id UUID;
    v_school_id UUID;
BEGIN
    -- Get current user info
    v_user_id := auth.uid();
    SELECT school_id INTO v_school_id FROM users WHERE id = v_user_id;
    
    INSERT INTO audit_logs (
        user_id,
        school_id,
        action,
        resource_type,
        resource_id,
        description,
        old_values,
        new_values,
        metadata,
        ip_address,
        user_agent
    ) VALUES (
        v_user_id,
        v_school_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_description,
        p_old_values,
        p_new_values,
        p_metadata,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only super_admin and school_admin can read audit logs
CREATE POLICY audit_logs_select_admin ON audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'school_admin')
            AND (role = 'super_admin' OR school_id = audit_logs.school_id)
        )
    );
```

---

### Task 8: Create Additional Tables

**File:** `supabase/migrations/007_create_additional_tables.sql`

```sql
-- ============================================
-- USER PREFERENCES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- UI Preferences
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language VARCHAR(5) DEFAULT 'id' CHECK (language IN ('id', 'en')),
    
    -- Notifications
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    
    -- Custom Settings
    settings JSONB DEFAULT '{}'::jsonb,
    
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_preferences IS 'User-specific preferences and settings';

CREATE TRIGGER user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_preferences_all_own ON user_preferences
    FOR ALL
    USING (user_id = auth.uid());

-- ============================================
-- SYSTEM SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE system_settings IS 'Global system configuration';

-- RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Only super_admin can modify
CREATE POLICY system_settings_select_all ON system_settings
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY system_settings_modify_super_admin ON system_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
        )
    );
```

---

### Task 9: Seed Initial Data

**File:** `supabase/migrations/008_seed_initial_data.sql`

```sql
-- ============================================
-- SEED INITIAL DATA
-- ============================================

-- Insert System Roles
INSERT INTO roles (id, name, description, is_system) VALUES
    (gen_random_uuid(), 'super_admin', 'Super Administrator - full system access', true),
    (gen_random_uuid(), 'school_admin', 'School Administrator - manage school', true),
    (gen_random_uuid(), 'teacher', 'Teacher - manage classes and grades', true),
    (gen_random_uuid(), 'student', 'Student - view grades and materials', true),
    (gen_random_uuid(), 'parent', 'Parent - view child information', true),
    (gen_random_uuid(), 'finance_staff', 'Finance Staff - manage payments', true)
ON CONFLICT (name) DO NOTHING;

-- Insert Permissions
INSERT INTO permissions (name, resource, action, description) VALUES
    -- Users
    ('users.create', 'users', 'create', 'Create new users'),
    ('users.read', 'users', 'read', 'View user details'),
    ('users.update', 'users', 'update', 'Update user information'),
    ('users.delete', 'users', 'delete', 'Delete users'),
    ('users.list', 'users', 'list', 'List all users'),
    
    -- Schools
    ('schools.create', 'schools', 'create', 'Create new schools'),
    ('schools.read', 'schools', 'read', 'View school details'),
    ('schools.update', 'schools', 'update', 'Update school information'),
    ('schools.delete', 'schools', 'delete', 'Delete schools'),
    ('schools.list', 'schools', 'list', 'List all schools'),
    
    -- Roles
    ('roles.create', 'roles', 'create', 'Create new roles'),
    ('roles.read', 'roles', 'read', 'View role details'),
    ('roles.update', 'roles', 'update', 'Update role information'),
    ('roles.delete', 'roles', 'delete', 'Delete roles'),
    ('roles.assign', 'roles', 'assign', 'Assign roles to users'),
    
    -- Permissions
    ('permissions.read', 'permissions', 'read', 'View permissions'),
    ('permissions.assign', 'permissions', 'assign', 'Assign permissions to roles'),
    
    -- Audit Logs
    ('audit.read', 'audit', 'read', 'View audit logs')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to super_admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'super_admin'),
    id
FROM permissions
ON CONFLICT DO NOTHING;

-- Assign basic permissions to school_admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'school_admin'),
    id
FROM permissions
WHERE resource IN ('users', 'roles', 'audit')
    AND action IN ('read', 'list', 'create', 'update')
ON CONFLICT DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
    ('maintenance_mode', 'false'::jsonb, 'Enable/disable maintenance mode'),
    ('registration_enabled', 'true'::jsonb, 'Allow new user registration'),
    ('oauth_providers', '["google", "microsoft"]'::jsonb, 'Enabled OAuth providers'),
    ('password_policy', '{"min_length": 8, "require_uppercase": true, "require_number": true}'::jsonb, 'Password requirements'),
    ('session_timeout', '86400'::jsonb, 'Session timeout in seconds (24 hours)')
ON CONFLICT (key) DO NOTHING;
```

---

### Task 10: Apply Migrations

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Create migrations directory
mkdir -p supabase/migrations

# Copy all SQL files to migrations/

# Apply migrations via Supabase Dashboard:
# 1. Go to https://app.supabase.com
# 2. Select your project
# 3. Go to SQL Editor
# 4. Run each migration file in order
```

---

## 🧪 Testing Instructions

### Test 1: Verify Tables Created

```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected:** All 11 tables listed

---

### Test 2: Verify RLS Enabled

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND rowsecurity = true;
```

**Expected:** RLS enabled on users, sessions, oauth_accounts, audit_logs

---

### Test 3: Verify Seed Data

```sql
-- Check roles
SELECT COUNT(*) as role_count FROM roles;
-- Expected: 6

-- Check permissions
SELECT COUNT(*) as permission_count FROM permissions;
-- Expected: ~18

-- Check role permissions for super_admin
SELECT COUNT(*) as super_admin_permissions 
FROM role_permissions 
WHERE role_id = (SELECT id FROM roles WHERE name = 'super_admin');
-- Expected: ~18 (all permissions)
```

---

### Test 4: Test Audit Function

```sql
-- Test audit logging
SELECT log_audit(
    'test_action',
    'test_resource',
    gen_random_uuid(),
    'Test audit log',
    '{"old": "value"}'::jsonb,
    '{"new": "value"}'::jsonb,
    '{"context": "test"}'::jsonb
);

-- Verify log created
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 1;
```

---

## 📸 Expected Results

```
Supabase Dashboard > Database:
✅ schools (11 columns)
✅ users (16 columns)
✅ user_sessions (10 columns)
✅ roles (6 columns)
✅ permissions (6 columns)
✅ role_permissions (3 columns)
✅ user_roles (5 columns)
✅ oauth_accounts (15 columns)
✅ audit_logs (15 columns)
✅ user_preferences (7 columns)
✅ system_settings (5 columns)

Total: 11 tables
Indexes: 30+ created
RLS: Enabled on 5 tables
Triggers: 5 created
Functions: 3 created
Seed data: Roles, Permissions, Settings
```

---

## ❌ Common Errors & Solutions

### Error: "relation already exists"

**Solution:** Drop and recreate:
```sql
DROP TABLE IF EXISTS table_name CASCADE;
-- Then run migration again
```

---

### Error: "permission denied for schema public"

**Cause:** Wrong user permissions

**Solution:** Run as postgres user or check project permissions

---

### Error: "violates foreign key constraint"

**Cause:** Tables created in wrong order

**Solution:** Run migrations in correct order (001, 002, 003...)

---

## 🔍 Code Review Checklist

- [ ] All tables have proper constraints
- [ ] Foreign keys set correctly
- [ ] Indexes created for common queries
- [ ] RLS policies are secure
- [ ] Triggers work correctly
- [ ] Seed data inserted successfully
- [ ] Database comments added
- [ ] Migration files numbered correctly

---

## 🔗 Dependencies

- **Depends on**: 
  - STORY-012 (Supabase setup)
- **Blocks**: 
  - STORY-014 (Database package)
  - STORY-015 (Better Auth setup)
  - All other Phase 1 stories

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl-constraints.html)

---

## 💡 Tips

1. **Run migrations in order** - Numbered files ensure dependencies
2. **Test RLS policies** - Use different user contexts
3. **Add comments** - Future developers will thank you
4. **Backup before changes** - Supabase auto-backups, but be safe
5. **Monitor performance** - Add indexes for slow queries
6. **Use UUID v4** - Better for distributed systems

---

## 📝 Notes for Next Story

After this story:
- ✅ Complete database schema
- ✅ RLS policies protecting data
- ✅ Audit logging infrastructure
- ✅ Seed data for testing

Next (STORY-014) creates the database client package to interact with this schema.

---

## ✏️ Definition of Done

- [ ] All acceptance criteria met
- [ ] Supabase project created
- [ ] All 11 tables created
- [ ] RLS policies implemented
- [ ] Indexes created
- [ ] Triggers working
- [ ] Seed data inserted
- [ ] Database tested
- [ ] Connection from local working
- [ ] Documentation complete
- [ ] Code reviewed and approved

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
