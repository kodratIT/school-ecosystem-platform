# PHASE 1: Identity Provider (IdP)

**Duration**: 3 Weeks (Week 3-5)  
**Team**: 2-3 Full-stack Developers  
**Priority**: CRITICAL - Core authentication for entire ecosystem  
**Goal**: Build centralized Identity Provider with Better Auth, RBAC, and SSO

---

## 📋 Overview

Phase 1 membangun **Identity Provider (IdP)** sebagai pusat authentication dan authorization untuk seluruh ekosistem. IdP ini akan:

- ✅ Manage semua users (siswa, guru, admin, orangtua)
- ✅ Handle authentication (login, register, OAuth)
- ✅ Implement RBAC (Role-Based Access Control)
- ✅ Issue JWT tokens untuk Service Providers
- ✅ Provide SSO (Single Sign-On) functionality
- ✅ Audit semua security events

**⚠️ CRITICAL**: Semua aplikasi (PPDB, SIS, LMS, dll) akan depend pada IdP ini!

---

## 🔗 Transition from Phase 0

### Prerequisites Check

Sebelum mulai Phase 1, pastikan Phase 0 sudah selesai:

```bash
# Verify Phase 0 completion
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# 1. Check monorepo structure exists
test -f pnpm-workspace.yaml && echo "✅ Workspace configured"
test -f turbo.json && echo "✅ Turborepo configured"

# 2. Check shared packages exist
test -d packages/ui && echo "✅ @repo/ui exists"
test -d packages/utils && echo "✅ @repo/utils exists"
test -d packages/validators && echo "✅ @repo/validators exists"
test -d packages/types && echo "✅ @repo/types exists"

# 3. Verify no errors
pnpm type-check && echo "✅ Type check passed"
pnpm lint && echo "✅ Lint passed"

# 4. All packages installed
pnpm install && echo "✅ Dependencies installed"
```

**Expected Output:**
```
✅ Workspace configured
✅ Turborepo configured
✅ @repo/ui exists
✅ @repo/utils exists
✅ @repo/validators exists
✅ @repo/types exists
✅ Type check passed
✅ Lint passed
✅ Dependencies installed
```

Jika ada yang ❌, selesaikan Phase 0 dulu!

---

### What's Different in Phase 1

| Aspect | Phase 0 | Phase 1 |
|--------|---------|---------|
| **Focus** | Foundation & tooling | First working application |
| **Complexity** | Setup & config | Business logic & database |
| **External Services** | None | Supabase, Better Auth |
| **Output** | Shared packages | Running Next.js app |
| **Testing** | Type check & lint | Integration testing |

---

## 🎯 Phase Objectives

By the end of Phase 1, you will have:

- [x] **Identity Database** di Supabase dengan complete schema
- [x] **Better Auth** fully integrated untuk email/password & OAuth
- [x] **RBAC Engine** package untuk permission checking
- [x] **JWT Service** untuk token generation
- [x] **Identity Client** package untuk Service Providers
- [x] **Identity Provider App** (Next.js) dengan:
  - Login/Register pages
  - OAuth integration (Google, Microsoft)
  - User profile management
  - School selection (multi-tenant)
  - Admin panel untuk manage roles
- [x] **SSO** working dengan JWT token issuance
- [x] **Audit Logs** untuk semua critical actions

---

## 📂 Target Folder Structure

```
ekosistem-sekolah/
├── apps/
│   └── identity-provider/         # 🆕 IdP Next.js App
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/        # Auth routes
│       │   │   │   ├── login/
│       │   │   │   ├── register/
│       │   │   │   └── verify/
│       │   │   ├── (dashboard)/   # Protected routes
│       │   │   │   ├── profile/
│       │   │   │   ├── schools/
│       │   │   │   └── admin/
│       │   │   ├── api/
│       │   │   │   ├── auth/
│       │   │   │   ├── users/
│       │   │   │   └── sso/
│       │   │   └── layout.tsx
│       │   ├── components/
│       │   ├── lib/
│       │   │   ├── auth.ts        # Better Auth config
│       │   │   ├── db.ts          # Supabase client
│       │   │   └── jwt.ts         # JWT service
│       │   └── middleware.ts
│       ├── .env.example
│       ├── next.config.js
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── database-identity/         # 🆕 Identity DB client
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── types.ts
│   │   │   └── queries/
│   │   └── package.json
│   │
│   ├── auth/                      # 🆕 Better Auth wrapper
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── config.ts
│   │   │   └── middleware.ts
│   │   └── package.json
│   │
│   ├── rbac/                      # 🆕 RBAC Engine
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── permission-checker.ts
│   │   │   └── types.ts
│   │   └── package.json
│   │
│   ├── identity-client/           # 🆕 For Service Providers
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── jwt-verifier.ts
│   │   └── package.json
│   │
│   └── (existing packages from Phase 0)
│
├── supabase/
│   └── identity/                  # 🆕 Identity Supabase Project
│       ├── config.toml
│       ├── migrations/
│       │   ├── 20240101_initial_schema.sql
│       │   ├── 20240102_rls_policies.sql
│       │   └── 20240103_seed_roles.sql
│       └── seed.sql
│
└── (rest from Phase 0)
```

