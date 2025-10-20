-- ============================================
-- SEED INITIAL DATA
-- ============================================
-- Initial roles, permissions, and system data
-- Created: 2024-12-20
-- Story: STORY-013

-- ============================================
-- SEED ROLES
-- ============================================
INSERT INTO roles (id, name, slug, description, is_system) VALUES
    (gen_random_uuid(), 'Super Administrator', 'super-admin', 'Full system access across all schools', true),
    (gen_random_uuid(), 'School Administrator', 'school-admin', 'Full access within assigned school', true),
    (gen_random_uuid(), 'Teacher', 'teacher', 'Teaching staff with class management access', true),
    (gen_random_uuid(), 'Student', 'student', 'Student with limited access to own data', true),
    (gen_random_uuid(), 'Parent', 'parent', 'Parent with access to their children''s data', true),
    (gen_random_uuid(), 'Finance Staff', 'finance-staff', 'Financial management access', true),
    (gen_random_uuid(), 'Staff', 'staff', 'General administrative staff', true),
    (gen_random_uuid(), 'Guest', 'guest', 'Limited read-only access', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED PERMISSIONS
-- ============================================
-- User management permissions
INSERT INTO permissions (name, slug, resource, action, description) VALUES
    ('Create Users', 'create-users', 'users', 'create', 'Create new user accounts'),
    ('View Users', 'view-users', 'users', 'read', 'View user profiles'),
    ('Edit Users', 'edit-users', 'users', 'update', 'Edit user information'),
    ('Delete Users', 'delete-users', 'users', 'delete', 'Delete user accounts'),
    ('Manage Users', 'manage-users', 'users', 'manage', 'Full user management'),
    
    -- School management
    ('Create Schools', 'create-schools', 'schools', 'create', 'Create new schools'),
    ('View Schools', 'view-schools', 'schools', 'read', 'View school information'),
    ('Edit Schools', 'edit-schools', 'schools', 'update', 'Edit school settings'),
    ('Delete Schools', 'delete-schools', 'schools', 'delete', 'Delete schools'),
    
    -- Student management
    ('Create Students', 'create-students', 'students', 'create', 'Register new students'),
    ('View Students', 'view-students', 'students', 'read', 'View student data'),
    ('Edit Students', 'edit-students', 'students', 'update', 'Edit student information'),
    ('Delete Students', 'delete-students', 'students', 'delete', 'Delete student records'),
    
    -- Class management
    ('Create Classes', 'create-classes', 'classes', 'create', 'Create new classes'),
    ('View Classes', 'view-classes', 'classes', 'read', 'View class information'),
    ('Edit Classes', 'edit-classes', 'classes', 'update', 'Edit class details'),
    ('Delete Classes', 'delete-classes', 'classes', 'delete', 'Delete classes'),
    
    -- Grade management
    ('Create Grades', 'create-grades', 'grades', 'create', 'Input student grades'),
    ('View Grades', 'view-grades', 'grades', 'read', 'View grade records'),
    ('Edit Grades', 'edit-grades', 'grades', 'update', 'Modify grades'),
    ('Delete Grades', 'delete-grades', 'grades', 'delete', 'Delete grade entries'),
    
    -- Attendance
    ('Create Attendance', 'create-attendance', 'attendance', 'create', 'Record attendance'),
    ('View Attendance', 'view-attendance', 'attendance', 'read', 'View attendance records'),
    ('Edit Attendance', 'edit-attendance', 'attendance', 'update', 'Modify attendance'),
    
    -- Financial
    ('Create Invoices', 'create-invoices', 'invoices', 'create', 'Create invoices'),
    ('View Invoices', 'view-invoices', 'invoices', 'read', 'View invoice records'),
    ('Edit Invoices', 'edit-invoices', 'invoices', 'update', 'Modify invoices'),
    ('Delete Invoices', 'delete-invoices', 'invoices', 'delete', 'Delete invoices'),
    
    ('Create Payments', 'create-payments', 'payments', 'create', 'Record payments'),
    ('View Payments', 'view-payments', 'payments', 'read', 'View payment records'),
    
    -- Reports
    ('View Reports', 'view-reports', 'reports', 'read', 'Access reports and analytics'),
    
    -- System
    ('Manage Settings', 'manage-settings', 'settings', 'manage', 'Manage system settings'),
    ('View Audit Logs', 'view-audit-logs', 'audit-logs', 'read', 'View audit logs')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- ASSIGN PERMISSIONS TO ROLES
-- ============================================
-- Super Admin: All permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.slug = 'super-admin'
ON CONFLICT DO NOTHING;

-- School Admin: Most permissions except system-wide
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.slug = 'school-admin'
AND p.resource != 'schools'
ON CONFLICT DO NOTHING;

-- Teacher: Class and student management
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.slug = 'teacher'
AND p.resource IN ('students', 'classes', 'grades', 'attendance')
AND p.action IN ('read', 'create', 'update')
ON CONFLICT DO NOTHING;

-- Finance Staff: Financial permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.slug = 'finance-staff'
AND p.resource IN ('invoices', 'payments')
ON CONFLICT DO NOTHING;

-- Student: View own data
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.slug = 'student'
AND p.resource IN ('grades', 'attendance', 'payments')
AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- Parent: View children data
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.slug = 'parent'
AND p.resource IN ('students', 'grades', 'attendance', 'payments')
AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- ============================================
-- INITIAL SYSTEM SETTINGS
-- ============================================
INSERT INTO system_settings (key, value, description, is_public) VALUES
    ('app_name', '"School Ecosystem"', 'Application name', true),
    ('app_version', '"1.0.0"', 'Current version', true),
    ('maintenance_mode', 'false', 'Maintenance mode flag', false),
    ('allow_registration', 'true', 'Allow new user registration', false),
    ('default_language', '"id_ID"', 'Default system language', true),
    ('default_timezone', '"Asia/Jakarta"', 'Default timezone', true)
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Initial data seeded successfully';
    RAISE NOTICE '   - 8 roles created';
    RAISE NOTICE '   - 33 permissions created';
    RAISE NOTICE '   - Role-permission assignments complete';
    RAISE NOTICE '   - System settings initialized';
END $$;
