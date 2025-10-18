# STORY-022: Create Database Package Template

**Epic**: Phase 2 - Service Provider Foundation  
**Sprint**: Week 3 (Day 1-2)  
**Story Points**: 5  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **create a reusable database package template** so that **each Service Provider can quickly setup its own database package with consistent patterns for queries, mutations, and multi-tenancy**.

---

## 🎯 Goals

- Create template structure for Service Provider database packages
- Implement RLS helpers for multi-tenant data access
- Provide query and mutation patterns
- Include tenant context utilities
- Document usage and best practices

---

## ✅ Acceptance Criteria

- [ ] Template directory structure created
- [ ] Supabase client setup (server & browser)
- [ ] RLS helper functions implemented
- [ ] Tenant context utilities created
- [ ] Query/mutation example files provided
- [ ] package.json configured
- [ ] TypeScript configured
- [ ] README with usage instructions
- [ ] Can generate types from Supabase
- [ ] Type-check passes

---

## 🔗 Prerequisites

```bash
# Verify Phase 1 complete
test -d apps/identity-provider && echo "✅ IdP exists"
test -d packages/database-identity && echo "✅ Identity DB exists"

# Should see all ✅
```

---

## 📋 Tasks

### Task 1: Create Directory Structure

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Create template directories
mkdir -p packages/templates/database-service/src/{queries,mutations,utils}

# Verify structure
tree packages/templates/database-service
```

**Expected structure:**
```
database-service/
├── src/
│   ├── queries/
│   ├── mutations/
│   └── utils/
└── (files will be created next)
```

---

### Task 2: Create package.json

**File**: `packages/templates/database-service/package.json`

```json
{
  "name": "@repo/database-template",
  "version": "0.0.0",
  "private": true,
  "description": "Template for Service Provider database packages",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "generate-types": "supabase gen types typescript --project-id $PROJECT_ID > src/types.ts",
    "type-check": "tsc --noEmit",
    "lint": "eslint src/"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@repo/types": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.3.3"
  }
}
```

---

### Task 3: Create TypeScript Config

**File**: `packages/templates/database-service/tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

### Task 4: Create Supabase Client Setup

**File**: `packages/templates/database-service/src/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Create server-side Supabase client
 * Uses service role key for admin operations
 */
export function createServerClient(
  url: string,
  serviceKey: string
) {
  return createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Create browser-side Supabase client
 * Uses anon key for client operations
 */
export function createBrowserClient(
  url: string,
  anonKey: string
) {
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/**
 * Get appropriate client based on environment
 * Server: uses service role key
 * Browser: uses anon key
 */
export function getClient() {
  const url = process.env.NEXT_PUBLIC_SERVICE_DB_URL;
  const key = typeof window === 'undefined'
    ? process.env.SERVICE_DB_SERVICE_KEY
    : process.env.NEXT_PUBLIC_SERVICE_DB_ANON_KEY;

  if (!url || !key) {
    throw new Error('Database credentials not configured');
  }

  return typeof window === 'undefined'
    ? createServerClient(url, key!)
    : createBrowserClient(url, key!);
}
```

---

### Task 5: Create RLS Helper Functions

**File**: `packages/templates/database-service/src/utils/rls-helpers.ts`

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Set school context for Row Level Security
 * This function should be called before any data access
 * to ensure queries are filtered by school_id
 */
export async function setSchoolContext(
  client: SupabaseClient,
  schoolId: string
): Promise<void> {
  const { error } = await client.rpc('set_current_school', {
    school_id: schoolId,
  });

  if (error) {
    throw new Error(`Failed to set school context: ${error.message}`);
  }
}

/**
 * Get current school from RLS context
 */
export async function getCurrentSchool(
  client: SupabaseClient
): Promise<string | null> {
  const { data, error } = await client.rpc('get_current_school');

  if (error) {
    console.error('Failed to get current school:', error);
    return null;
  }

  return data;
}

/**
 * Execute function with school context
 * Automatically sets context before and clears after
 * 
 * Usage:
 * const data = await withSchoolContext(client, schoolId, async () => {
 *   return await getStudents(client);
 * });
 */
export async function withSchoolContext<T>(
  client: SupabaseClient,
  schoolId: string,
  fn: () => Promise<T>
): Promise<T> {
  await setSchoolContext(client, schoolId);
  try {
    return await fn();
  } finally {
    // Clear context after operation
    await client.rpc('clear_current_school');
  }
}

/**
 * Verify school ownership of a record
 * Use this to ensure user can only access their school's data
 */
