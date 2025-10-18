# STORY-002: Setup TypeScript Configuration

**Epic**: Phase 0 - Foundation & Setup  
**Sprint**: Week 1  
**Story Points**: 2  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **configure TypeScript with strict mode for the entire monorepo** so that **we have type safety and prevent runtime errors**.

---

## 🎯 Goals

- Install TypeScript
- Create base TypeScript configuration
- Create shared TypeScript configs package
- Setup configs for Next.js and React packages

---

## ✅ Acceptance Criteria

- [ ] TypeScript installed as dev dependency
- [ ] Root `tsconfig.json` created
- [ ] `@repo/tsconfig` package created with base, Next.js, and React configs
- [ ] No TypeScript errors when running `tsc --noEmit`
- [ ] Strict mode enabled with zero compromises

---

## 📋 Tasks

### Task 1: Install TypeScript

```bash
# Navigate to project root
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Install TypeScript
pnpm add -D typescript@latest

# Verify installation
pnpm tsc --version
```

**Expected output:**
```
Version 5.3.3
```

---

### Task 2: Create Root TypeScript Config

**Create file:** `tsconfig.json` (root)

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Default",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "incremental": true,
    "forceConsistentCasingInFileNames": true
  },
  "exclude": ["node_modules", ".next", "dist", "build"]
}
```

**Verification:**
```bash
# Should complete without errors
pnpm tsc --noEmit
```

---

### Task 3: Create @repo/tsconfig Package

**Create directory structure:**
```bash
mkdir -p packages/config/tsconfig
cd packages/config/tsconfig
```

**Create file:** `packages/config/tsconfig/package.json`

```json
{
  "name": "@repo/tsconfig",
  "version": "0.0.0",
  "private": true,
  "main": "index.js",
  "files": [
    "base.json",
    "nextjs.json",
    "react.json"
  ]
}
```

---

### Task 4: Create Base Config

**Create file:** `packages/config/tsconfig/base.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Base",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "incremental": true,
    "forceConsistentCasingInFileNames": true
  },
  "exclude": ["node_modules"]
}
```

**Key Settings Explained:**

| Setting | Purpose |
|---------|---------|
| `strict: true` | Enables all strict type checking |
| `noUncheckedIndexedAccess` | Prevents undefined array access |
| `noUnusedLocals` | Flags unused variables |
| `noUnusedParameters` | Flags unused function parameters |
| `forceConsistentCasingInFileNames` | Enforces consistent file name casing |

---

### Task 5: Create Next.js Config

**Create file:** `packages/config/tsconfig/nextjs.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Next.js",
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Next.js Specific Settings:**

- `jsx: "preserve"` - Let Next.js handle JSX transformation
- `plugins: [{"name": "next"}]` - Enable Next.js TypeScript plugin
- `paths: {"@/*": ["./src/*"]}` - Path alias for imports

---

### Task 6: Create React Library Config

**Create file:** `packages/config/tsconfig/react.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "React Library",
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["DOM", "ES2020"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "target": "ES2019",
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist"
  }
}
```

**React Library Specific:**

- `jsx: "react-jsx"` - Modern JSX transform (no React import needed)
- `declaration: true` - Generate .d.ts files
- `declarationMap: true` - Generate source maps for declarations

---

### Task 7: Install @repo/tsconfig Package

```bash
# Return to root
cd ../../..

# Install workspace packages
pnpm install

# Verify @repo/tsconfig is available
pnpm list @repo/tsconfig
```

**Expected output:**
```
@repo/tsconfig 0.0.0
```

---

## 🧪 Testing Instructions

### Test 1: Verify TypeScript Installation

```bash
# Check TypeScript version
pnpm tsc --version

# Should output: Version 5.x.x
```

### Test 2: Test Base Config

```bash
# Create a test file with intentional error
cat > test-typescript.ts << 'EOF'
const message: string = 123; // Should error
EOF

# Run type check (should show error)
pnpm tsc --noEmit test-typescript.ts

# Clean up
rm test-typescript.ts
```

**Expected:** TypeScript error about type mismatch

### Test 3: Test Strict Mode

```bash
# Create test file with potential null access
cat > test-strict.ts << 'EOF'
const arr = ['a', 'b', 'c'];
const item = arr[10]; // Should warn with noUncheckedIndexedAccess
item.toUpperCase(); // Should error because item could be undefined
EOF

# Run type check
pnpm tsc --noEmit test-strict.ts

# Clean up
rm test-strict.ts
```

**Expected:** TypeScript errors about potential undefined

### Test 4: Verify @repo/tsconfig Package

```bash
# Check package files exist
ls packages/config/tsconfig/

# Should show:
# base.json
# nextjs.json
# react.json
# package.json
```

---

## 📸 Expected Results

After completing this story:

```
ekosistem-sekolah/
├── packages/
│   └── config/
│       └── tsconfig/
│           ├── base.json       ✅
│           ├── nextjs.json     ✅
│           ├── react.json      ✅
│           └── package.json    ✅
├── tsconfig.json               ✅
└── package.json (with typescript)
```

**Terminal output:**
```bash
$ pnpm tsc --version
Version 5.3.3

$ pnpm tsc --noEmit
# No errors

$ pnpm list @repo/tsconfig
@repo/tsconfig 0.0.0
```

---

## ❌ Common Errors & Solutions

### Error: "Cannot find module '@repo/tsconfig'"

**Solution:**
```bash
# Reinstall workspace packages
pnpm install

# If still failing, check pnpm-workspace.yaml includes packages/*
```

---

### Error: "Module not found: Can't resolve 'X'"

**Cause:** Missing type definitions

**Solution:**
```bash
# Install type definitions
pnpm add -D @types/node @types/react @types/react-dom
```

---

### Error: "Cannot use JSX unless the '--jsx' flag is provided"

**Cause:** Missing jsx setting in tsconfig

**Solution:**
- Ensure correct config is extended (nextjs.json or react.json)
- Check jsx compiler option is set

---

## 🔍 Code Review Checklist

Reviewer should verify:

- [ ] `strict: true` is enabled in all configs
- [ ] `noUncheckedIndexedAccess: true` is set
- [ ] All configs extend from base.json
- [ ] Package.json has correct files array
- [ ] No `any` types in examples
- [ ] Comments explain non-obvious settings

---

## 🔗 Dependencies

- **Depends on**: STORY-001 (Initialize Monorepo)
- **Blocks**: STORY-006, STORY-007, STORY-008, STORY-009 (All shared packages need TypeScript)

---

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript tsconfig Reference](https://www.typescriptlang.org/tsconfig)
- [Next.js TypeScript](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
- [Strict Mode Guide](https://www.typescriptlang.org/docs/handbook/2/basic-types.html#strictness)

---

## 💡 Tips

1. **Always use strict mode** - It catches bugs early
2. **Avoid `any` type** - Use `unknown` if type is truly unknown
3. **Use type inference** - Let TypeScript infer types when obvious
4. **Add JSDoc comments** - For complex types or functions

---

## ✏️ Definition of Done

- [ ] All acceptance criteria met
- [ ] All tasks completed and verified
- [ ] TypeScript installed and working
- [ ] All config files created
- [ ] `pnpm tsc --noEmit` passes with no errors
- [ ] @repo/tsconfig package usable
- [ ] Code reviewed and approved
- [ ] Changes committed to Git

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