---

## 🚀 Implementation Guide

---

## **1.1 Setup Supabase Identity Database**

### Story: **[STORY-012]** - Setup Supabase Project

**Prerequisites:**
- Supabase account (sign up at https://supabase.com)
- Supabase CLI installed

**Step 1: Install Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Verify installation
supabase --version
```

**Step 2: Login to Supabase**

```bash
# Login to Supabase
supabase login

# This will open browser for authentication
```

**Step 3: Create Supabase Project (via Dashboard)**

1. Buka https://app.supabase.com
2. Click "New Project"
3. Fill in details:
   - **Name**: `ekosistem-identity`
   - **Database Password**: (generate strong password, save it!)
   - **Region**: Southeast Asia (Singapore)
   - **Pricing**: Free tier (untuk development)
4. Click "Create new project"
5. Wait ~2 minutes untuk project provisioning

**Step 4: Get Project Credentials**

Dari Supabase dashboard, copy:

1. **Project URL**: https://xxxxx.supabase.co
2. **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
3. **Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (different from anon)

Save these to `.env.local` (don't commit!)

**Step 5: Initialize Local Supabase Project**

```bash
# Create directory for Supabase
mkdir -p supabase/identity
cd supabase/identity

# Initialize Supabase project
supabase init

# Link to remote project
supabase link --project-ref xxxxx  # Replace with your project ID
```

**Verification:**

```bash
# Check Supabase status
supabase status

# Should show:
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:...@localhost:54322/postgres
```

---

### Story: **[STORY-013]** - Implement Identity Database Schema

**Step 1: Create Migration File**

```bash
# Create first migration
cd supabase/identity
supabase migration new initial_schema
```

This creates: `supabase/identity/migrations/YYYYMMDDHHMMSS_initial_schema.sql`

**Step 2: Write Identity Schema**

**File:** `supabase/identity/migrations/YYYYMMDDHHMMSS_initial_schema.sql`

```sql
-- ============================================
-- IDENTITY DATABASE SCHEMA - PHASE 1
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Schools (Tenants)
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (managed by Better Auth, but we extend it)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions (Better Auth will use this)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-School Membership (Multi-tenant)
CREATE TABLE user_schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, school_id)
);

-- ============================================
-- RBAC TABLES
-- ============================================

-- Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resource, action)
);

-- User-School-Role (RBAC mapping)
CREATE TABLE user_school_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  UNIQUE(user_id, school_id, role_id)
);

-- Role-Permission Mapping
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- ============================================
-- OAUTH & SECURITY
-- ============================================

