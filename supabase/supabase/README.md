# Supabase Identity Database

This directory contains Supabase configuration for the Identity Provider database.

## 📁 Structure

```
supabase/
├── config.toml          # Supabase local configuration
├── migrations/          # Database migration files
├── seed.sql            # Seed data for local development
└── README.md           # This file
```

## 🔗 Linked Project

**Project Name:** ekosistem-identity  
**Project Ref:** [Your project ref from dashboard]  
**Region:** Southeast Asia (Singapore)

## 🚀 Commands

### Start Local Supabase

```bash
cd supabase/supabase
supabase start
```

This starts:
- PostgreSQL database (port 54322)
- Supabase Studio (http://localhost:54323)
- API server (port 54321)
- Auth server, Storage, Realtime, etc.

### Stop Local Supabase

```bash
supabase stop
```

### Database Migrations

```bash
# Create new migration
supabase migration new migration_name

# Apply migrations to local
supabase db reset

# Apply migrations to remote
supabase db push

# Pull migrations from remote
supabase db pull
```

### Link to Remote

```bash
# Link local to remote project
supabase link --project-ref YOUR_PROJECT_REF

# Check link status
supabase status
```

## 📊 Database Access

### Via Supabase Studio

**Local:** http://localhost:54323  
**Cloud:** https://app.supabase.com/project/[your-project-ref]

### Via Connection String

```bash
# From .env.local
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[your-project-ref].supabase.co:5432/postgres
```

## 🔐 Environment Variables

Credentials are stored in `.env.local` (root directory):

- `IDENTITY_DB_URL` - Supabase project URL
- `IDENTITY_DB_SERVICE_KEY` - Service role key (SECRET!)
- `NEXT_PUBLIC_IDENTITY_DB_ANON_KEY` - Anonymous key (public)
- `DATABASE_URL` - PostgreSQL connection string

## 📝 Notes

- Migrations are version-controlled
- seed.sql runs on `supabase start`
- Use migrations for schema changes
- Never commit service role key!

## 🔗 References

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development)
- [Supabase Studio](https://supabase.com/docs/guides/database/overview)
