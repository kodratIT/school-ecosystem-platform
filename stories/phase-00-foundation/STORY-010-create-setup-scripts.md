# STORY-010: Create Setup Scripts

**Epic**: Phase 0 - Foundation & Setup  
**Sprint**: Week 2  
**Story Points**: 2  
**Priority**: P1 (High)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **create automation scripts for common setup tasks** so that **development environment setup, testing, and deployment are streamlined and consistent**.

This includes scripts for:
- Initial project setup
- Development environment
- Running tests across all packages
- Building all packages
- Database migrations
- Generating types from database
- Cleaning build artifacts

---

## 🎯 Goals

- Create setup and initialization scripts
- Automate common development tasks
- Create helper scripts for testing and building
- Setup database migration scripts
- Create cleanup utilities
- Document all scripts

---

## ✅ Acceptance Criteria

- [ ] `scripts/` directory created
- [ ] Setup script (`setup.sh`)
- [ ] Development helper scripts
- [ ] Test runner scripts
- [ ] Build scripts
- [ ] Database scripts
- [ ] Cleanup scripts
- [ ] All scripts documented
- [ ] Scripts are executable
- [ ] Error handling in all scripts

---

## 📋 Tasks

### Task 1: Create Scripts Directory

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

mkdir -p scripts/{setup,dev,test,build,db,utils}

ls -R scripts/
```

---

### Task 2: Create Main Setup Script

**File:** `scripts/setup.sh`

```bash
#!/usr/bin/env bash

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  School Ecosystem - Project Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js $(node --version)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}pnpm not found. Installing...${NC}"
    npm install -g pnpm
fi
echo -e "${GREEN}✓${NC} pnpm $(pnpm --version)"

# Check git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found. Please install Git${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Git $(git --version | head -n 1)"

echo ""
echo -e "${YELLOW}Installing dependencies...${NC}"
pnpm install

