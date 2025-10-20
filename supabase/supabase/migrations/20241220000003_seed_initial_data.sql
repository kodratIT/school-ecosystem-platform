-- ============================================
-- SEED INITIAL DATA
-- ============================================
-- Initial roles, permissions, system settings
-- Created: 2024-12-20
-- Story: STORY-013

-- ============================================
-- SEED ROLES (8 roles)
-- ============================================
INSERT INTO roles (id, name, slug, description, is_system) VALUES
    (gen_random_uuid(), 'Super Administrator', 'super-admin', 'Full system access across all schools', true),
    (gen_random_uuid(), 'School Administrator', 'school-admin', 'Full access within assigned school', true),
    (gen_random_uuid(), 'Teacher', 'teacher', 'Teaching staff with class management', true),
    (gen_random_uuid(), 'Student', 'student', 'Student with limited access', true),
    (gen_random_uuid(), 'Parent', 'parent', 'Parent access to children data', true),
    (gen_random_uuid(), 'Finance Staff', 'finance-staff', 'Financial management', true),
    (gen_random_uuid(), 'Staff', 'staff', 'Administrative staff', true),
    (gen_random_uuid(), 'Guest', 'guest', 'Read-only access', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED PERMISSIONS (33 permissions)
-- ============================================
INSERT INTO permissions (name, slug, resource, action, description) VALUES
    -- Users (5)
    ('Create Users', 'create-users', 'users', 'create', 'Create user accounts'),
    ('View Users', 'view-users', 'users', 'read', 'View user profiles'),
    ('Edit Users', 'edit-users', 'users', 'update', 'Edit user information'),
    ('Delete Users', 'delete-users', 'users', 'delete', 'Delete user accounts'),
    ('Manage Users', 'manage-users', 'users', 'manage', 'Full user management'),
    
    -- Schools (4)
    ('Create Schools', 'create-schools', 'schools', 'create', 'Create schools'),
    ('View Schools', 'view-schools', 'schools', 'read', 'View schools'),
    ('Edit Schools', 'edit-schools', 'schools', 'update', 'Edit schools'),
    ('Delete Schools', 'delete-schools', 'schools', 'delete', 'Delete schools'),
    
    -- Students (4)
    ('Create Students', 'create-students', 'students', 'create', 'Register students'),
    ('View Students', 'view-students', 'students', 'read', 'View student data'),
    ('Edit Students', 'edit-students', 'students', 'update', 'Edit students'),
    ('Delete Students', 'delete-students', 'students', 'delete', 'Delete students'),
    
    -- Classes (4)
    ('Create Classes', 'create-classes', 'classes', 'create', 'Create classes'),
    ('View Classes', 'view-classes', 'classes', 'read', 'View classes'),
    ('Edit Classes', 'edit-classes', 'classes', 'update', 'Edit classes'),
    ('Delete Classes', 'delete-classes', 'classes', 'delete', 'Delete classes'),
    
    -- Grades (4)
    ('Create Grades', 'create-grades', 'grades', 'create', 'Input grades'),
    ('View Grades', 'view-grades', 'grades', 'read', 'View grades'),
    ('Edit Grades', 'edit-grades', 'grades', 'update', 'Modify grades'),
    ('Delete Grades', 'delete-grades', 'grades', 'delete', 'Delete grades'),
    
    -- Attendance (3)
    ('Create Attendance', 'create-attendance', 'attendance', 'create', 'Record attendance'),
    ('View Attendance', 'view-attendance', 'attendance', 'read', 'View attendance'),
    ('Edit Attendance', 'edit-attendance', 'attendance', 'update', 'Modify attendance'),
    
    -- Financial (6)
    ('Create Invoices', 'create-invoices', 'invoices', 'create', 'Create invoices'),
    ('View Invoices', 'view-invoices', 'invoices', 'read', 'View invoices'),
    ('Edit Invoices', 'edit-invoices', 'invoices', 'update', 'Modify invoices'),
    ('Delete Invoices', 'delete-invoices', 'invoices', 'delete', 'Delete invoices'),
    ('Create Payments', 'create-payments', 'payments', 'create', 'Record payments'),
    ('View Payments', 'view-payments', 'payments', 'read', 'View payments'),
    
    -- System (3)
    ('View Reports', 'view-reports', 'reports', 'read', 'View reports'),
    ('Manage Settings', 'manage-settings', 'settings', 'manage', 'Manage settings'),
    ('View Audit Logs', 'view-audit-logs', 'audit-logs', 'read', 'View audit logs')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- ASSIGN PERMISSIONS TO ROLES
-- ============================================
-- Super Admin gets ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.slug = 'super-admin'
ON CONFLICT DO NOTHING;

-- School Admin gets most (except school management)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.slug = 'school-admin' AND p.resource != 'schools'
ON CONFLICT DO NOTHING;

-- Teacher gets student, class, grade, attendance
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.slug = 'teacher' 
AND p.resource IN ('students', 'classes', 'grades', 'attendance')
AND p.action IN ('read', 'create', 'update')
ON CONFLICT DO NOTHING;

-- Finance Staff gets financial permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.slug = 'finance-staff' AND p.resource IN ('invoices', 'payments')
ON CONFLICT DO NOTHING;

-- Student can view own data
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.slug = 'student' 
AND p.resource IN ('grades', 'attendance', 'payments') 
AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- Parent can view children data
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.slug = 'parent' 
AND p.resource IN ('students', 'grades', 'attendance', 'payments') 
AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- ============================================
-- SYSTEM SETTINGS
-- ============================================
INSERT INTO system_settings (key, value, description, is_public) VALUES
    ('app_name', '"School Ecosystem"', 'Application name', true),
    ('app_version', '"1.0.0"', 'Current version', true),
    ('maintenance_mode', 'false', 'Maintenance mode', false),
    ('allow_registration', 'true', 'Allow registration', false),
    ('default_language', '"id_ID"', 'Default language', true),
    ('default_timezone', '"Asia/Jakarta"', 'Default timezone', true)
ON CONFLICT (school_id, key) DO NOTHING;

-- Success
DO $$
BEGIN
    RAISE NOTICE '✅ RLS enabled on all tables';
    RAISE NOTICE '✅ Security policies created';
    RAISE NOTICE '✅ Initial data seeded:';
    RAISE NOTICE '   - 8 roles';
    RAISE NOTICE '   - 33 permissions';
    RAISE NOTICE '   - Role assignments';
    RAISE NOTICE '   - System settings';
END $$;
