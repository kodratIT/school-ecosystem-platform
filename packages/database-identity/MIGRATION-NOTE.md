# Database Types Regeneration Required

## After Applying Migration

After applying the migration `20250121000002_create_password_reset_tokens.sql`, regenerate the database types:

```bash
cd /Users/kodrat/Public/Source Code/ekosistem-sekolah

# Generate types from Supabase instance
npx supabase gen types typescript --project-id yxbbxrcukpkzlsiobria > packages/database-identity/src/types/database.ts

# Rebuild the package
pnpm --filter @repo/database-identity build
```

## Tables Requiring Types

- `password_reset_tokens` (STORY-026 Task 1)

## Related Migrations

- `supabase/supabase/migrations/20250121000002_create_password_reset_tokens.sql`
