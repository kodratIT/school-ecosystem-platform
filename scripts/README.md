# 🛠️ Scripts

Automation scripts for development, testing, and deployment.

## 📋 Quick Reference

### Initial Setup

```bash
# First time setup
./scripts/setup.sh
```

### Development

```bash
# Clean project
./scripts/dev/clean.sh

# Reset to fresh state
./scripts/dev/reset.sh

# Run all checks
./scripts/dev/check-all.sh
```

### Testing

```bash
# Run all tests
./scripts/test/run-all.sh

# Run with coverage
./scripts/test/coverage.sh

# Watch mode
./scripts/test/watch.sh
```

### Building

```bash
# Build everything
./scripts/build/all.sh

# Build packages only
./scripts/build/packages.sh

# Check before build
./scripts/build/check.sh
```

### Utils

```bash
# Show project info
./scripts/utils/info.sh
```

## 📂 Directory Structure

```
scripts/
├── setup.sh              # Main setup script
├── dev/                  # Development helpers
│   ├── clean.sh          # Clean artifacts
│   ├── reset.sh          # Reset project
│   └── check-all.sh      # Run all checks
├── test/                 # Testing scripts
│   ├── run-all.sh        # Run all tests
│   ├── coverage.sh       # Coverage report
│   └── watch.sh          # Watch mode
├── build/                # Build scripts
│   ├── all.sh            # Build all
│   ├── packages.sh       # Build packages
│   └── check.sh          # Pre-build checks
└── utils/                # Utility scripts
    └── info.sh           # Project info
```

## 🚀 Setup Script

**`./scripts/setup.sh`**

Initial project setup. Checks prerequisites, installs dependencies, sets up git hooks.

**Prerequisites:**
- Node.js 20+
- PNPM 8+
- Git

**What it does:**
1. Checks Node.js, PNPM, Git
2. Installs dependencies
3. Sets up git hooks (Husky)
4. Creates .env.local from template

**Usage:**
```bash
./scripts/setup.sh
```

## 🔧 Development Scripts

### clean.sh

Remove all build artifacts and dependencies.

**What it removes:**
- node_modules
- dist, .next, out, .turbo
- *.tsbuildinfo
- coverage

**Usage:**
```bash
./scripts/dev/clean.sh
```

### reset.sh

Reset project to fresh state. Runs clean + reinstall.

**Usage:**
```bash
./scripts/dev/reset.sh
```

### check-all.sh

Run all quality checks before committing.

**What it checks:**
- TypeScript type-check
- ESLint
- Prettier format

**Usage:**
```bash
./scripts/dev/check-all.sh
```

## 🧪 Test Scripts

### run-all.sh

Run all tests across workspace using Turbo.

**Usage:**
```bash
./scripts/test/run-all.sh
```

### coverage.sh

Run tests with coverage report.

**Usage:**
```bash
./scripts/test/coverage.sh
```

Report saved to `coverage/` directory.

### watch.sh

Run tests in watch mode for TDD.

**Usage:**
```bash
./scripts/test/watch.sh
```

Press Ctrl+C to stop.

## 🏗️ Build Scripts

### all.sh

Build all packages and applications.

**Usage:**
```bash
./scripts/build/all.sh
```

### packages.sh

Build only shared packages (`@repo/*`).

**Usage:**
```bash
./scripts/build/packages.sh
```

Useful when you only changed shared packages.

### check.sh

Run all checks before building.

**What it does:**
1. Type-check
2. Lint
3. Build

**Usage:**
```bash
./scripts/build/check.sh
```

## 🛠️ Utility Scripts

### info.sh

Display project information and useful commands.

**Usage:**
```bash
./scripts/utils/info.sh
```

## 🔄 Common Workflows

### Starting New Development

```bash
# Clone and setup
git clone <repo>
cd ekosistem-sekolah
./scripts/setup.sh

# Fill in .env.local
nano .env.local

# Start development
pnpm dev
```

### Before Committing

```bash
# Run checks
./scripts/dev/check-all.sh

# If all pass, commit
git add .
git commit -m "feat: my changes"
```

### Fixing Environment Issues

```bash
# Reset everything
./scripts/dev/reset.sh

# Restart development
pnpm dev
```

### Running CI Locally

```bash
# Full CI workflow
./scripts/dev/check-all.sh
./scripts/test/run-all.sh
./scripts/build/all.sh
```

## 📝 Notes

- All scripts use `set -e` (exit on error)
- Scripts are executable (`chmod +x`)
- Color-coded output for better UX
- Error messages show in red
- Success messages show in green

## 🔗 Related

- [Development Guide](../GET-STARTED.md)
- [Project README](../README.md)
- [AI Quick Start](../AI-QUICK-START.md)
