# STORY-001: Initialize Monorepo with Turborepo

**Epic**: Phase 0 - Foundation & Setup  
**Sprint**: Week 1  
**Story Points**: 3  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **initialize the monorepo structure with Turborepo and PNPM** so that **we can manage multiple applications and shared packages efficiently**.

---

## 🎯 Goals

- Setup PNPM workspace for monorepo
- Configure Turborepo for build orchestration
- Create base package.json with scripts
- Establish folder structure

---

## ✅ Acceptance Criteria

- [ ] `pnpm-workspace.yaml` created and configured
- [ ] `turbo.json` created with pipeline configuration
- [ ] Root `package.json` with all necessary scripts
- [ ] `pnpm install` completes without errors
- [ ] `pnpm turbo --version` shows installed version
- [ ] Folder structure created: `apps/` and `packages/`

---

## 📋 Tasks

### Task 1: Verify Prerequisites
- [ ] Node.js version >= 20.0.0
- [ ] PNPM installed globally (>= 8.0.0)
- [ ] Git initialized in project directory

**Commands:**
```bash
node --version
pnpm --version
git --version
```

**Expected Output:**
```
v20.x.x
8.x.x
git version 2.x.x
```

---

### Task 2: Initialize Package Manager

**Steps:**
```bash
# Navigate to project root
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Initialize package.json
pnpm init

# Install Turborepo
pnpm add -D turbo@latest

# Verify installation
pnpm turbo --version
```

**Verification:**
- ✅ `package.json` exists in root
- ✅ `node_modules/` created
- ✅ `pnpm-lock.yaml` generated

---

### Task 3: Create Workspace Configuration

**Create file:** `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Verification:**
```bash
# This command should not error
pnpm list --depth 0
```

---

### Task 4: Configure Turborepo

**Create file:** `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

**Verification:**
```bash
# Validate turbo.json syntax
pnpm turbo --version
```

---

### Task 5: Update Root package.json

**Edit:** `package.json`

Add these fields:

```json
{
  "name": "ekosistem-sekolah",
  "version": "0.0.0",
  "private": true,
  "description": "SaaS ecosystem for school management with federated identity",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md,css}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,md,css}\"",
    "clean": "turbo run clean && rm -rf node_modules",
    "type-check": "turbo run type-check",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "prettier": "^3.2.5",
    "@changesets/cli": "^2.27.1"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

---

### Task 6: Install Dependencies

```bash
# Install all dependencies
pnpm install

# Verify installation
pnpm list --depth 0
```

**Expected output:**
```
ekosistem-sekolah
├── turbo 2.0.0
├── prettier 3.2.5
└── @changesets/cli 2.27.1
```

---

### Task 7: Create Folder Structure

```bash
# Create directories
mkdir -p apps
mkdir -p packages

# Add .gitkeep to preserve empty directories
touch apps/.gitkeep
touch packages/.gitkeep
```

**Verification:**
```bash
ls -la
# Should show apps/ and packages/ directories
```

---

## 🧪 Testing Instructions

### Manual Testing

1. **Test Turbo Commands:**
```bash
# These should run without errors (even if no packages yet)
pnpm turbo run build --dry
pnpm turbo run dev --dry
pnpm turbo run lint --dry
```

2. **Test Workspace:**
```bash
# List workspace packages (should show none yet)
pnpm list --recursive
```

3. **Test PNPM:**
```bash
# Add a test dependency
pnpm add -D typescript
# Should install to root node_modules

# Remove it
pnpm remove typescript
```

### Automated Checks

```bash
# Check if all required files exist
test -f pnpm-workspace.yaml && echo "✅ Workspace config exists"
test -f turbo.json && echo "✅ Turbo config exists"
test -f package.json && echo "✅ Package.json exists"
test -d apps && echo "✅ Apps directory exists"
test -d packages && echo "✅ Packages directory exists"
```

---

## 📸 Expected Results

After completing this story:

```
ekosistem-sekolah/
├── apps/
│   └── .gitkeep
├── packages/
│   └── .gitkeep
├── node_modules/
├── package.json       ✅ Configured
├── pnpm-lock.yaml     ✅ Generated
├── pnpm-workspace.yaml ✅ Configured
└── turbo.json         ✅ Configured
```

**Terminal output:**
```bash
$ pnpm turbo --version
2.0.0

$ pnpm list --depth 0
ekosistem-sekolah
├── turbo 2.0.0
└── prettier 3.2.5
```

---

## ❌ Common Errors & Solutions

### Error: "ERR_PNPM_NO_MATCHING_VERSION"

**Cause:** Network issues or wrong package name

**Solution:**
```bash
# Clear PNPM cache
pnpm store prune

# Retry installation
pnpm install
```

---

### Error: "Cannot find module 'turbo'"

**Cause:** Turbo not installed correctly

**Solution:**
```bash
# Remove node_modules
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

---

### Error: "Invalid workspace configuration"

**Cause:** Syntax error in pnpm-workspace.yaml

**Solution:**
- Ensure YAML indentation is correct (use spaces, not tabs)
- Validate YAML syntax online

---

## 🔗 Dependencies

- **Blocks**: STORY-002, STORY-003, STORY-004, STORY-005
- **Blocked by**: None (This is the first story)

---

## 📚 Resources

- [Turborepo Handbook](https://turbo.build/repo/docs/handbook)
- [PNPM Workspace](https://pnpm.io/workspaces)
- [Monorepo Best Practices](https://monorepo.tools/)

---

## 👥 Assignee

- **Developer**: TBD
- **Reviewer**: Tech Lead
- **QA**: N/A (Foundation work)

---

## 📝 Notes

- This is the foundation of the entire project - take time to understand the setup
- All future apps and packages will depend on this structure
- If unsure, ask for clarification before proceeding

---

## ✏️ Definition of Done

- [ ] All acceptance criteria met
- [ ] All tasks completed and verified
- [ ] No errors when running `pnpm install`
- [ ] No errors when running `pnpm turbo --version`
- [ ] Code reviewed and approved
- [ ] Documentation updated (if needed)
- [ ] Changes committed to Git

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
