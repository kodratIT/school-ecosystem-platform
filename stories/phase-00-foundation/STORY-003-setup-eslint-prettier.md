# STORY-003: Setup ESLint & Prettier

**Epic**: Phase 0 - Foundation & Setup  
**Sprint**: Week 1  
**Story Points**: 2  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **configure ESLint and Prettier for code quality** so that **all code follows consistent style and catches errors early**.

---

## 🎯 Goals

- Setup ESLint with TypeScript support
- Setup Prettier for code formatting
- Create shared ESLint config package
- Configure integration between ESLint and Prettier
- Auto-format on save

---

## ✅ Acceptance Criteria

- [ ] ESLint installed and configured
- [ ] Prettier installed and configured
- [ ] @repo/eslint-config package created
- [ ] No ESLint errors in codebase
- [ ] Code auto-formats with Prettier
- [ ] ESLint and Prettier work together without conflicts

---

## 📋 Tasks

### Task 1: Install Dependencies

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Install ESLint and Prettier
pnpm add -D eslint prettier eslint-config-prettier eslint-plugin-prettier

# Install TypeScript ESLint
pnpm add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Install React and Next.js plugins
pnpm add -D eslint-config-next eslint-plugin-react eslint-plugin-react-hooks
```

---

### Task 2: Create ESLint Config Package

```bash
mkdir -p packages/config/eslint-config
cd packages/config/eslint-config
```

**File:** `packages/config/eslint-config/package.json`

```json
{
  "name": "@repo/eslint-config",
  "version": "0.0.0",
  "private": true,
  "main": "index.js",
  "files": [
    "base.js",
    "next.js",
    "react.js"
  ],
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.3",
    "eslint-plugin-react": "^7.34.0",
    "eslint-plugin-react-hooks": "^4.6.0"
  }
}
```

---

### Task 3: Create Base ESLint Config

**File:** `packages/config/eslint-config/base.js`

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    es6: true,
    node: true,
  },
};
```

---

### Task 4: Create Next.js ESLint Config

**File:** `packages/config/eslint-config/next.js`

```javascript
module.exports = {
  extends: [
    './base.js',
    'next/core-web-vitals',
  ],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/no-unescaped-entities': 'off',
  },
};
```

---

### Task 5: Create React Library Config

**File:** `packages/config/eslint-config/react.js`

```javascript
module.exports = {
  extends: [
    './base.js',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
};
```

---

### Task 6: Create Root ESLint Config

**File:** `.eslintrc.js` (project root)

```javascript
module.exports = {
  root: true,
  extends: ['@repo/eslint-config/base.js'],
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'dist/',
    'build/',
    'coverage/',
  ],
};
```

---

### Task 7: Create Prettier Config

**File:** `.prettierrc` (project root)

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 80,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**File:** `.prettierignore`

```
node_modules/
.next/
dist/
build/
coverage/
pnpm-lock.yaml
*.md
```

---

### Task 8: Add Scripts to Root package.json

```json
{
  "scripts": {
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md,css}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,md,css}\""
  }
}
```

---

### Task 9: Install Package

```bash
cd ../../..
pnpm install
```

---

### Task 10: Test Configuration

```bash
# Test lint
pnpm lint

# Test format
pnpm format

# Should run without errors
```

---

## 🧪 Testing Instructions

### Test 1: Verify ESLint Works

```bash
# Create test file with errors
cat > test-eslint.ts << 'EOF'
const unused = 123;  // Should warn: unused variable
const foo: any = "test";  // Should warn: any type
EOF

# Run ESLint
pnpm eslint test-eslint.ts

# Should show warnings
# Clean up
rm test-eslint.ts
```

### Test 2: Verify Prettier Works

```bash
# Create badly formatted file
cat > test-prettier.ts << 'EOF'
const   foo=     "bar"   ;
const baz={a:1,b:2};
EOF

# Format
pnpm prettier --write test-prettier.ts

# Should be formatted nicely
cat test-prettier.ts

# Clean up
rm test-prettier.ts
```

### Test 3: Verify Integration

```bash
# Both should work together
pnpm format
pnpm lint

# No conflicts expected
```

---

## 📸 Expected Results

```
packages/config/eslint-config/
├── base.js              ✅
├── next.js              ✅
├── react.js             ✅
└── package.json         ✅

Root:
├── .eslintrc.js         ✅
├── .prettierrc          ✅
└── .prettierignore      ✅
```

**Terminal:**
```bash
$ pnpm lint
✓ All packages passed linting

$ pnpm format
✓ All files formatted
```

---

## ❌ Common Errors & Solutions

### Error: "Cannot find module '@repo/eslint-config'"

**Solution:**
```bash
cd packages/config/eslint-config
pnpm install
cd ../../..
pnpm install
```

---

### Error: "Parsing error: Cannot find module 'typescript'"

**Solution:**
```bash
pnpm add -D typescript
```

---

### Error: "Delete `␍` prettier/prettier"

**Cause:** Line ending conflicts (Windows CRLF vs Unix LF)

**Solution:**
Update `.prettierrc`:
```json
{
  "endOfLine": "auto"
}
```

---

## 🔗 Dependencies

- **Depends on**: STORY-001 (Monorepo), STORY-002 (TypeScript)
- **Blocks**: STORY-004, STORY-006, STORY-007 (All need linting)

---

## ✏️ Definition of Done

- [ ] All acceptance criteria met
- [ ] @repo/eslint-config package created
- [ ] Root .eslintrc.js configured
- [ ] Prettier configured
- [ ] `pnpm lint` passes with 0 errors
- [ ] `pnpm format` works
- [ ] No conflicts between ESLint and Prettier
- [ ] Code reviewed and approved

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