export async function verifySchoolOwnership(
  client: SupabaseClient,
  table: string,
  recordId: string,
  schoolId: string
): Promise<boolean> {
  const { data, error } = await client
    .from(table)
    .select('school_id')
    .eq('id', recordId)
    .single();

  if (error) return false;
  return data?.school_id === schoolId;
}
```

---

### Task 6: Create Tenant Context Utilities

**File**: `packages/templates/database-service/src/utils/tenant-context.ts`

```typescript
/**
 * Tenant context for multi-tenant operations
 */

export interface TenantContext {
  schoolId: string;
  userId: string;
  roles: string[];
  permissions: string[];
}

/**
 * Extract tenant context from JWT payload
 */
export function extractTenantContext(jwtPayload: any): TenantContext {
  return {
    schoolId: jwtPayload.school_id,
    userId: jwtPayload.user_id,
    roles: jwtPayload.roles || [],
    permissions: jwtPayload.permissions || [],
  };
}

/**
 * Validate tenant context has all required fields
 */
export function validateTenantContext(context: TenantContext): boolean {
  return !!(
    context.schoolId &&
    context.userId &&
    Array.isArray(context.roles) &&
    Array.isArray(context.permissions)
  );
}

/**
 * Build filter object for multi-tenant queries
 * Always include school_id filter
 */
export function buildTenantFilter(
  schoolId: string,
  additionalFilters?: Record<string, any>
): Record<string, any> {
  return {
    school_id: schoolId,
    ...additionalFilters,
  };
}

/**
 * Build insert data with school_id
 * Automatically adds school_id to insert data
 */
export function withSchoolId<T extends Record<string, any>>(
  data: T,
  schoolId: string
): T & { school_id: string } {
  return {
    ...data,
    school_id: schoolId,
  };
}
```

---

### Task 7: Create Query Examples

**File**: `packages/templates/database-service/src/queries/example.ts`

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

// Example type - replace with actual table
type ExampleTable = Database['public']['Tables']['examples']['Row'];

/**
 * Get all examples for a school
 * 
 * Usage:
 * const examples = await getExamples(client, schoolId);
 */
export async function getExamples(
  client: SupabaseClient<Database>,
  schoolId: string
): Promise<ExampleTable[]> {
  const { data, error } = await client
    .from('examples')
    .select('*')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ExampleTable[];
}

/**
 * Get example by ID
 * Includes school_id check for security
 */
export async function getExampleById(
  client: SupabaseClient<Database>,
  id: string,
  schoolId: string
): Promise<ExampleTable | null> {
  const { data, error } = await client
    .from('examples')
    .select('*')
    .eq('id', id)
    .eq('school_id', schoolId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data as ExampleTable;
}

/**
 * Search examples
 */
export async function searchExamples(
  client: SupabaseClient<Database>,
  schoolId: string,
  query: string
): Promise<ExampleTable[]> {
  const { data, error } = await client
    .from('examples')
    .select('*')
    .eq('school_id', schoolId)
    .ilike('name', `%${query}%`)
    .limit(50);

  if (error) throw error;
  return data as ExampleTable[];
}

/**
 * Get paginated examples
 */
export async function getPaginatedExamples(
  client: SupabaseClient<Database>,
  schoolId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{
  data: ExampleTable[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Get total count
  const { count } = await client
    .from('examples')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId);

  // Get page data
  const { data, error } = await client
    .from('examples')
    .select('*')
    .eq('school_id', schoolId)
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return {
    data: data as ExampleTable[],
    total: count || 0,
    page,
    pageSize,
  };
}
```

---

### Task 8: Create Mutation Examples

**File**: `packages/templates/database-service/src/mutations/example.ts`

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';
import { withSchoolId } from '../utils/tenant-context';

type ExampleInsert = Database['public']['Tables']['examples']['Insert'];
type ExampleUpdate = Database['public']['Tables']['examples']['Update'];
type ExampleRow = Database['public']['Tables']['examples']['Row'];

/**
 * Create new example
 * Automatically adds school_id
 */
export async function createExample(
  client: SupabaseClient<Database>,
  data: Omit<ExampleInsert, 'school_id'>,
  schoolId: string
): Promise<ExampleRow> {
  const insertData = withSchoolId(data, schoolId);

  const { data: created, error } = await client
    .from('examples')
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  return created as ExampleRow;
}

/**
 * Update example
 * Verifies school ownership before update
 */
export async function updateExample(
  client: SupabaseClient<Database>,
  id: string,
  schoolId: string,
  updates: ExampleUpdate
): Promise<ExampleRow> {
  const { data, error } = await client
    .from('examples')
    .update(updates)
    .eq('id', id)
    .eq('school_id', schoolId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Example not found or access denied');
    }
    throw error;
  }

  return data as ExampleRow;
}

/**
 * Delete example
 * Verifies school ownership before deletion
 */
