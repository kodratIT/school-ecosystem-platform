# STORY-012: Setup Supabase Identity Project

**Epic**: Phase 1 - Identity Provider  
**Sprint**: Week 3  
**Story Points**: 3  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **setup Supabase project for Identity database** so that **we have centralized database for authentication and authorization**.

---

## 🎯 Goals

- Create Supabase project for Identity
- Configure project settings
- Get API credentials
- Initialize local Supabase
- Link to remote project

---

## ✅ Acceptance Criteria

- [ ] Supabase project created on cloud
- [ ] Project linked locally
- [ ] API credentials retrieved and saved
- [ ] Local Supabase can connect to remote
- [ ] Database accessible via Supabase Studio

---

## 🔗 Prerequisites

**Before starting this story, ensure Phase 0 is complete:**

```bash
# Verify Phase 0 completion
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Check basics
test -f pnpm-workspace.yaml && echo "✅ Workspace"
test -f turbo.json && echo "✅ Turbo"
test -d packages/ui && echo "✅ Packages ready"

# Should see all ✅
```

If any ❌, complete Phase 0 first!

---

## 📋 Tasks

### Task 1: Install Supabase CLI

```bash
# Install globally
npm install -g supabase

# Verify installation
supabase --version

# Should show: supabase 1.x.x
```

**Troubleshooting:**

If command not found:
```bash
# Try with sudo (if permission denied)
sudo npm install -g supabase

# Or use npx
npx supabase --version
```

---

### Task 2: Create Supabase Account

1. **Visit** https://supabase.com
2. **Click** "Start your project"
3. **Sign up** with:
   - Google account (recommended), or
   - GitHub account, or  
   - Email

**Screenshot checkpoint:**
- You should see Supabase dashboard

---

### Task 3: Create New Project

**Via Supabase Dashboard:**

1. Click "New Project"
2. Select your organization (or create new)
3. Fill in project details:

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `ekosistem-identity` | Clear name for Identity DB |
| **Database Password** | Generate strong password | **IMPORTANT**: Save this! You'll need it |
| **Region** | Southeast Asia (Singapore) | Closest to Indonesia |
| **Pricing Plan** | Free | Good for development |

4. Click "Create new project"
5. Wait ~2 minutes for provisioning

**Important:** While waiting, copy and save the database password!

---

### Task 4: Get Project Credentials

Once project is ready:

1. Go to **Project Settings** (gear icon)
2. Navigate to **API** section
3. Copy these values:

**Project URL:**
```
https://xxxxxxxxxxxxx.supabase.co
```

**Anon/Public Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Service Role Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (different from anon)
```

⚠️ **CRITICAL**: Never commit service role key to git!

---

### Task 5: Save Credentials Locally

**Create file:** `.env.local` (root of project)

```bash
# Identity Database Credentials
IDENTITY_DB_URL=https://xxxxxxxxxxxxx.supabase.co
IDENTITY_DB_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_IDENTITY_DB_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_IDENTITY_DB_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Verify .env.local is in .gitignore:**

```bash
# Check
grep -q ".env.local" .gitignore && echo "✅ Safe" || echo "❌ Add to .gitignore!"
```

---

### Task 6: Login to Supabase CLI

```bash
# Login
supabase login

# This opens browser for authentication
# Follow prompts and authorize

# Verify login
supabase projects list

# Should show your projects including ekosistem-identity
```

---

### Task 7: Initialize Local Supabase

```bash
# Create directory
mkdir -p supabase/identity
cd supabase/identity

# Initialize
supabase init

# This creates:
# - config.toml
# - migrations/ directory
# - seed.sql
```

**Verification:**

```bash
ls -la

# Should see:
# config.toml
# migrations/
# seed.sql
```

---

### Task 8: Link to Remote Project

```bash
# Still in supabase/identity directory

# Get project ref from dashboard
# It's in URL: https://app.supabase.com/project/[PROJECT-REF]

# Link project
supabase link --project-ref YOUR-PROJECT-REF

# Enter database password when prompted
```

**Successful output:**
```
Linked to YOUR-PROJECT-REF
```

---

### Task 9: Test Connection

