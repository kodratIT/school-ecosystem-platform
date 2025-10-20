-- ============================================
-- ENABLE RLS AND ADD POLICIES
-- ============================================
-- Add RLS policies AFTER all tables exist
-- Created: 2024-12-20
-- Story: STORY-013

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SCHOOLS POLICIES
-- ============================================
CREATE POLICY "Super admins can view all schools" ON schools FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));

CREATE POLICY "Users can view their school" ON schools FOR SELECT TO authenticated
USING (id IN (SELECT school_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Super admins can manage schools" ON schools FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));

-- ============================================
-- USERS POLICIES
-- ============================================
CREATE POLICY "Users can view own profile" ON users FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Super admins can view all users" ON users FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM users AS u WHERE u.id = auth.uid() AND u.role = 'super_admin'));

CREATE POLICY "School admins can view school users" ON users FOR SELECT TO authenticated
USING (EXISTS (
    SELECT 1 FROM users AS u 
    WHERE u.id = auth.uid() 
    AND u.role = 'school_admin' 
    AND u.school_id = users.school_id
));

CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can manage users" ON users FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM users AS u 
    WHERE u.id = auth.uid() 
    AND u.role IN ('super_admin', 'school_admin')
));

-- ============================================
-- RBAC POLICIES
-- ============================================
CREATE POLICY "Authenticated users can view roles" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view permissions" ON permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view role permissions" ON role_permissions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admins can manage roles" ON roles FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super admins can manage permissions" ON permissions FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super admins can manage role permissions" ON role_permissions FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user roles" ON user_roles FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')));

-- ============================================
-- AUTH POLICIES
-- ============================================
CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions" ON user_sessions FOR DELETE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can view own oauth accounts" ON oauth_accounts FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own oauth accounts" ON oauth_accounts FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- SYSTEM POLICIES
-- ============================================
CREATE POLICY "Super admins can view all audit logs" ON audit_logs FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "School admins can view school audit logs" ON audit_logs FOR SELECT TO authenticated
USING (school_id IN (SELECT school_id FROM users WHERE id = auth.uid() AND role = 'school_admin'));

CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view public settings" ON system_settings FOR SELECT TO authenticated
USING (is_public = true);

CREATE POLICY "Admins can manage settings" ON system_settings FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (role = 'super_admin' OR (role = 'school_admin' AND school_id = system_settings.school_id))
));

-- Success
DO $$
BEGIN
    RAISE NOTICE '✅ RLS enabled on all 11 tables';
    RAISE NOTICE '✅ All security policies created';
END $$;
