# STORY-005: Setup Git Ignore & Environment Files

**Epic**: Phase 0 - Foundation & Setup  
**Sprint**: Week 1  
**Story Points**: 1  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **setup comprehensive .gitignore and environment file templates** so that **sensitive data, credentials, and build artifacts are never accidentally committed to the repository**.

This story ensures:
- Build artifacts don't bloat the repository
- Sensitive credentials stay local and secure
- Team members know what environment variables are needed
- Consistent environment setup across all developers
- No accidental exposure of secrets

---

## 🎯 Goals

- Create comprehensive .gitignore for all project types
- Create detailed .env.example as template
- Document all environment variables with comments
- Ensure .env.local is always ignored
- Prevent common security mistakes
- Make environment setup easy for new developers

---

## ✅ Acceptance Criteria

- [ ] .gitignore created with patterns for:
  - Node.js (node_modules, logs)
  - Next.js (.next, out, build)
  - TypeScript (*.tsbuildinfo)
  - Turborepo (.turbo)
  - IDEs (.vscode, .idea)
  - OS files (.DS_Store, Thumbs.db)
  - Environment files (.env*.local)
- [ ] .env.example created with:
  - All required environment variables
  - Helpful comments
  - Organized by service
  - No actual secrets (empty values)
- [ ] .env.local is in .gitignore
- [ ] .env.example is tracked in git
- [ ] Test that sensitive files cannot be committed
- [ ] Documentation for new developers

---

## 📋 Tasks

### Task 1: Create Comprehensive .gitignore

**File:** `.gitignore` (project root)

```gitignore
# ===========================================
# Dependencies
# ===========================================
node_modules/
.pnp
.pnp.js
.npm
.yarn

# ===========================================
# Testing
# ===========================================
coverage/
*.log
.nyc_output

# ===========================================
# Next.js
# ===========================================
.next/
out/
build/
dist/

# ===========================================
# Production
# ===========================================
*.tsbuildinfo
next-env.d.ts

# ===========================================
# Misc
# ===========================================
.DS_Store
*.pem

# ===========================================
# Debug Logs
# ===========================================
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# ===========================================
# Local Environment Files
# CRITICAL: Never commit these!
# ===========================================
.env
.env*.local
.env.development.local
.env.test.local
.env.production.local

# But DO commit the example
!.env.example

# ===========================================
# Deployment
# ===========================================
.vercel
.netlify

# ===========================================
# Turborepo
# ===========================================
.turbo

# ===========================================
# IDEs and Editors
# ===========================================
# VSCode
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json.example

# JetBrains IDEs
.idea/
*.iml
*.iws
*.ipr

# Vim
*.swp
*.swo
*~
.vim/

# Emacs
*~
\#*\#
.\#*

# Sublime Text
*.sublime-project
*.sublime-workspace

# ===========================================
# OS Files
# ===========================================
# macOS
.DS_Store
.AppleDouble
.LSOverride
._*

# Windows  
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db
Desktop.ini
$RECYCLE.BIN/

# Linux
.directory
.Trash-*

# ===========================================
# Temporary Files
# ===========================================
*.tmp
*.temp
.cache/
.temp/

# ===========================================
# Database
# ===========================================
*.db
*.sqlite
*.sqlite3

# But allow migration files
!migrations/*.sql
```

**Understanding each section:**

| Section | Purpose | Example |
|---------|---------|---------|
| Dependencies | Prevent committing installed packages | node_modules/ |
| Testing | Exclude test coverage and logs | coverage/ |
| Next.js | Build artifacts | .next/ |
| Environment | **CRITICAL** - Secrets | .env.local |
| IDEs | Editor-specific files | .vscode/ |
| OS | System files | .DS_Store |

---

### Task 2: Create .env.example Template

**File:** `.env.example` (project root)