echo ""
echo -e "${YELLOW}Building packages...${NC}"
pnpm build --filter=@repo/*

echo ""
echo -e "${YELLOW}Setting up git hooks...${NC}"
pnpm prepare

echo ""
echo -e "${YELLOW}Creating .env.local files...${NC}"
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✓${NC} Created .env.local"
    echo -e "${YELLOW}⚠️  Please fill in your environment variables in .env.local${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local already exists${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Fill in .env.local with your credentials"
echo "2. Run: pnpm dev"
echo ""
```

---

### Task 3: Create Development Scripts

**File:** `scripts/dev/start-all.sh`

```bash
#!/usr/bin/env bash

# Start all applications in development mode

set -e

echo "🚀 Starting all applications..."
echo ""

# Start in parallel using turbo
pnpm dev
```

**File:** `scripts/dev/start-idp.sh`

```bash
#!/usr/bin/env bash

# Start Identity Provider app only

set -e

echo "🚀 Starting Identity Provider..."
pnpm dev --filter=@apps/identity-provider
```

**File:** `scripts/dev/clean.sh`

```bash
#!/usr/bin/env bash

# Clean all build artifacts and dependencies

set -e

echo "🧹 Cleaning project..."
echo ""

# Remove node_modules
echo "Removing node_modules..."
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# Remove build artifacts
echo "Removing build artifacts..."
find . -name "dist" -type d -prune -exec rm -rf '{}' +
find . -name ".next" -type d -prune -exec rm -rf '{}' +
find . -name ".turbo" -type d -prune -exec rm -rf '{}' +
find . -name "out" -type d -prune -exec rm -rf '{}' +

# Remove coverage
echo "Removing coverage..."
find . -name "coverage" -type d -prune -exec rm -rf '{}' +

# Remove TypeScript build info
echo "Removing TypeScript build info..."
find . -name "*.tsbuildinfo" -type f -delete

echo ""
echo "✅ Clean complete!"
echo "Run: pnpm install"
```

---

### Task 4: Create Test Scripts

**File:** `scripts/test/run-all.sh`

```bash
#!/usr/bin/env bash

# Run all tests across all packages

set -e

echo "🧪 Running all tests..."
echo ""

pnpm test --filter=@repo/*

echo ""
echo "✅ All tests passed!"
```

**File:** `scripts/test/coverage.sh`

```bash
#!/usr/bin/env bash

# Run tests with coverage report

set -e

echo "🧪 Running tests with coverage..."
echo ""

pnpm test:coverage --filter=@repo/*

echo ""
echo "📊 Coverage reports generated in each package's coverage/ folder"
```

**File:** `scripts/test/watch.sh`

```bash
#!/usr/bin/env bash

# Run tests in watch mode

PACKAGE=$1

if [ -z "$PACKAGE" ]; then
    echo "Usage: ./scripts/test/watch.sh <package-name>"
    echo "Example: ./scripts/test/watch.sh @repo/utils"
    exit 1
fi

echo "🧪 Running tests in watch mode for $PACKAGE..."
pnpm test:watch --filter=$PACKAGE
```

---

### Task 5: Create Build Scripts

**File:** `scripts/build/build-all.sh`

```bash
#!/usr/bin/env bash

# Build all packages and apps

set -e

echo "🏗️  Building all packages and apps..."
echo ""

# Build packages first
echo "Building packages..."
pnpm build --filter=@repo/*

echo ""
echo "Building apps..."
pnpm build --filter=@apps/*

echo ""
echo "✅ Build complete!"
```

**File:** `scripts/build/build-packages.sh`

```bash
#!/usr/bin/env bash

# Build only workspace packages

set -e

echo "🏗️  Building packages..."
pnpm build --filter=@repo/*
echo "✅ Packages built!"
```

**File:** `scripts/build/check-types.sh`

```bash
#!/usr/bin/env bash

# Type check all packages

set -e

echo "🔍 Type checking..."
echo ""

pnpm typecheck

echo ""
echo "✅ Type check passed!"
```

---

### Task 6: Create Database Scripts

**File:** `scripts/db/migrate.sh`

```bash
#!/usr/bin/env bash

# Run database migrations

set -e

DB=$1

if [ -z "$DB" ]; then
    echo "Usage: ./scripts/db/migrate.sh <database>"
    echo "Example: ./scripts/db/migrate.sh identity"
    exit 1
fi

echo "🗄️  Running migrations for $DB database..."

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Run migrations based on database
case $DB in
    identity)
        echo "Migrating Identity database..."
        # Add migration command here
        # Example: supabase db push
        ;;
    ppdb)
        echo "Migrating PPDB database..."
        ;;
    *)
        echo "Unknown database: $DB"
        exit 1
        ;;
esac

echo "✅ Migration complete!"
```

**File:** `scripts/db/seed.sh`

```bash
#!/usr/bin/env bash

# Seed database with test data

set -e

DB=$1

if [ -z "$DB" ]; then
    echo "Usage: ./scripts/db/seed.sh <database>"
    exit 1
fi

echo "🌱 Seeding $DB database..."

# Add seeding logic here

echo "✅ Seeding complete!"
```

**File:** `scripts/db/reset.sh`

```bash
#!/usr/bin/env bash

# Reset database (⚠️  DANGER: Deletes all data!)

set -e

DB=$1

if [ -z "$DB" ]; then
    echo "Usage: ./scripts/db/reset.sh <database>"
    exit 1
fi

echo "⚠️  WARNING: This will delete all data in $DB database!"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo "🗑️  Resetting $DB database..."

# Add reset logic here

echo "✅ Database reset!"
```

---

### Task 7: Create Utility Scripts

**File:** `scripts/utils/generate-types.sh`

```bash
#!/usr/bin/env bash

# Generate TypeScript types from database schema

set -e

DB=$1

if [ -z "$DB" ]; then
    echo "Usage: ./scripts/utils/generate-types.sh <database>"
    exit 1
fi

echo "📝 Generating types for $DB database..."

# Add type generation logic (e.g., supabase gen types)

echo "✅ Types generated!"
```

**File:** `scripts/utils/check-deps.sh`

```bash
#!/usr/bin/env bash

# Check for outdated dependencies

set -e

echo "🔍 Checking for outdated dependencies..."
echo ""

pnpm outdated

echo ""
echo "To update: pnpm update"
```

**File:** `scripts/utils/lint-fix.sh`

```bash
#!/usr/bin/env bash

# Run linter and fix issues

set -e

echo "🔧 Running linter with auto-fix..."
pnpm lint --fix

echo "✅ Linting complete!"
```

---

### Task 8: Create Pre-commit Script

**File:** `scripts/pre-commit.sh`

```bash
#!/usr/bin/env bash

# Pre-commit checks (used by Husky)

set -e

echo "🔍 Running pre-commit checks..."

# Type check
echo "Type checking..."
pnpm typecheck

# Lint staged files
echo "Linting..."
pnpm lint-staged

# Run tests for changed packages
echo "Testing..."
pnpm test --filter=[HEAD^1] --bail

echo "✅ Pre-commit checks passed!"
```

---

### Task 9: Create Package.json Scripts

Update root `package.json` to include script shortcuts:

```json
{
  "scripts": {
    "setup": "bash scripts/setup.sh",
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "test:coverage": "turbo test:coverage",
    "lint": "turbo lint",
    "lint:fix": "bash scripts/utils/lint-fix.sh",
    "typecheck": "turbo typecheck",
    "clean": "bash scripts/dev/clean.sh",
    "db:migrate": "bash scripts/db/migrate.sh",
    "db:seed": "bash scripts/db/seed.sh",
    "check:deps": "bash scripts/utils/check-deps.sh"
  }
}
```

---

### Task 10: Make Scripts Executable

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Make all scripts executable
chmod +x scripts/**/*.sh

