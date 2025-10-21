# Setup OAuth Clients Database Types

## Problem

After running the `oauth_clients` migration, the TypeScript types from Supabase need to be regenerated to include the new table. Until types are regenerated, the `@repo/database-identity` package will have type errors.

## Solution

Regenerate Supabase types using the Supabase CLI:

### Step 1: Generate Types

```bash
cd /Users/kodrat/Public/Source Code/ekosistem-sekolah

# Generate types from your Supabase instance
npx supabase gen types typescript --project-id yxbbxrcukpkzlsiobria > packages/database-identity/src/types/database.ts
```

### Step 2: Rebuild Package

```bash
# Rebuild the database-identity package
pnpm --filter @repo/database-identity build
```

### Step 3: Restart Dev Server

```bash
# Restart Next.js dev server to pick up new types
cd apps/identity-provider
pnpm dev
```

## Alternative: Using Supabase Local

If you have Supabase running locally:

```bash
# Generate from local instance
npx supabase gen types typescript --local > packages/database-identity/src/types/database.ts
```

## Verify

After regenerating types, verify the `oauth_clients` table is included:

```bash
grep "oauth_clients" packages/database-identity/src/types/database.ts
```

You should see type definitions for:
- `oauth_clients` table
- Row, Insert, Update types

## Expected Types

The regenerated types should include:

```typescript
export type Database = {
  public: {
    Tables: {
      // ... other tables
      oauth_clients: {
        Row: {
          id: string
          client_id: string
          client_secret_hash: string
          name: string
          // ... other fields
        }
        Insert: {
          // ...
        }
        Update: {
          // ...
        }
      }
      // ... other tables
    }
  }
}
```

## Troubleshooting

### If `npx supabase` command not found

```bash
# Install Supabase CLI
npm install -g supabase
```

### If types regeneration fails

Check your Supabase project ID and ensure you're authenticated:

```bash
npx supabase login
npx supabase link --project-ref yxbbxrcukpkzlsiobria
```

### If build still fails after regeneration

Clear Next.js cache and rebuild:

```bash
rm -rf apps/identity-provider/.next
rm -rf node_modules/.cache
pnpm --filter @repo/database-identity build
pnpm --filter identity-provider dev
```

## Quick Fix (Temporary)

If you need to test immediately without regenerating types, the code has been written to work with runtime - only TypeScript compilation will show errors. The functions will work correctly at runtime.

To bypass type checking temporarily:

```bash
# Build without type declarations
cd packages/database-identity
pnpm tsup src/index.ts --format esm,cjs --no-dts
```

This will build JavaScript bundles but skip TypeScript declarations.