export async function deleteExample(
  client: SupabaseClient<Database>,
  id: string,
  schoolId: string
): Promise<void> {
  const { error } = await client
    .from('examples')
    .delete()
    .eq('id', id)
    .eq('school_id', schoolId);

  if (error) throw error;
}

/**
 * Bulk create examples
 */
export async function createManyExamples(
  client: SupabaseClient<Database>,
  items: Omit<ExampleInsert, 'school_id'>[],
  schoolId: string
): Promise<ExampleRow[]> {
  const insertData = items.map(item => withSchoolId(item, schoolId));

  const { data, error } = await client
    .from('examples')
    .insert(insertData)
    .select();

  if (error) throw error;
  return data as ExampleRow[];
}
```

---

### Task 9: Create Main Index

**File**: `packages/templates/database-service/src/index.ts`

```typescript
// Clients
export {
  createServerClient,
  createBrowserClient,
  getClient,
} from './client';

// Types
export type { Database } from './types';

// RLS Utilities
export {
  setSchoolContext,
  getCurrentSchool,
  withSchoolContext,
  verifySchoolOwnership,
} from './utils/rls-helpers';

// Tenant Context
export {
  extractTenantContext,
  validateTenantContext,
  buildTenantFilter,
  withSchoolId,
  type TenantContext,
} from './utils/tenant-context';

// Queries (examples - replace with actual)
export * from './queries/example';

// Mutations (examples - replace with actual)
export * from './mutations/example';
```

---

### Task 10: Create Placeholder Types

**File**: `packages/templates/database-service/src/types.ts`

```typescript
/**
 * This file will be generated by Supabase CLI
 * 
 * Run: pnpm generate-types
 * 
 * This is a placeholder until actual types are generated
 */