```bash
# ===========================================
# ENVIRONMENT VARIABLES TEMPLATE
# ===========================================
# HOW TO USE:
# 1. Copy this file to .env.local
# 2. Fill in your actual values
# 3. NEVER commit .env.local to git!
#
# Get credentials from:
# - Supabase: https://app.supabase.com
# - Google OAuth: https://console.cloud.google.com
# - Microsoft OAuth: https://portal.azure.com
# ===========================================

# ===========================================
# IDENTITY PROVIDER DATABASE
# ===========================================
# Get from: Supabase > Project Settings > API
IDENTITY_DB_URL=https://xxxxx.supabase.co
IDENTITY_DB_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Public keys (safe to expose to browser)
NEXT_PUBLIC_IDENTITY_DB_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_IDENTITY_DB_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# BETTER AUTH
# ===========================================
# Generate with: openssl rand -base64 32
AUTH_SECRET=your-secret-key-here-min-32-chars

# Your app URL
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# ===========================================
# OAUTH PROVIDERS
# ===========================================
# Google OAuth
# Get from: https://console.cloud.google.com
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPx-xxxxxxxxxx

# Microsoft OAuth (Optional)
# Get from: https://portal.azure.com
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

# ===========================================
# JWT FOR SSO
# ===========================================
# Generate with: openssl rand -base64 64
JWT_SECRET=your-jwt-secret-key-here

# ===========================================
# INTERNAL API COMMUNICATION
# ===========================================
# For service-to-service calls
# Generate with: openssl rand -hex 32
INTERNAL_API_KEY=

# ===========================================
# SERVICE PROVIDER URLs
# ===========================================
# These will be different per environment
PPDB_APP_URL=http://localhost:3001
SIS_APP_URL=http://localhost:3002
LMS_APP_URL=http://localhost:3003
ACADEMIC_APP_URL=http://localhost:3004
FINANCE_APP_URL=http://localhost:3005

# ===========================================
# PAYMENT GATEWAY
# ===========================================
# Midtrans (Primary)
# Get from: https://dashboard.midtrans.com
MIDTRANS_CLIENT_KEY=
MIDTRANS_SERVER_KEY=
MIDTRANS_IS_PRODUCTION=false

# Xendit (Alternative)
XENDIT_SECRET_KEY=
XENDIT_WEBHOOK_TOKEN=

# ===========================================
# EMAIL SERVICE
# ===========================================
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@yourdomain.com

# SendGrid (Alternative)
SENDGRID_API_KEY=

# ===========================================
# MONITORING & ERROR TRACKING
# ===========================================
# Sentry
# Get from: https://sentry.io/settings/projects
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# ===========================================
# ANALYTICS (Optional)
# ===========================================
# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Google Analytics
NEXT_PUBLIC_GA_ID=

# ===========================================
# DEVELOPMENT (Optional)
# ===========================================
# Disable telemetry
NEXT_TELEMETRY_DISABLED=1

# Debug mode
DEBUG=false

# Node environment
NODE_ENV=development
```

---

### Task 3: Create Setup Instructions

**File:** `docs/ENVIRONMENT_SETUP.md`

```markdown
# Environment Setup Guide

## Quick Start

1. **Copy the template:**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. **Fill in your values** - See sections below

3. **Verify** .env.local is NOT tracked:
   \`\`\`bash
   git status
   # .env.local should NOT appear
   \`\`\`

## Required Variables (Must fill)

### 1. Identity Database (Supabase)

Get from: https://app.supabase.com > Your Project > Settings > API

\`\`\`bash
IDENTITY_DB_URL=https://xxxxx.supabase.co
IDENTITY_DB_SERVICE_KEY=your-service-key
NEXT_PUBLIC_IDENTITY_DB_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_IDENTITY_DB_ANON_KEY=your-anon-key
\`\`\`

### 2. Auth Secrets

Generate secrets:
\`\`\`bash
# Generate AUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET  
openssl rand -base64 64
\`\`\`

### 3. Google OAuth (Required for SSO)

1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: \`http://localhost:3000/api/auth/callback/google\`

## Optional Variables

These can be left empty for development:
- Microsoft OAuth
- Payment gateways
- Email service  
- Monitoring tools

## Security Checklist

- [ ] .env.local is in .gitignore
- [ ] No secrets in .env.example
- [ ] All secrets are strong (32+ characters)
- [ ] Never commit .env.local

## Troubleshooting

**Problem:** "Missing environment variable"
- Check spelling matches .env.example
- Restart dev server after changes

**Problem:** ".env.local is tracked by git"
\`\`\`bash
git rm --cached .env.local
echo ".env.local" >> .gitignore
\`\`\`
```

