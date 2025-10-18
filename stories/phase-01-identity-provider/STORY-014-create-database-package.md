# STORY-014: Create @repo/database-identity Package

**Epic**: Phase 1 - Identity Provider  
**Sprint**: Week 3  
**Story Points**: 3  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **create a typed database client package for the Identity database** so that **all applications can interact with the Identity DB with full type safety and consistent queries**.

This package will provide:
- Supabase client configuration
- Typed database client
- Query builders for common operations
- Database types auto-generated from schema
- Transaction helpers
- Error handling utilities

---

## 🎯 Goals

- Create @repo/database-identity package
- Setup Supabase client with proper config
- Generate TypeScript types from database
- Create typed query builders
- Add transaction support
- Implement error handling
- Full type safety with TypeScript

---

## ✅ Acceptance Criteria

- [ ] `packages/database-identity` created
- [ ] Supabase client configured
- [ ] Database types generated
- [ ] Query builders for all tables:
  - Schools, Users, Roles, Permissions
  - Sessions, OAuth, Audit Logs
- [ ] Transaction helpers
- [ ] Error handling utilities
- [ ] Type-safe queries
- [ ] Properly exported
- [ ] Documentation complete

---

## 📋 Tasks

### Task 1: Create Package Structure

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

mkdir -p packages/database-identity/src/{client,queries,types,utils}

ls -R packages/database-identity/
```

---

### Task 2: Create package.json

**File:** `packages/database-identity/package.json`

```json
{
  "name": "@repo/database-identity",
  "version": "0.1.0",
  "private": true,
  "description": "Identity database client with type safety",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "generate-types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types/database.ts",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@repo/types": "workspace:*"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@repo/eslint-config": "workspace:*",
    "tsup": "^8.0.1",
    "typescript": "^5.3.3"
  }
}
```

---

### Task 3: Generate Database Types

```bash
cd packages/database-identity

# Install Supabase CLI if not installed
brew install supabase/tap/supabase

# Login to Supabase
supabase login

# Generate types
pnpm generate-types
```

**File:** `packages/database-identity/src/types/database.ts`

```typescript
// This file will be auto-generated
// Manual version for reference:

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string
          name: string
          slug: string
          logo: string | null
          npsn: string
          education_level: 'tk' | 'sd' | 'smp' | 'sma' | 'smk'
          email: string
          phone: string
          website: string | null
          address: string
          village: string
          district: string
          city: string
          province: string
          postal_code: string | null
          principal_name: string
          principal_phone: string
          is_active: boolean
          subscription_tier: 'free' | 'basic' | 'premium' | 'enterprise'
          subscription_starts_at: string | null
          subscription_ends_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['schools']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['schools']['Insert']>
      }
      users: {
        Row: {
          id: string
          school_id: string | null
          email: string
          email_verified: boolean
          email_verified_at: string | null
          password_hash: string | null
          name: string
          avatar: string | null
          phone: string | null
          role: 'super_admin' | 'school_admin' | 'teacher' | 'student' | 'parent' | 'finance_staff'
          is_active: boolean
          is_banned: boolean
          banned_reason: string | null
          banned_at: string | null
          last_login_at: string | null
          last_login_ip: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      // ... other tables
    }
    Views: {}
    Functions: {
      log_audit: {
        Args: {
          p_action: string
          p_resource_type?: string
          p_resource_id?: string
          p_description?: string
          p_old_values?: Json
          p_new_values?: Json
          p_metadata?: Json
        }
        Returns: string
      }
    }
  }
}
```

---

### Task 4: Create Supabase Client

**File:** `packages/database-identity/src/client/supabase.ts`

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

let supabaseClient: SupabaseClient<Database> | null = null;

/**
 * Get Supabase client instance (singleton)
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.IDENTITY_DB_URL;
  const supabaseKey = process.env.IDENTITY_DB_SERVICE_KEY || process.env.NEXT_PUBLIC_IDENTITY_DB_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials. Check IDENTITY_DB_URL and IDENTITY_DB_SERVICE_KEY');
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // Server-side, no session storage
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
}

/**
 * Create client with custom auth token
 */
export function createAuthClient(accessToken: string): SupabaseClient<Database> {
  const supabaseUrl = process.env.IDENTITY_DB_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_IDENTITY_DB_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

/**
 * Get client for browser (uses anon key)
 */
export function getBrowserClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_IDENTITY_DB_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_IDENTITY_DB_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing public Supabase credentials');
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
```

---

### Task 5: Create Error Handler

**File:** `packages/database-identity/src/utils/errors.ts`