-- OAuth Accounts
CREATE TABLE oauth_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  school_id UUID REFERENCES schools(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Provider Access Tracking
CREATE TABLE user_sp_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  service_provider TEXT NOT NULL,
  first_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  access_count INT DEFAULT 1,
  UNIQUE(user_id, school_id, service_provider)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_user_schools_user_id ON user_schools(user_id);
CREATE INDEX idx_user_schools_school_id ON user_schools(school_id);
CREATE INDEX idx_user_school_roles_user_school ON user_school_roles(user_id, school_id);
CREATE INDEX idx_user_school_roles_role_id ON user_school_roles(role_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_school_id ON audit_logs(school_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get user's permissions in a school
CREATE OR REPLACE FUNCTION get_user_permissions(
  p_user_id UUID,
  p_school_id UUID
)
RETURNS TABLE (resource TEXT, action TEXT, name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.resource, p.action, p.name
  FROM user_school_roles usr
  JOIN role_permissions rp ON rp.role_id = usr.role_id
  JOIN permissions p ON p.id = rp.permission_id
  WHERE usr.user_id = p_user_id
    AND usr.school_id = p_school_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION has_permission(
  p_user_id UUID,
  p_school_id UUID,
  p_resource TEXT,
  p_action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM user_school_roles usr
  JOIN role_permissions rp ON rp.role_id = usr.role_id
  JOIN permissions p ON p.id = rp.permission_id
  WHERE usr.user_id = p_user_id
    AND usr.school_id = p_school_id
    AND p.resource = p_resource
    AND p.action = p_action;
  
  RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE schools IS 'Multi-tenant schools table';
COMMENT ON TABLE users IS 'User accounts managed by Better Auth';
COMMENT ON TABLE user_schools IS 'User membership in schools (multi-tenant)';
COMMENT ON TABLE roles IS 'User roles (super_admin, school_admin, teacher, etc)';
COMMENT ON TABLE permissions IS 'Granular permissions (resource:action pattern)';
COMMENT ON TABLE user_school_roles IS 'RBAC: User has role in specific school';
COMMENT ON TABLE role_permissions IS 'RBAC: Role has permissions';
COMMENT ON TABLE audit_logs IS 'Security audit trail';
```

**Step 3: Create RLS Policies Migration**

```bash
supabase migration new rls_policies
```

**File:** `supabase/identity/migrations/YYYYMMDDHHMMSS_rls_policies.sql`

```sql
-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_school_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sp_access ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SCHOOLS POLICIES
-- ============================================

-- Users can read schools they belong to
CREATE POLICY "Users can read their schools"
  ON schools FOR SELECT
  USING (
    id IN (
      SELECT school_id FROM user_schools
      WHERE user_id = auth.uid()
    )
  );

-- Only super_admin can manage schools
CREATE POLICY "Super admin can manage schools"
  ON schools FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_school_roles usr
      JOIN roles r ON r.id = usr.role_id
      WHERE usr.user_id = auth.uid()
        AND r.name = 'super_admin'
    )
  );

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Admins can read users in their school
CREATE POLICY "Admins can read school users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_school_roles usr
      JOIN roles r ON r.id = usr.role_id
      WHERE usr.user_id = auth.uid()
        AND r.name IN ('super_admin', 'school_admin', 'admin')
        AND usr.school_id IN (
          SELECT school_id FROM user_schools
          WHERE user_id = users.id
        )
    )
  );

-- ============================================
-- USER_SCHOOLS POLICIES
-- ============================================

-- Users can read their own memberships
CREATE POLICY "Users can read own memberships"
  ON user_schools FOR SELECT
  USING (user_id = auth.uid());

-- Admins can read memberships in their school
CREATE POLICY "Admins can read school memberships"
  ON user_schools FOR SELECT
  USING (
    school_id IN (
      SELECT usr.school_id FROM user_school_roles usr
      JOIN roles r ON r.id = usr.role_id
      WHERE usr.user_id = auth.uid()
        AND r.name IN ('super_admin', 'school_admin', 'admin')
    )
  );

-- ============================================
-- ROLES & PERMISSIONS POLICIES
-- ============================================

-- Everyone can read roles and permissions (for UI)
CREATE POLICY "Anyone authenticated can read roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone authenticated can read permissions"
  ON permissions FOR SELECT
  TO authenticated
  USING (true);

-- Only super_admin can manage roles
CREATE POLICY "Super admin can manage roles"
  ON roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_school_roles usr
      JOIN roles r ON r.id = usr.role_id
      WHERE usr.user_id = auth.uid()
        AND r.name = 'super_admin'
    )
  );

-- ============================================
-- USER_SCHOOL_ROLES POLICIES
-- ============================================

-- Users can read their own roles
CREATE POLICY "Users can read own roles"
  ON user_school_roles FOR SELECT
  USING (user_id = auth.uid());

-- Admins can read roles in their school
CREATE POLICY "Admins can read school roles"
  ON user_school_roles FOR SELECT
  USING (
    school_id IN (
      SELECT usr.school_id FROM user_school_roles usr
      JOIN roles r ON r.id = usr.role_id
      WHERE usr.user_id = auth.uid()
        AND r.name IN ('super_admin', 'school_admin', 'admin')
    )
  );

-- School admins can assign roles in their school
CREATE POLICY "School admin can assign roles"
  ON user_school_roles FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT usr.school_id FROM user_school_roles usr
      JOIN roles r ON r.id = usr.role_id
      WHERE usr.user_id = auth.uid()
        AND r.name IN ('super_admin', 'school_admin')
    )
  );

-- ============================================
-- AUDIT_LOGS POLICIES
-- ============================================

-- Users can read their own audit logs
CREATE POLICY "Users can read own audit logs"
  ON audit_logs FOR SELECT
  USING (user_id = auth.uid());

-- Admins can read all logs in their school
CREATE POLICY "Admins can read school audit logs"
  ON audit_logs FOR SELECT
  USING (
    school_id IN (
      SELECT usr.school_id FROM user_school_roles usr
      JOIN roles r ON r.id = usr.role_id
      WHERE usr.user_id = auth.uid()
        AND r.name IN ('super_admin', 'school_admin', 'admin')
    )
  );

-- Service role can insert audit logs
CREATE POLICY "Service can insert audit logs"
  ON audit_logs FOR INSERT
  TO service_role
  WITH CHECK (true);