Create this file:

```bash
mkdir -p docs
# Content will be created in STORY-011
```

---

### Task 4: Verify .gitignore Works

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Test 1: Create .env.local
echo "SECRET_KEY=super-secret-value-123" > .env.local

# Try to add
git add .env.local

# Check status
git status

# Should say: "nothing to commit" or not show .env.local
```

**Expected:** Git ignores .env.local

---

### Task 5: Verify .env.example is Tracked

```bash
# Add .env.example
git add .env.example

# Check status
git status

# Should show .env.example in staging area
```

**Expected:** .env.example IS tracked

---

### Task 6: Test Other Ignored Patterns

```bash
# Test node_modules
mkdir -p test_node_modules
echo "test" > test_node_modules/test.txt
git add test_node_modules
git status
# Should be ignored

# Test .DS_Store
touch .DS_Store
git add .DS_Store
git status
# Should be ignored

# Test build artifacts
mkdir -p .next
echo "build" > .next/test.txt
git add .next
git status  
# Should be ignored

# Cleanup
rm -rf test_node_modules .DS_Store .next .env.local
```

---

## 🧪 Testing Instructions

### Test 1: Secret Files Cannot Be Committed

```bash
# Create various secret files
echo "SECRET=test" > .env.local
echo "SECRET=test" > .env.development.local
echo "SECRET=test" > .env.production.local

# Try to add them
git add .env.local
git add .env.development.local  
git add .env.production.local

# Check status
git status

# Should not show any of these files
```

**Expected:** All .env*.local files ignored

**Cleanup:**
```bash
rm .env.local .env.development.local .env.production.local
```

---

### Test 2: Template is Tracked

```bash
# .env.example should be tracked
git add .env.example
git status

# Should appear in staging
```

**Expected:** Shows `.env.example` ready to commit

---

### Test 3: Build Artifacts Ignored

```bash
# Create fake build artifacts
mkdir -p .next/cache dist out build .turbo
touch .next/test.html
touch dist/bundle.js
touch out/index.html
touch build/app.js

# Try to add
git add .next dist out build .turbo

# Check status
git status

# Should not show these directories
```

**Expected:** All build directories ignored

**Cleanup:**
```bash
rm -rf .next dist out build .turbo
```

---

### Test 4: IDE Files Ignored

```bash
# Create IDE files
mkdir -p .vscode .idea
touch .vscode/settings.json
touch .idea/workspace.xml
touch test.swp

# Try to add
git add .vscode .idea test.swp

# Check status  
git status

# Should not show these files
```

**Expected:** IDE files ignored

**Cleanup:**
```bash
rm -rf .vscode .idea test.swp
```

---

### Test 5: OS Files Ignored

```bash
# Create OS files
touch .DS_Store
touch Thumbs.db
touch .directory

# Try to add
git add .DS_Store Thumbs.db .directory

# Check status
git status

# Should not show these files
```

**Expected:** OS files ignored

**Cleanup:**
```bash
rm .DS_Store Thumbs.db .directory
```

---

## 📸 Expected Results

After completing this story:

```
Root:
├── .gitignore                ✅ Comprehensive patterns
├── .env.example              ✅ Detailed template with comments
├── docs/
│   └── ENVIRONMENT_SETUP.md  ✅ Setup instructions
│
NOT in git:
├── .env.local                ❌ Ignored (secrets safe!)
├── node_modules/             ❌ Ignored
├── .next/                    ❌ Ignored
├── .DS_Store                 ❌ Ignored
└── .idea/                    ❌ Ignored
```

**Terminal output:**
```bash
$ git status
On branch main
Untracked files:
  .env.example
  .gitignore