```typescript
import type { PostgrestError } from '@supabase/supabase-js';

export class DatabaseError extends Error {
  code: string;
  details?: string;
  hint?: string;

  constructor(error: PostgrestError) {
    super(error.message);
    this.name = 'DatabaseError';
    this.code = error.code;
    this.details = error.details;
    this.hint = error.hint;
  }
}

/**
 * Handle Supabase errors
 */
export function handleDatabaseError(error: PostgrestError): never {
  throw new DatabaseError(error);
}

/**
 * Check if error is unique constraint violation
 */
export function isUniqueViolation(error: unknown): boolean {
  return error instanceof DatabaseError && error.code === '23505';
}

/**
 * Check if error is foreign key violation
 */
export function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof DatabaseError && error.code === '23503';
}

/**
 * Check if error is not found
 */
export function isNotFound(error: unknown): boolean {
  return error instanceof DatabaseError && error.code === 'PGRST116';
}
```

---

### Task 6: Create Query Builders - Schools

**File:** `packages/database-identity/src/queries/schools.ts`

```typescript
import { getSupabaseClient } from '../client/supabase';
import { handleDatabaseError } from '../utils/errors';
import type { Database } from '../types/database';

type School = Database['public']['Tables']['schools']['Row'];
type SchoolInsert = Database['public']['Tables']['schools']['Insert'];
type SchoolUpdate = Database['public']['Tables']['schools']['Update'];

/**
 * Get all active schools
 */
export async function getActiveSchools(): Promise<School[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) handleDatabaseError(error);
  return data || [];
}

/**
 * Get school by ID
 */
export async function getSchoolById(id: string): Promise<School | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    handleDatabaseError(error);
  }
  
  return data;
}

/**
 * Get school by slug
 */
export async function getSchoolBySlug(slug: string): Promise<School | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    handleDatabaseError(error);
  }
  
  return data;
}

/**
 * Create new school
 */
export async function createSchool(school: SchoolInsert): Promise<School> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('schools')
    .insert(school)
    .select()
    .single();

  if (error) handleDatabaseError(error);
  return data;
}

/**
 * Update school
 */
export async function updateSchool(id: string, updates: SchoolUpdate): Promise<School> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('schools')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) handleDatabaseError(error);
  return data;
}

/**
 * Soft delete school
 */
export async function deleteSchool(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('schools')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) handleDatabaseError(error);
}
```

---

### Task 7: Create Query Builders - Users

**File:** `packages/database-identity/src/queries/users.ts`

```typescript
import { getSupabaseClient } from '../client/supabase';
import { handleDatabaseError } from '../utils/errors';
import type { Database } from '../types/database';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    handleDatabaseError(error);
  }
  
  return data;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    handleDatabaseError(error);
  }
  
  return data;
}

/**
 * Get users by school
 */
export async function getUsersBySchool(schoolId: string, role?: string): Promise<User[]> {
  const supabase = getSupabaseClient();
  
  let query = supabase
    .from('users')
    .select('*')
    .eq('school_id', schoolId)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (role) {
    query = query.eq('role', role);
  }

  const { data, error } = await query;

  if (error) handleDatabaseError(error);
  return data || [];
}

/**
 * Create user
 */
export async function createUser(user: UserInsert): Promise<User> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      ...user,
      email: user.email.toLowerCase(),
    })
    .select()
    .single();

  if (error) handleDatabaseError(error);
  return data;
}

/**
 * Update user
 */
export async function updateUser(id: string, updates: UserUpdate): Promise<User> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) handleDatabaseError(error);
  return data;
}

/**
 * Update last login
 */
export async function updateLastLogin(userId: string, ip: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('users')
    .update({
      last_login_at: new Date().toISOString(),
      last_login_ip: ip,
    })
    .eq('id', userId);

  if (error) handleDatabaseError(error);
}

/**
 * Ban user
 */
export async function banUser(userId: string, reason: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('users')
    .update({
      is_banned: true,
      banned_reason: reason,
      banned_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) handleDatabaseError(error);
}
```

---

### Task 8: Create Query Builders - Audit Logs

**File:** `packages/database-identity/src/queries/audit.ts`

```typescript
import { getSupabaseClient } from '../client/supabase';
import { handleDatabaseError } from '../utils/errors';
import type { Database } from '../types/database';

type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

/**
 * Log audit event
 */
export async function logAudit(params: {
  action: string;
  resourceType?: string;
  resourceId?: string;
  description?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.rpc('log_audit', {
    p_action: params.action,
    p_resource_type: params.resourceType || null,
    p_resource_id: params.resourceId || null,
    p_description: params.description || null,
    p_old_values: params.oldValues || null,
    p_new_values: params.newValues || null,
    p_metadata: params.metadata || null,
  });

  if (error) handleDatabaseError(error);
  return data;
}

/**
 * Get audit logs
 */
export async function getAuditLogs(filters?: {
  userId?: string;
  schoolId?: string;
  action?: string;
  resourceType?: string;
  limit?: number;
}): Promise<AuditLog[]> {
  const supabase = getSupabaseClient();
  
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters?.schoolId) {
    query = query.eq('school_id', filters.schoolId);
  }
  if (filters?.action) {
    query = query.eq('action', filters.action);
  }
  if (filters?.resourceType) {
    query = query.eq('resource_type', filters.resourceType);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) handleDatabaseError(error);
  return data || [];
}
```