export interface Database {
  public: {
    Tables: {
      examples: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
```

---

### Task 11: Create README

**File**: `packages/templates/database-service/README.md`

```markdown
# Database Package Template

Template for creating Service Provider database packages with consistent patterns.

## Quick Start

### 1. Copy Template

\`\`\`bash
cp -r packages/templates/database-service packages/database-[service-name]
\`\`\`

### 2. Update Package Name

Edit `package.json`:
\`\`\`json
{
  "name": "@repo/database-[service-name]"
}
\`\`\`

### 3. Setup Supabase Project

Create Supabase project for your service:
- Go to https://supabase.com
- Create new project
- Note project ID and credentials

### 4. Generate Types

\`\`\`bash
cd packages/database-[service-name]
PROJECT_ID=your-project-id pnpm generate-types
\`\`\`

### 5. Replace Examples

- Replace `examples` table with your actual tables
- Update query/mutation files
- Keep the patterns (multi-tenant filtering, etc.)

## Usage in Service Provider

\`\`\`typescript
import { getClient, setSchoolContext } from '@repo/database-[service-name]';

// Get client
const client = getClient();

// Set school context (from JWT)
await setSchoolContext(client, user.schoolId);

// Query data (automatically filtered by school)
const data = await getYourData(client, user.schoolId);
\`\`\`

## Best Practices

### Always Filter by School ID

\`\`\`typescript
// ✅ Good
const data = await client
  .from('table')
  .select('*')
  .eq('school_id', schoolId);

// ❌ Bad - no school filter
const data = await client
  .from('table')
  .select('*');
\`\`\`

### Use Helper Functions

\`\`\`typescript
// ✅ Good - using helper
const insertData = withSchoolId(data, schoolId);

// ❌ Bad - manual
const insertData = { ...data, school_id: schoolId };
\`\`\`

### Verify Ownership on Updates/Deletes

\`\`\`typescript
// ✅ Good - checks school_id
await client
  .from('table')
  .update(data)
  .eq('id', id)
  .eq('school_id', schoolId);

// ❌ Bad - no ownership check
await client
  .from('table')
  .update(data)
  .eq('id', id);
\`\`\`

## File Structure

\`\`\`
src/
├── client.ts              # Supabase clients
├── types.ts               # Generated types
├── queries/               # Read operations
│   └── example.ts
├── mutations/             # Write operations
│   └── example.ts
├── utils/
│   ├── rls-helpers.ts     # RLS functions
│   └── tenant-context.ts  # Tenant utilities
└── index.ts               # Main exports
\`\`\`

## Scripts

\`\`\`bash
# Generate types from Supabase
pnpm generate-types

# Type check
pnpm type-check

# Lint
pnpm lint
\`\`\`

## Security

### Row Level Security (RLS)

Always enable RLS on tables:

\`\`\`sql
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their school's data"
ON your_table
FOR SELECT
USING (school_id = current_setting('app.current_school_id')::uuid);
\`\`\`

### Service Role vs Anon Key

- **Service Role**: Server-side only, bypasses RLS
- **Anon Key**: Client-side, respects RLS

Use `getClient()` - it chooses the right one based on environment.

## Common Patterns

### Pagination

\`\`\`typescript
export async function getPaginated(
  client: SupabaseClient,
  schoolId: string,
  page: number,
  pageSize: number
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await client
    .from('table')
    .select('*', { count: 'exact' })
    .eq('school_id', schoolId)
    .range(from, to);

  return { data, total: count, page, pageSize };
}
\`\`\`

### Search

\`\`\`typescript
export async function search(
  client: SupabaseClient,
  schoolId: string,
  query: string
) {
  const { data, error } = await client
    .from('table')
    .select('*')
    .eq('school_id', schoolId)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(50);

  return data;
}
\`\`\`

### Soft Delete

\`\`\`typescript
export async function softDelete(
  client: SupabaseClient,
  id: string,
  schoolId: string
) {
  const { error } = await client
    .from('table')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('school_id', schoolId);

  if (error) throw error;
}
\`\`\`

## Troubleshooting

### Error: "Database credentials not configured"

Set environment variables:
\`\`\`bash
NEXT_PUBLIC_SERVICE_DB_URL=https://xxx.supabase.co
SERVICE_DB_SERVICE_KEY=xxx
NEXT_PUBLIC_SERVICE_DB_ANON_KEY=xxx
\`\`\`

### Error: "Failed to set school context"

Ensure RPC function exists in database:
\`\`\`sql
CREATE OR REPLACE FUNCTION set_current_school(school_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_school_id', school_id::text, false);
END;
$$ LANGUAGE plpgsql;
\`\`\`

### Error: "Row Level Security violation"

Check RLS policies are correctly configured for the table.
\`\`\`

---

### Task 12: Install Dependencies

```bash
cd packages/templates/database-service
pnpm install

# Verify
pnpm type-check
```

---

## 🧪 Testing Instructions

### Test 1: Package Builds

```bash
cd packages/templates/database-service

# Type check
pnpm type-check

# Should pass with 0 errors
```

### Test 2: Imports Work

Create test file: `test.ts`
```typescript
import {
  getClient,
  setSchoolContext,
  buildTenantFilter,
} from './src/index';

console.log('✅ All imports successful');
```

Run:
```bash
npx tsx test.ts
rm test.ts
```

### Test 3: Structure Verification

```bash
# Check all files exist
test -f src/client.ts && echo "✅ client.ts"
test -f src/types.ts && echo "✅ types.ts"
test -f src/utils/rls-helpers.ts && echo "✅ rls-helpers.ts"
test -f src/utils/tenant-context.ts && echo "✅ tenant-context.ts"
test -f src/queries/example.ts && echo "✅ queries"
test -f src/mutations/example.ts && echo "✅ mutations"
test -f src/index.ts && echo "✅ index.ts"
test -f README.md && echo "✅ README"

# All should show ✅
```

---

## 📸 Expected Results

```
packages/templates/database-service/
├── package.json               ✅
├── tsconfig.json             ✅
├── README.md                 ✅
└── src/
    ├── client.ts             ✅
    ├── types.ts              ✅
    ├── index.ts              ✅
    ├── queries/
    │   └── example.ts        ✅
    ├── mutations/
    │   └── example.ts        ✅
    └── utils/
        ├── rls-helpers.ts    ✅
        └── tenant-context.ts ✅
```

---

## ❌ Common Errors & Solutions

### Error: "Cannot find module '@supabase/supabase-js'"

```bash
# Install dependencies
cd packages/templates/database-service
pnpm install
```

### Error: "Type 'Database' not found"

**Cause:** types.ts not generated yet

**Solution:** This is expected - types will be generated per service

### Error: "pnpm type-check fails"

Check TypeScript config extends correctly:
```bash
test -f ../../typescript-config/base.json && echo "✅ Config exists"
```

---

## 🔗 Dependencies

- **Depends on**: Phase 0 (Foundation), Phase 1 (Identity Provider)
- **Blocks**: STORY-023, STORY-026

---

## 📚 Resources

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [TypeScript with Supabase](https://supabase.com/docs/guides/api/generating-types)

---

## 💡 Tips

1. **Keep examples generic** - They should work for any table
2. **Always filter by school_id** - This is critical for multi-tenancy
3. **Document patterns** - Future developers will copy these
4. **Type everything** - No `any` types

---

## ✏️ Definition of Done

- [ ] All files created
- [ ] package.json configured
- [ ] TypeScript configured
- [ ] All helper functions implemented
- [ ] Query examples provided
- [ ] Mutation examples provided
- [ ] README complete
- [ ] pnpm install works
- [ ] pnpm type-check passes
- [ ] Code reviewed
- [ ] Story marked complete

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
