-- ============================================
-- RBAC TABLES - Roles & Permissions
-- ============================================
-- Role-Based Access Control system
-- Created: 2024-12-20
-- Story: STORY-013

-- ============================================
-- ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_roles_slug ON roles(slug);
COMMENT ON TABLE roles IS 'Roles for RBAC system';
COMMENT ON COLUMN roles.is_system IS 'System roles cannot be deleted';

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
    slug VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (
        action IN ('create', 'read', 'update', 'delete', 'manage')
    ),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(resource, action)
);

CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_permissions_slug ON permissions(slug);
COMMENT ON TABLE permissions IS 'Permissions for RBAC system';

CREATE TRIGGER permissions_updated_at
    BEFORE UPDATE ON permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROLE_PERMISSIONS TABLE (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
COMMENT ON TABLE role_permissions IS 'Maps roles to permissions';

-- ============================================
-- USER_ROLES TABLE (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
COMMENT ON TABLE user_roles IS 'Assigns roles to users (in addition to primary role)';

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS: All authenticated users can read roles and permissions
CREATE POLICY "Authenticated users can view roles"
    ON roles FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can view permissions"
    ON permissions FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can view role permissions"
    ON role_permissions FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Users can view own roles"
    ON user_roles FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- RLS: Only super admins can modify RBAC
CREATE POLICY "Super admins can manage roles"
    ON roles FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Super admins can manage permissions"
    ON permissions FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Super admins can manage role permissions"
    ON role_permissions FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Admins can manage user roles"
    ON user_roles FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))
    );