```bash
# Check status
supabase status

# Test database connection
supabase db dump --data-only

# Should connect without errors
```

---

### Task 10: Access Supabase Studio

**Via CLI:**
```bash
# Start local Supabase (optional for now)
supabase start

# Access Studio at: http://localhost:54323
```

**Via Cloud:**
- Go to https://app.supabase.com
- Select your project
- Access Table Editor, SQL Editor, etc.

---

## 🧪 Testing Instructions

### Test 1: Verify Project Access

```bash
# List projects
supabase projects list

# Should show ekosistem-identity
```

### Test 2: Test Database Connection

```bash
# Try to list tables (should be empty)
supabase db dump

# Should succeed (even if output is empty)
```

### Test 3: Access via Dashboard

1. Visit https://app.supabase.com
2. Select `ekosistem-identity` project
3. Go to "Table Editor"
4. Should load without errors

### Test 4: Verify Credentials Work

```bash
# Test with curl
curl "https://YOUR-PROJECT-REF.supabase.co/rest/v1/" \
  -H "apikey: YOUR-ANON-KEY"

# Should return something (even if error about no tables)
```

---

## 📸 Expected Results

After completing this story:

```
supabase/
└── identity/
    ├── config.toml          ✅ Created
    ├── migrations/          ✅ Directory exists
    └── seed.sql             ✅ Created

.env.local                   ✅ Credentials saved
```

**Terminal:**
```bash
$ supabase projects list
┌──────────────────────────────────────┬─────────────────────┬───────────────────────────────┐
│             Name                     │   Organization      │           Region              │
├──────────────────────────────────────┼─────────────────────┼───────────────────────────────┤
│     ekosistem-identity               │   Your Org          │   Southeast Asia (Singapore)  │
└──────────────────────────────────────┴─────────────────────┴───────────────────────────────┘

$ supabase status
Status: LINKED
Project ref: xxxxxxxxxxxxx
Database: PostgreSQL 15.x
```

---

## ❌ Common Errors & Solutions

### Error: "supabase: command not found"

**Solution:**
```bash
# Reinstall globally
npm install -g supabase

# Or use npx
alias supabase="npx supabase"
```

---

### Error: "Failed to link project"

**Solution:**
- Check project ref is correct (from URL)
- Check database password is correct
- Try with `--password` flag:
  ```bash
  supabase link --project-ref YOUR-REF --password YOUR-PASSWORD
  ```

---

### Error: "Database connection failed"

**Possible causes:**
1. Wrong project ref
2. Wrong password
3. Network issues
4. Project not fully provisioned

**Solution:**
- Wait 2-3 minutes if project just created
- Verify credentials from dashboard
- Check internet connection

---

### Error: "Permission denied"

**Solution:**
```bash
# Login again
supabase logout
supabase login
```

---

## 🔍 Code Review Checklist

- [ ] `.env.local` exists with all credentials
- [ ] `.env.local` is in .gitignore
- [ ] `supabase/identity/` directory structure correct
- [ ] Can access project via dashboard
- [ ] `supabase status` shows LINKED
- [ ] No credentials committed to git

---

## 🔗 Dependencies

- **Depends on**: Phase 0 complete
- **Blocks**: STORY-013 (Database Schema)

---

## 📚 Resources

- [Supabase Quick Start](https://supabase.com/docs/guides/getting-started)
- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Supabase Dashboard](https://app.supabase.com)

---

## 💡 Tips

1. **Save password immediately** - You can't retrieve it later
2. **Use Singapore region** - Closest to Indonesia for better latency
3. **Don't commit credentials** - Always use .env.local
4. **Keep CLI updated** - Run `npm update -g supabase` regularly

---

## 📝 Notes for Next Story

After this story, you will:
- Create database schema (STORY-013)
- Run migrations
- Seed initial data

Save your credentials securely - you'll need them!

---

## ✏️ Definition of Done

- [ ] All acceptance criteria met
- [ ] Supabase project created and accessible
- [ ] Local CLI linked to remote project
- [ ] Credentials saved securely
- [ ] `.env.local` not committed to git
- [ ] Can execute `supabase status` successfully
- [ ] Can access project via dashboard
- [ ] Story marked complete in stories/README.md

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