# Verify
ls -la scripts/
```

---

### Task 11: Create Scripts README

**File:** `scripts/README.md`

```markdown
# Scripts Documentation

Automation scripts for development, testing, and deployment.

## Setup

### Initial Setup

\`\`\`bash
pnpm setup
\`\`\`

Runs complete project setup:
- Installs dependencies
- Builds packages
- Sets up git hooks
- Creates .env.local

## Development

### Start All Apps

\`\`\`bash
pnpm dev
\`\`\`

### Start Specific App

\`\`\`bash
bash scripts/dev/start-idp.sh
\`\`\`

### Clean Project

\`\`\`bash
pnpm clean
\`\`\`

Removes:
- node_modules
- Build artifacts (.next, dist, out)
- Coverage reports
- TypeScript build info

## Testing

### Run All Tests

\`\`\`bash
pnpm test
\`\`\`

### Run with Coverage

\`\`\`bash
pnpm test:coverage
\`\`\`

### Watch Mode

\`\`\`bash
bash scripts/test/watch.sh @repo/utils
\`\`\`

## Building

### Build All

\`\`\`bash
pnpm build
\`\`\`

### Build Packages Only

\`\`\`bash
bash scripts/build/build-packages.sh
\`\`\`

### Type Check

\`\`\`bash
pnpm typecheck
\`\`\`

## Database

### Run Migrations

\`\`\`bash
pnpm db:migrate identity
\`\`\`

### Seed Database

\`\`\`bash
pnpm db:seed identity
\`\`\`

### Reset Database (⚠️  DANGER)

\`\`\`bash
bash scripts/db/reset.sh identity
\`\`\`

## Utilities

### Generate Types

\`\`\`bash
bash scripts/utils/generate-types.sh identity
\`\`\`

### Check Dependencies

\`\`\`bash
pnpm check:deps
\`\`\`

### Lint & Fix

\`\`\`bash
pnpm lint:fix
\`\`\`

## Script Structure

\`\`\`
scripts/
├── setup.sh              # Main setup script
├── setup/                # Setup utilities
├── dev/                  # Development scripts
│   ├── start-all.sh
│   ├── start-idp.sh
│   └── clean.sh
├── test/                 # Testing scripts
│   ├── run-all.sh
│   ├── coverage.sh
│   └── watch.sh
├── build/                # Build scripts
│   ├── build-all.sh
│   ├── build-packages.sh
│   └── check-types.sh
├── db/                   # Database scripts
│   ├── migrate.sh
│   ├── seed.sh
│   └── reset.sh
└── utils/                # Utility scripts
    ├── generate-types.sh
    ├── check-deps.sh
    └── lint-fix.sh
\`\`\`

## Adding New Scripts

1. Create script file in appropriate directory
2. Add shebang: `#!/usr/bin/env bash`
3. Add `set -e` for error handling
4. Make executable: `chmod +x script.sh`
5. Document in this README