---

### Task 9: Create Main Index

**File:** `packages/database-identity/src/index.ts`

```typescript
// Client
export { getSupabaseClient, createAuthClient, getBrowserClient } from './client/supabase';

// Queries
export * from './queries/schools';
export * from './queries/users';
export * from './queries/audit';

// Types
export type { Database } from './types/database';

// Utils
export * from './utils/errors';
```

---

### Task 10: Create README

**File:** `packages/database-identity/README.md`

```markdown
# @repo/database-identity

Type-safe Identity database client for Supabase.

## Installation

\`\`\`typescript
import { getSupabaseClient, getUserById } from '@repo/database-identity';
\`\`\`

## Usage

### Get Client

\`\`\`typescript
import { getSupabaseClient } from '@repo/database-identity';

const supabase = getSupabaseClient();
\`\`\`

### Query Users

\`\`\`typescript
import { getUserById, getUserByEmail, createUser } from '@repo/database-identity';

// Get user
const user = await getUserById('user-id');

// Get by email
const user = await getUserByEmail('john@example.com');

// Create user
const newUser = await createUser({
  email: 'john@example.com',
  name: 'John Doe',
  role: 'teacher',
  school_id: 'school-id',
});
\`\`\`

### Audit Logging

\`\`\`typescript
import { logAudit } from '@repo/database-identity';

await logAudit({
  action: 'user.created',
  resourceType: 'users',
  resourceId: user.id,
  description: 'New user created',
  newValues: { email: user.email, name: user.name },
});
\`\`\`

## Type Safety

All queries are fully typed:

\`\`\`typescript
import type { Database } from '@repo/database-identity';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
\`\`\`

## Error Handling

\`\`\`typescript
import { getUserById, isNotFound, DatabaseError } from '@repo/database-identity';

try {
  const user = await getUserById('invalid-id');
} catch (error) {
  if (isNotFound(error)) {
    console.log('User not found');
  } else if (error instanceof DatabaseError) {
    console.error('Database error:', error.message);
  }
}
\`\`\`

## Generate Types

\`\`\`bash
pnpm generate-types
\`\`\`
```

---

## 🧪 Testing Instructions

### Test 1: Build Package

```bash
cd packages/database-identity
pnpm install
pnpm build
```

---

### Test 2: Test Queries

```typescript
import { getUserByEmail, getActiveSchools } from '@repo/database-identity';

// Test
const schools = await getActiveSchools();
console.log('Schools:', schools.length);

const user = await getUserByEmail('test@example.com');
console.log('User:', user?.name);
```

---

## 📸 Expected Results

```
packages/database-identity/
├── dist/                    ✅ Built files
├── src/
│   ├── client/
│   │   └── supabase.ts     ✅ Client config
│   ├── queries/
│   │   ├── schools.ts      ✅ School queries
│   │   ├── users.ts        ✅ User queries
│   │   └── audit.ts        ✅ Audit queries
│   ├── types/
│   │   └── database.ts     ✅ Generated types
│   ├── utils/
│   │   └── errors.ts       ✅ Error handling
│   └── index.ts            ✅ Main export
└── README.md               ✅ Documentation
```

---

## ❌ Common Errors & Solutions

### Error: "Missing Supabase credentials"

**Solution:**
```bash
# Add to .env.local
IDENTITY_DB_URL=https://xxx.supabase.co
IDENTITY_DB_SERVICE_KEY=xxx
```

---

### Error: "Type generation failed"

**Solution:**
```bash
supabase login
pnpm generate-types
```

---

## 🔗 Dependencies

- **Depends on**: STORY-013 (Database schema)
- **Blocks**: STORY-015 (Better Auth), STORY-017 (IdP App)

---

## 💡 Tips

1. **Regenerate types** after schema changes
2. **Use service key** on server, anon key on client
3. **Handle errors** with type guards
4. **Log important actions** with audit
5. **Use transactions** for multi-step operations

---

## ✏️ Definition of Done

- [ ] Package created and built
- [ ] Supabase client configured
- [ ] Database types generated
- [ ] Query builders implemented
- [ ] Error handling complete
- [ ] Tests passing
- [ ] Documentation complete
- [ ] Can be imported from other packages

---

**Created**: 2024  
**Story Owner**: Development Team