```

**Step 4: Seed Default Roles & Permissions**

```bash
supabase migration new seed_roles_permissions
```

**File:** `supabase/identity/migrations/YYYYMMDDHHMMSS_seed_roles_permissions.sql`

```sql
-- ============================================
-- SEED DEFAULT ROLES
-- ============================================

INSERT INTO roles (name, display_name, description, is_system) VALUES
  ('super_admin', 'Super Admin', 'Platform administrator with full access', true),
  ('school_admin', 'Kepala Sekolah', 'School administrator with full school access', true),
  ('admin', 'Admin Sekolah', 'School admin with operational access', true),
  ('teacher', 'Guru', 'Teacher with classroom access', true),
  ('student', 'Siswa', 'Student with learning access', true),
  ('parent', 'Orang Tua', 'Parent with monitoring access', true),
  ('staff_finance', 'Staff Keuangan', 'Finance staff', true),
  ('staff_library', 'Staff Perpustakaan', 'Library staff', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SEED DEFAULT PERMISSIONS
-- ============================================

-- User management permissions
INSERT INTO permissions (resource, action, name, display_name) VALUES
  ('user', 'create', 'user:create', 'Create User'),
  ('user', 'read', 'user:read', 'View User'),
  ('user', 'update', 'user:update', 'Update User'),
  ('user', 'delete', 'user:delete', 'Delete User')
ON CONFLICT (name) DO NOTHING;

-- School management permissions
INSERT INTO permissions (resource, action, name, display_name) VALUES
  ('school', 'create', 'school:create', 'Create School'),
  ('school', 'read', 'school:read', 'View School'),
  ('school', 'update', 'school:update', 'Update School'),
  ('school', 'delete', 'school:delete', 'Delete School')
ON CONFLICT (name) DO NOTHING;

-- Role management permissions
INSERT INTO permissions (resource, action, name, display_name) VALUES
  ('role', 'create', 'role:create', 'Create Role'),
  ('role', 'read', 'role:read', 'View Role'),
  ('role', 'update', 'role:update', 'Update Role'),
  ('role', 'delete', 'role:delete', 'Delete Role'),
  ('role', 'assign', 'role:assign', 'Assign Role to User')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ASSIGN PERMISSIONS TO ROLES
-- ============================================

-- Super Admin gets ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- School Admin gets school management permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'school_admin'
  AND p.resource IN ('user', 'school', 'role')
ON CONFLICT DO NOTHING;

-- Admin gets user management
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin'
  AND p.resource = 'user'
  AND p.action IN ('read', 'create', 'update')
ON CONFLICT DO NOTHING;

-- Teacher can read users
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'teacher'
  AND p.name = 'user:read'
ON CONFLICT DO NOTHING;
```

**Step 5: Apply Migrations**

```bash
# Apply migrations to local Supabase
cd supabase/identity
supabase db reset

# Push to remote Supabase
supabase db push
```

**Verification:**

```bash
# Check tables created
supabase db execute "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"

# Should list: schools, users, sessions, roles, permissions, etc.
```

---

### Story: **[STORY-014]** - Create Database Package

**Step 1: Create Package Structure**

```bash
mkdir -p packages/database-identity/src/queries
cd packages/database-identity
```

**Step 2: Create package.json**

**File:** `packages/database-identity/package.json`

```json
{
  "name": "@repo/database-identity",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "type-check": "tsc --noEmit",
    "generate-types": "supabase gen types typescript --project-id xxxxx > src/database.types.ts"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/tsconfig": "workspace:*",
    "eslint": "^8.57.0",
    "typescript": "^5.3.0"
  }
}
```

**Step 3: Generate TypeScript Types from Supabase**

```bash
# Replace xxxxx with your project ID
supabase gen types typescript --project-id xxxxx > src/database.types.ts
```

**Step 4: Create Supabase Client**

**File:** `packages/database-identity/src/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Supabase client for server-side operations
export function createIdentityClient() {
  const supabaseUrl = process.env.IDENTITY_DB_URL;
  const supabaseKey = process.env.IDENTITY_DB_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Supabase client for client-side operations (with anon key)
export function createIdentityBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_IDENTITY_DB_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_IDENTITY_DB_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase public environment variables');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

export type SupabaseClient = ReturnType<typeof createIdentityClient>;
```

**Step 5: Create Query Functions**

**File:** `packages/database-identity/src/queries/users.ts`

```typescript
import type { SupabaseClient } from '../client';
import type { Database } from '../database.types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export async function getUserById(
  client: SupabaseClient,
  userId: string
): Promise<User | null> {
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserByEmail(
  client: SupabaseClient,
  email: string
): Promise<User | null> {
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createUser(
  client: SupabaseClient,
  user: UserInsert
): Promise<User> {
  const { data, error } = await client
    .from('users')
    .insert(user)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUser(
  client: SupabaseClient,
  userId: string,
  updates: UserUpdate
): Promise<User> {
  const { data, error } = await client
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

**File:** `packages/database-identity/src/queries/schools.ts`

```typescript
import type { SupabaseClient } from '../client';
import type { Database } from '../database.types';

type School = Database['public']['Tables']['schools']['Row'];
type UserSchool = Database['public']['Tables']['user_schools']['Row'];

export async function getUserSchools(
  client: SupabaseClient,
  userId: string
): Promise<(UserSchool & { school: School })[]> {
  const { data, error } = await client
    .from('user_schools')
    .select('*, school:schools(*)')
    .eq('user_id', userId);

  if (error) throw error;
  return data as any;
}

export async function getSchoolBySlug(
  client: SupabaseClient,
  slug: string
): Promise<School | null> {
  const { data, error } = await client
    .from('schools')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}
```

**File:** `packages/database-identity/src/queries/roles.ts`

```typescript
import type { SupabaseClient } from '../client';
import type { Database } from '../database.types';

type Role = Database['public']['Tables']['roles']['Row'];
type Permission = Database['public']['Tables']['permissions']['Row'];

export async function getUserRolesInSchool(
  client: SupabaseClient,
  userId: string,
  schoolId: string
): Promise<Role[]> {
  const { data, error } = await client
    .from('user_school_roles')
    .select('role:roles(*)')
    .eq('user_id', userId)
    .eq('school_id', schoolId);

  if (error) throw error;
  return data.map((d: any) => d.role);
}

export async function getUserPermissions(
  client: SupabaseClient,
  userId: string,
  schoolId: string
): Promise<Permission[]> {
  const { data, error } = await client.rpc('get_user_permissions', {
    p_user_id: userId,
    p_school_id: schoolId,
  });

  if (error) throw error;
  return data;
}

export async function assignRoleToUser(
  client: SupabaseClient,
  userId: string,
  schoolId: string,
  roleId: string,
  assignedBy: string
): Promise<void> {
  const { error } = await client.from('user_school_roles').insert({
    user_id: userId,
    school_id: schoolId,
    role_id: roleId,
    assigned_by: assignedBy,
  });

  if (error) throw error;
}
```

**Step 6: Create Index File**

**File:** `packages/database-identity/src/index.ts`

```typescript
export {
  createIdentityClient,
  createIdentityBrowserClient,
  type SupabaseClient,
} from './client';

export type { Database } from './database.types';

export * as userQueries from './queries/users';
export * as schoolQueries from './queries/schools';
export * as roleQueries from './queries/roles';
```

**Step 7: Install & Verify**

```bash
cd ../../..
pnpm install
pnpm --filter @repo/database-identity type-check
```

---

## **1.2 Setup Better Auth**

### Story: **[STORY-015]** - Install and Configure Better Auth

**Step 1: Install Dependencies**

```bash
pnpm add better-auth jose
pnpm add -D @types/node
```

**Step 2: Create Auth Package**

```bash
mkdir -p packages/auth/src
```

**File:** `packages/auth/package.json`

```json
{
  "name": "@repo/auth",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "better-auth": "^1.0.0",
    "jose": "^5.2.0",
    "@repo/database-identity": "workspace:*"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/tsconfig": "workspace:*",
    "eslint": "^8.57.0",
    "typescript": "^5.3.0"
  }
}
```

**Step 3: Configure Better Auth**

**File:** `packages/auth/src/config.ts`

```typescript
import { betterAuth } from 'better-auth';
import { createIdentityClient } from '@repo/database-identity';

export const auth = betterAuth({
  database: async () => {
    const client = createIdentityClient();
    return {
      // Better Auth will use these methods to interact with DB
      async getUser(id: string) {
        const { data } = await client
          .from('users')
          .select('*')
          .eq('id', id)
          .single();
        return data;
      },
      async getUserByEmail(email: string) {
        const { data } = await client
          .from('users')
          .select('*')
          .eq('email', email)
          .single();
        return data;
      },
      async createUser(user: any) {
        const { data } = await client
          .from('users')
          .insert(user)
          .select()
          .single();
        return data;
      },
      async createSession(session: any) {
        const { data } = await client
          .from('sessions')
          .insert(session)
          .select()
          .single();
        return data;
      },
      async getSession(token: string) {
        const { data } = await client
          .from('sessions')
          .select('*')
          .eq('token', token)
          .single();
        return data;
      },
      async deleteSession(token: string) {
        await client.from('sessions').delete().eq('token', token);
      },
    };
  },

  // Email/Password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendVerificationEmail({ user, url }) {
      // TODO: Implement email sending in Phase 11
      console.log(`Verification email for ${user.email}: ${url}`);
    },
  },

  // OAuth providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      scopes: ['email', 'profile'],
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenant: 'common',
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update every 24 hours
  },

  // JWT configuration for SSO
  jwt: {
    enabled: true,
    secret: process.env.JWT_SECRET!,
    expiresIn: '1h',
  },
});

export type Auth = typeof auth;
```

**File:** `packages/auth/src/index.ts`

```typescript
export { auth, type Auth } from './config';
export type { User, Session } from 'better-auth';
```

**Step 4: Install & Verify**

```bash
cd ../../..
pnpm install
pnpm --filter @repo/auth type-check
```

---

## **1.3 Create RBAC Engine Package**

### Story: **[STORY-016]** - Implement RBAC Package

**Step 1: Create Package**

```bash
mkdir -p packages/rbac/src
```

**File:** `packages/rbac/package.json`

```json
{
  "name": "@repo/rbac",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@repo/database-identity": "workspace:*"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/tsconfig": "workspace:*",
    "eslint": "^8.57.0",
    "typescript": "^5.3.0"
  }
}
```

**File:** `packages/rbac/src/types.ts`

```typescript
export interface Permission {
  resource: string;
  action: string;
  name?: string;
}

export interface UserContext {
  userId: string;
  schoolId: string;
  roles: string[];
}

export interface CheckPermissionResult {
  allowed: boolean;
  reason?: string;
}
```

**File:** `packages/rbac/src/permission-checker.ts`

```typescript
import { createIdentityClient, roleQueries } from '@repo/database-identity';
import type { Permission, UserContext, CheckPermissionResult } from './types';

/**
 * Check if user has specific permission
 */
export async function hasPermission(
  context: UserContext,
  permission: Permission
): Promise<boolean> {
  const { userId, schoolId, roles } = context;

  // Super admin has all permissions
  if (roles.includes('super_admin')) {
    return true;
  }

  // Query database for permission
  const client = createIdentityClient();

  try {
    const result = await client.rpc('has_permission', {
      p_user_id: userId,
      p_school_id: schoolId,
      p_resource: permission.resource,
      p_action: permission.action,
    });

    return result.data === true;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Check multiple permissions at once
 */
export async function checkPermissions(
  context: UserContext,
  permissions: Permission[]
): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};

  await Promise.all(
    permissions.map(async (perm) => {
      const key = `${perm.resource}:${perm.action}`;
      results[key] = await hasPermission(context, perm);
    })
  );

  return results;
}

/**
 * Get all permissions for user in school
 */
export async function getUserPermissions(
  userId: string,
  schoolId: string
): Promise<Permission[]> {
  const client = createIdentityClient();

  const { data, error } = await client.rpc('get_user_permissions', {
    p_user_id: userId,
    p_school_id: schoolId,
  });

  if (error) throw error;

  return data.map((p: any) => ({
    resource: p.resource,
    action: p.action,
    name: p.name,
  }));
}

/**
 * Require permission (throw error if not allowed)
 */
export async function requirePermission(
  context: UserContext,
  permission: Permission
): Promise<void> {
  const allowed = await hasPermission(context, permission);

  if (!allowed) {
    throw new Error(
      `Permission denied: ${permission.resource}:${permission.action}`
    );
  }
}

/**
 * Assign role to user in school
 */
export async function assignRole(
  userId: string,
  schoolId: string,
  roleName: string,
  assignedBy: string
): Promise<void> {
  const client = createIdentityClient();

  // Get role ID
  const { data: role } = await client
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .single();

  if (!role) throw new Error(`Role not found: ${roleName}`);

  // Assign role
  await roleQueries.assignRoleToUser(
    client,
    userId,
    schoolId,
    role.id,
    assignedBy
  );
}

/**
 * Remove role from user in school
 */
export async function removeRole(
  userId: string,
  schoolId: string,
  roleName: string
): Promise<void> {
  const client = createIdentityClient();

  // Get role ID
  const { data: role } = await client
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .single();

  if (!role) throw new Error(`Role not found: ${roleName}`);

  // Remove role
  const { error } = await client
    .from('user_school_roles')
    .delete()
    .eq('user_id', userId)
    .eq('school_id', schoolId)
    .eq('role_id', role.id);

  if (error) throw error;
}
```

**File:** `packages/rbac/src/index.ts`

```typescript
export type { Permission, UserContext, CheckPermissionResult } from './types';

export {
  hasPermission,
  checkPermissions,
  getUserPermissions,
  requirePermission,
  assignRole,
  removeRole,
} from './permission-checker';
```

---

## **1.4 Create Identity Provider Next.js App**

### Story: **[STORY-017]** - Initialize Identity Provider App

**Step 1: Create Next.js App**

```bash
cd apps
pnpm create next-app@latest identity-provider --typescript --tailwind --app --src-dir --import-alias "@/*"
```

**Pilih options:**
```
✔ Would you like to use TypeScript? Yes
✔ Would you like to use ESLint? Yes
✔ Would you like to use Tailwind CSS? Yes
✔ Would you like to use `src/` directory? Yes
✔ Would you like to use App Router? Yes
✔ Would you like to customize the default import alias? Yes (@/*)
```

**Step 2: Update package.json**

**File:** `apps/identity-provider/package.json`

```json
{
  "name": "identity-provider",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@repo/ui": "workspace:*",
    "@repo/utils": "workspace:*",
    "@repo/validators": "workspace:*",
    "@repo/types": "workspace:*",
    "@repo/database-identity": "workspace:*",
    "@repo/auth": "workspace:*",
    "@repo/rbac": "workspace:*"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/tsconfig": "workspace:*",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "postcss": "^8",
    "tailwindcss": "^3.4",
    "typescript": "^5"
  }
}
```

**Step 3: Update tsconfig.json**

**File:** `apps/identity-provider/tsconfig.json`

```json
{
  "extends": "@repo/tsconfig/nextjs.json",
  "compilerOptions": {
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Step 4: Create Environment File**

**File:** `apps/identity-provider/.env.example`

```bash
# Supabase Identity Database
IDENTITY_DB_URL=https://xxxxx.supabase.co
IDENTITY_DB_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_IDENTITY_DB_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_IDENTITY_DB_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Better Auth
AUTH_SECRET=your-secret-key-here
NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

# JWT for SSO
JWT_SECRET=your-jwt-secret-key
```

Copy to `.env.local`:
```bash
cp .env.example .env.local
# Fill in actual values
```

**Step 5: Install Dependencies**

```bash
cd ../..
pnpm install
```

---

### Story: **[STORY-018]** - Build Auth Pages

**Step 1: Create Auth Layout**

**File:** `apps/identity-provider/src/app/(auth)/layout.tsx`

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Ekosistem Sekolah',
  description: 'Login to access school management system',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Ekosistem Sekolah
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sistem Manajemen Sekolah Terpadu
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
```

**Step 2: Create Login Page**

**File:** `apps/identity-provider/src/app/(auth)/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button, Input } from '@repo/ui';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="nama@sekolah.com"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Lupa password?
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth loading={loading}>
          Login
        </Button>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Atau login dengan
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => window.location.href = '/api/auth/google'}>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                {/* Google icon SVG */}
              </svg>
              Google
            </Button>

            <Button variant="outline" onClick={() => window.location.href = '/api/auth/microsoft'}>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                {/* Microsoft icon SVG */}
              </svg>
              Microsoft
            </Button>
          </div>
        </div>

        <div className="text-center text-sm">
          <span className="text-gray-600">Belum punya akun? </span>
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Daftar sekarang
          </Link>
        </div>
      </form>
    </div>
  );
}
```

**Step 3: Create API Routes**

**File:** `apps/identity-provider/src/app/api/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { userLoginSchema } from '@repo/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const { email, password } = userLoginSchema.parse(body);

    // Authenticate with Better Auth
    const result = await auth.signIn.email({
      email,
      password,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Set session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('auth_token', result.session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
```

---

## ✅ Phase 1 Acceptance Criteria

### Functional Requirements

- [ ] **Database**
  - [ ] Supabase project created and configured
  - [ ] All tables created with correct schema
  - [ ] RLS policies working correctly
  - [ ] Migrations can be applied cleanly
  - [ ] Seed data populated

- [ ] **Authentication**
  - [ ] Email/password login working
  - [ ] Email/password registration working
  - [ ] Google OAuth working
  - [ ] Microsoft OAuth working
  - [ ] Session management working
  - [ ] Logout working

- [ ] **RBAC**
  - [ ] Roles seeded correctly
  - [ ] Permissions seeded correctly
  - [ ] Permission checking working
  - [ ] Role assignment working
  - [ ] User can have multiple roles in different schools

- [ ] **Identity Provider App**
  - [ ] Login page renders correctly
  - [ ] Register page renders correctly
  - [ ] Dashboard accessible after login
  - [ ] School selection working (if user has multiple schools)
  - [ ] Profile management working
  - [ ] No TypeScript errors
  - [ ] No console errors

### Non-Functional Requirements

- [ ] **Security**
  - [ ] Passwords hashed with bcrypt
  - [ ] JWT tokens signed correctly
  - [ ] RLS policies prevent unauthorized access
  - [ ] No sensitive data in logs
  - [ ] HTTPS in production

- [ ] **Performance**
  - [ ] Login response < 1s
  - [ ] Page load < 2s
  - [ ] Database queries optimized with indexes

- [ ] **Code Quality**
  - [ ] All files TypeScript strict mode
  - [ ] No ESLint errors
  - [ ] No TypeScript errors
  - [ ] Code formatted with Prettier
  - [ ] Functions documented with JSDoc

---

## 🧪 Testing Checklist

### Manual Testing

```bash
# 1. Start development server
cd apps/identity-provider
pnpm dev

# Open http://localhost:3000
```

**Test Cases:**

1. **Registration Flow**
   - [ ] Visit /register
   - [ ] Fill in valid data
   - [ ] Submit form
   - [ ] Receive verification email (check logs)
   - [ ] Verify email
   - [ ] Redirected to dashboard

2. **Login Flow**
   - [ ] Visit /login
   - [ ] Enter valid credentials
   - [ ] Click login
   - [ ] Redirected to dashboard
   - [ ] Session persists on page refresh

3. **OAuth Flow**
   - [ ] Click "Login with Google"
   - [ ] Authorize on Google
   - [ ] Redirected back to app
   - [ ] User created in database
   - [ ] Logged in successfully

4. **RBAC**
   - [ ] Assign role to user via SQL
   - [ ] Check permissions via API
   - [ ] Verify correct permissions returned

### Database Testing

```sql
-- Test user creation
SELECT * FROM users WHERE email = 'test@example.com';

-- Test role assignment
SELECT u.email, r.name
FROM users u
JOIN user_school_roles usr ON usr.user_id = u.id
JOIN roles r ON r.id = usr.role_id;

-- Test permission check
SELECT has_permission(
  'user-uuid',
  'school-uuid',
  'student',
  'read'
);
```

---

## ❌ Common Issues & Solutions

### Issue: "Supabase connection failed"

**Solution:**
```bash
# Check environment variables
echo $IDENTITY_DB_URL
echo $IDENTITY_DB_SERVICE_KEY

# Test connection
curl $IDENTITY_DB_URL/rest/v1/users \
  -H "apikey: $IDENTITY_DB_SERVICE_KEY"
```

### Issue: "Better Auth not working"

**Solution:**
- Check AUTH_SECRET is set
- Check database connection
- Verify users table exists
- Check Better Auth version compatibility

### Issue: "JWT token invalid"

**Solution:**
- Ensure JWT_SECRET matches between IdP and Service Providers
- Check token expiration time
- Verify token signing algorithm

### Issue: "RLS blocking queries"

**Solution:**
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check policies exist
SELECT * FROM pg_policies;

-- Temporarily disable for debugging (DEV ONLY!)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

---

## 📊 Phase 1 Metrics

| Metric | Target | How to Check |
|--------|--------|--------------|
| Database tables | 11 | `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'` |
| Roles seeded | 8 | `SELECT COUNT(*) FROM roles` |
| TypeScript errors | 0 | `pnpm type-check` |
| ESLint warnings | 0 | `pnpm lint` |
| Build time | <30s | `time pnpm build` |
| Login response time | <1s | Browser DevTools Network tab |

---

## 🎓 Phase 1 Stories Summary

| Story | Description | Status |
|-------|-------------|--------|
| [STORY-012](../stories/STORY-012-setup-supabase.md) | Setup Supabase Project | 📋 |
| [STORY-013](../stories/STORY-013-implement-database-schema.md) | Implement Database Schema | 📋 |
| [STORY-014](../stories/STORY-014-create-database-package.md) | Create Database Package | 📋 |
| [STORY-015](../stories/STORY-015-setup-better-auth.md) | Setup Better Auth | 📋 |
| [STORY-016](../stories/STORY-016-create-rbac-package.md) | Create RBAC Package | 📋 |
| [STORY-017](../stories/STORY-017-init-idp-app.md) | Initialize IdP Next.js App | 📋 |
| [STORY-018](../stories/STORY-018-build-auth-pages.md) | Build Auth Pages | 📋 |
| [STORY-019](../stories/STORY-019-implement-jwt-service.md) | Implement JWT Service | 📋 |
| [STORY-020](../stories/STORY-020-build-dashboard.md) | Build Dashboard | 📋 |
| [STORY-021](../stories/STORY-021-implement-sso.md) | Implement SSO | 📋 |

---

## 📝 Next Steps

After completing Phase 1:

1. ✅ **Verify all acceptance criteria met**
2. ✅ **Run full test suite**
3. ✅ **Deploy to staging**
4. ✅ **Create Phase 1 completion report**
5. ✅ **Review with team**
6. ✅ **Proceed to Phase 2: Service Provider Foundation**

---

**Phase Status**: 📘 DOCUMENTED  
**Last Updated**: 2024  
**Ready for**: Implementation