## Best Practices

- Always use `set -e` to exit on errors
- Add help text for scripts with parameters
- Use colors for better readability
- Handle errors gracefully
- Document all scripts
```

---

## 🧪 Testing Instructions

### Test 1: Run Setup Script

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Make executable
chmod +x scripts/setup.sh

# Run
bash scripts/setup.sh
```

**Expected:** Complete setup successfully

---

### Test 2: Test Clean Script

```bash
# Create some build artifacts
mkdir -p test/.next test/dist
touch test/.next/test.txt

# Run clean
bash scripts/dev/clean.sh

# Verify clean
ls test/  # Should be empty or not exist
```

---

### Test 3: Test All Scripts

```bash
# Make all executable
chmod +x scripts/**/*.sh

# Test each
bash scripts/test/run-all.sh
bash scripts/build/build-packages.sh
bash scripts/utils/check-deps.sh
```

---

## 📸 Expected Results

```
scripts/
├── README.md              ✅ Documentation
├── setup.sh               ✅ Main setup (executable)
├── dev/
│   ├── start-all.sh      ✅ Start all apps
│   ├── start-idp.sh      ✅ Start IdP
│   └── clean.sh          ✅ Clean project
├── test/
│   ├── run-all.sh        ✅ Run all tests
│   ├── coverage.sh       ✅ Coverage report
│   └── watch.sh          ✅ Watch mode
├── build/
│   ├── build-all.sh      ✅ Build all
│   ├── build-packages.sh ✅ Build packages
│   └── check-types.sh    ✅ Type check
├── db/
│   ├── migrate.sh        ✅ Run migrations
│   ├── seed.sh           ✅ Seed database
│   └── reset.sh          ✅ Reset database
└── utils/
    ├── generate-types.sh ✅ Generate types
    ├── check-deps.sh     ✅ Check deps
    └── lint-fix.sh       ✅ Lint & fix
```

---

## ❌ Common Errors & Solutions

### Error: "Permission denied"

```bash
chmod +x scripts/**/*.sh
```

---

### Error: "pnpm: command not found"

```bash
npm install -g pnpm
```

---

### Error: "Script fails silently"

**Cause:** Missing `set -e`

**Solution:** Add at top of script:
```bash
set -e  # Exit on error
```

---

## 🔍 Code Review Checklist

- [ ] All scripts have shebang
- [ ] All scripts use `set -e`
- [ ] Scripts have error handling
- [ ] Parameters validated
- [ ] Help text for complex scripts
- [ ] Scripts are executable
- [ ] Documentation complete

---

## 🔗 Dependencies

- **Depends on**: 
  - STORY-001 (Monorepo)
  - STORY-004 (Git hooks)
- **Blocks**: None

---

## 📚 Resources

- [Bash Scripting Guide](https://www.gnu.org/software/bash/manual/)
- [Shell Check](https://www.shellcheck.net/)

---

## 💡 Tips

1. **Use set -e** - Exit on first error
2. **Validate parameters** - Check required args
3. **Add colors** - Better user experience
4. **Error messages** - Clear and helpful
5. **Idempotent** - Safe to run multiple times
6. **Document** - Help future developers

---

## 📝 Notes for Next Story

After this story:
- ✅ Automated setup process
- ✅ Development helpers
- ✅ Testing automation
- ✅ Build automation

Next (STORY-011) creates comprehensive documentation.

---

## ✏️ Definition of Done

- [ ] All acceptance criteria met
- [ ] All scripts created
- [ ] Scripts are executable
- [ ] Scripts tested and working
- [ ] Error handling implemented
- [ ] Documentation complete
- [ ] Package.json scripts added
- [ ] Code reviewed and approved

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