nothing added to commit but untracked files present

$ git add .env.local
# (no output - file is ignored)

$ git status
# .env.local does NOT appear
```

---

## ❌ Common Errors & Solutions

### Error: ".env.local still appears in git status"

**Cause:** File was already tracked before .gitignore was added

**Solution:**
```bash
# Remove from git tracking (but keep local file)
git rm --cached .env.local

# Commit the removal
git commit -m "chore: stop tracking .env.local"

# Now it will be ignored
git status
```

---

### Error: "node_modules is committed"

**Cause:** node_modules was committed before .gitignore

**Solution:**
```bash
# Remove from git (but keep locally)
git rm -r --cached node_modules

# Commit
git commit -m "chore: stop tracking node_modules"

# Verify
git status
```

---

### Error: ".gitignore not working for existing files"

**Cause:** .gitignore only works for untracked files

**Solution:**
```bash
# Remove all from cache
git rm -r --cached .

# Re-add everything (respecting .gitignore)
git add .

# Check what will be committed
git status

# Commit
git commit -m "chore: apply .gitignore to existing files"
```

---

### Error: "Accidentally committed secrets"

**Cause:** Committed .env.local with secrets

**Solution (if just committed, not pushed):**
```bash
# Undo last commit (keep changes)
git reset HEAD~1

# Remove secret file
git rm --cached .env.local

# Recommit without secrets
git add .
git commit -m "chore: proper commit without secrets"
```

**Solution (if already pushed - CRITICAL):**
```bash
# 1. Remove from history (CAUTION!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# 2. Force push (coordinate with team!)
git push origin --force --all

# 3. ROTATE ALL SECRETS IMMEDIATELY!
# Change all passwords, API keys, etc. in .env.local
```

---

## 🔍 Code Review Checklist

Reviewer should verify:

- [ ] .gitignore includes all necessary patterns
- [ ] .env.example has NO actual secrets
- [ ] All env vars in .env.example have comments
- [ ] .env.local is in .gitignore
- [ ] .env.example is tracked
- [ ] Tested: Secret files cannot be committed
- [ ] Tested: Build artifacts ignored
- [ ] Documentation created for setup

---

## 🔗 Dependencies

- **Depends on**: STORY-001 (Git initialized)
- **Blocks**: None (but critical for security of all future work)

---

## 📚 Resources

- [Git Ignore Patterns](https://git-scm.com/docs/gitignore)
- [GitHub .gitignore Templates](https://github.com/github/gitignore)
- [Environment Variables Best Practices](https://12factor.net/config)
- [OpenSSL Secret Generation](https://www.openssl.org/docs/man1.1.1/man1/rand.html)

---

## 💡 Tips

1. **Use strong secrets** - Min 32 characters, use `openssl rand`
2. **Document every variable** - Future you will thank you
3. **Commit .env.example** - Helps new developers
4. **Never commit .env.local** - Even "temporarily"
5. **Check before pushing** - Run `git status` always
6. **Rotate secrets if exposed** - Change immediately if committed
7. **Use .env.local for all secrets** - Don't use .env directly

---

## 📝 Notes for Next Story

After this story, you have:
- ✅ Secrets protected from accidental commits
- ✅ Build artifacts excluded
- ✅ Team has environment template
- ✅ Security best practices enforced

Next (STORY-006) will create @repo/ui package with shared components.

**Your secrets are now safe! 🔒**

---

## ✏️ Definition of Done

- [ ] All acceptance criteria met
- [ ] .gitignore created with comprehensive patterns
- [ ] .env.example created with all variables documented
- [ ] Setup documentation created
- [ ] Tested: Secret files cannot be committed
- [ ] Tested: Build artifacts ignored
- [ ] Tested: .env.example is tracked
- [ ] .gitignore committed to repository
- [ ] .env.example committed to repository
- [ ] Team informed about setup process
- [ ] Code reviewed and approved

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
