# PHASE 0: Foundation & Setup

**Duration**: 2 Weeks  
**Team**: 2-3 Full-stack Developers  
**Priority**: CRITICAL - All subsequent phases depend on this  
**Goal**: Establish robust monorepo foundation with zero technical debt

---

## 📋 Overview

Phase 0 adalah fondasi dari seluruh ekosistem. Di phase ini kita setup:
1. Monorepo infrastructure dengan Turborepo + PNPM
2. Shared packages untuk code reusability
3. Development environment yang consistent
4. Tooling untuk DX (Developer Experience)

**⚠️ CRITICAL**: Kesalahan di phase ini akan compound ke semua phase berikutnya!

---

## 🎯 Phase Objectives

- [x] Monorepo structure yang scalable untuk 16+ aplikasi
- [x] Shared packages foundation
- [x] TypeScript configuration yang strict dan consistent
- [x] Linting & formatting automation
- [x] Git workflow setup
- [x] Development environment documentation
- [x] Zero build errors, zero warnings

---

## 📂 Target Folder Structure

```
ekosistem-sekolah/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── pr-checks.yml
├── .husky/
│   ├── pre-commit
│   └── pre-push
├── apps/
│   └── .gitkeep
├── packages/
│   ├── config/
│   │   ├── eslint-config/
│   │   ├── tsconfig/
│   │   └── tailwind-config/
│   ├── ui/
│   │   ├── src/
│   │   │   └── components/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── utils/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── validators/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── types/
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── scripts/
│   ├── setup.sh
│   └── check-dependencies.sh
├── docs/
│   ├── SETUP.md
│   └── CONTRIBUTING.md
├── .env.example
├── .gitignore
├── .npmrc
├── .prettierrc
├── .prettierignore
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── README.md
└── tsconfig.json
```

---

## 🚀 Implementation Guide

### **0.1 Project Initialization**

#### Story: **[STORY-001]** - Initialize Monorepo with Turborepo

**Prerequisites:**
- Node.js 20.x atau lebih baru
- PNPM 8.x atau lebih baru

**Step-by-step:**

```bash
# 1. Verify Node.js version
node --version  # Should be >= 20.0.0

# 2. Install PNPM globally (if not installed)
npm install -g pnpm@latest

# 3. Verify PNPM installation
pnpm --version  # Should be >= 8.0.0

# 4. Navigate to project directory
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# 5. Initialize package.json
pnpm init

# 6. Install Turborepo
pnpm add -D turbo

# 7. Create workspace configuration
touch pnpm-workspace.yaml
```

**File: `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**File: `package.json` (root)**

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

**File: `turbo.json`**

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
# Install dependencies
pnpm install

# Verify turbo is working
pnpm turbo --version

# Expected output: 2.0.0 (or latest version)
```

**Acceptance Criteria:**
- ✅ `pnpm-workspace.yaml` created
- ✅ `turbo.json` configured
- ✅ `package.json` with all scripts
- ✅ `pnpm install` runs without errors
- ✅ `pnpm turbo --version` shows version

---

#### Story: **[STORY-002]** - Setup TypeScript Configuration

**Step-by-step:**

```bash
# 1. Install TypeScript
pnpm add -D typescript

# 2. Create base TypeScript config
touch tsconfig.json
```

**File: `tsconfig.json` (root)**

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

**Create shared TypeScript configs package:**

```bash
# Create package directory
mkdir -p packages/config/tsconfig

# Create package.json
cat > packages/config/tsconfig/package.json << 'EOF'
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
EOF
```

**File: `packages/config/tsconfig/base.json`**

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

**File: `packages/config/tsconfig/nextjs.json`**

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

**File: `packages/config/tsconfig/react.json`**

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

**Acceptance Criteria:**
- ✅ Root `tsconfig.json` exists
- ✅ `@repo/tsconfig` package created
- ✅ Base, Next.js, and React configs available
- ✅ No TypeScript errors when running `tsc --noEmit`

---

#### Story: **[STORY-003]** - Setup ESLint & Prettier

**Install dependencies:**

```bash
# ESLint and Prettier
pnpm add -D eslint prettier eslint-config-prettier eslint-plugin-prettier

# TypeScript ESLint
pnpm add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser

# React and Next.js
pnpm add -D eslint-config-next eslint-plugin-react eslint-plugin-react-hooks
```

**Create ESLint config package:**

```bash
mkdir -p packages/config/eslint-config
```

**File: `packages/config/eslint-config/package.json`**

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

**File: `packages/config/eslint-config/base.js`**

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

**File: `packages/config/eslint-config/next.js`**

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

**File: `packages/config/eslint-config/react.js`**

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

**File: `.eslintrc.js` (root)**

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

**File: `.prettierrc`**

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

**File: `.prettierignore`**

```
node_modules/
.next/
dist/
build/
coverage/
pnpm-lock.yaml
*.md
```

**Acceptance Criteria:**
- ✅ `@repo/eslint-config` package created
- ✅ `.eslintrc.js` configured
- ✅ `.prettierrc` configured
- ✅ `pnpm lint` runs without errors
- ✅ `pnpm format` formats all files

---

#### Story: **[STORY-004]** - Setup Git Hooks with Husky

**Install Husky and lint-staged:**

```bash
pnpm add -D husky lint-staged

# Initialize Husky
pnpm exec husky init
```

**File: `.husky/pre-commit`**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

**File: `.husky/pre-push`**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm type-check
```

**File: `package.json` (add to root)**

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

**Make hooks executable:**

```bash
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

**Acceptance Criteria:**
- ✅ Husky installed and initialized
- ✅ Pre-commit hook runs lint-staged
- ✅ Pre-push hook runs type-check
- ✅ Hooks are executable

---

#### Story: **[STORY-005]** - Setup Git Ignore

**File: `.gitignore`**

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.log

# Next.js
.next/
out/
build/
dist/

# Production
*.tsbuildinfo

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Local env files
.env*.local
.env
!.env.example

# Vercel
.vercel

# Turbo
.turbo

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
Thumbs.db
```

**File: `.env.example`**

```bash
# Identity Provider
IDENTITY_DB_URL=
IDENTITY_DB_SERVICE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Better Auth
AUTH_SECRET=
BETTER_AUTH_URL=

# OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

# JWT
JWT_SECRET=

# Internal API
INTERNAL_API_KEY=

# Service Provider URLs
PPDB_APP_URL=
SIS_APP_URL=
LMS_APP_URL=

# Payment Gateway
MIDTRANS_CLIENT_KEY=
MIDTRANS_SERVER_KEY=

# Email Service
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

---

### **0.2 Shared Packages Foundation**

#### Story: **[STORY-006]** - Create @repo/ui Package

**Setup package:**

```bash
mkdir -p packages/ui/src/components
cd packages/ui
```

**File: `packages/ui/package.json`**

```json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.tsx",
  "types": "./src/index.tsx",
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/tsconfig": "workspace:*",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "eslint": "^8.57.0",
    "react": "^18.2.0",
    "typescript": "^5.3.0"
  },
  "peerDependencies": {
    "react": "^18.2.0"
  }
}
```

**File: `packages/ui/tsconfig.json`**

```json
{
  "extends": "@repo/tsconfig/react.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**File: `packages/ui/.eslintrc.js`**

```javascript
module.exports = {
  extends: ['@repo/eslint-config/react.js'],
};
```

**File: `packages/ui/src/components/button.tsx`**

```typescript
import * as React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`button button--${variant} button--${size} ${className || ''}`}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
```

**File: `packages/ui/src/components/card.tsx`**

```typescript
import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`card ${className || ''}`}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
```

**File: `packages/ui/src/index.tsx`**

```typescript
export { Button, type ButtonProps } from './components/button';
export { Card, type CardProps } from './components/card';
```

**Install dependencies:**

```bash
cd ../..
pnpm install
```

**Acceptance Criteria:**
- ✅ `@repo/ui` package created
- ✅ Button and Card components implemented
- ✅ TypeScript types exported
- ✅ No lint errors
- ✅ No TypeScript errors

---

#### Story: **[STORY-007]** - Create @repo/utils Package

**Setup package:**

```bash
mkdir -p packages/utils/src
```

**File: `packages/utils/package.json`**

```json
{
  "name": "@repo/utils",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/tsconfig": "workspace:*",
    "eslint": "^8.57.0",
    "typescript": "^5.3.0"
  }
}
```

**File: `packages/utils/tsconfig.json`**

```json
{
  "extends": "@repo/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**File: `packages/utils/src/date.ts`**

```typescript
/**
 * Format date to Indonesian locale
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'long' = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Get academic year from date
 * Example: 2024-08-01 → "2024/2025"
 */
export function getAcademicYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 0-indexed
  
  // Academic year starts in July (month 7)
  if (month >= 7) {
    return `${year}/${year + 1}`;
  }
  
  return `${year - 1}/${year}`;
}

/**
 * Check if date is within range
 */
export function isDateInRange(
  date: Date,
  start: Date,
  end: Date
): boolean {
  return date >= start && date <= end;
}
```

**File: `packages/utils/src/format.ts`**

```typescript
/**
 * Format currency to Indonesian Rupiah
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format phone number to Indonesian format
 */
export function formatPhone(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Convert 08xx to +628xx
  if (cleaned.startsWith('08')) {
    return `+62${cleaned.slice(1)}`;
  }
  
  // Add +62 if not present
  if (!cleaned.startsWith('62')) {
    return `+62${cleaned}`;
  }
  
  return `+${cleaned}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}...`;
}
```

**File: `packages/utils/src/string.ts`**

```typescript
/**
 * Generate slug from text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Generate random string
 */
export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
```

**File: `packages/utils/src/index.ts`**

```typescript
export * from './date';
export * from './format';
export * from './string';
```

**Acceptance Criteria:**
- ✅ `@repo/utils` package created
- ✅ Date, format, and string utilities implemented
- ✅ All functions have JSDoc comments
- ✅ No lint errors
- ✅ No TypeScript errors

---

#### Story: **[STORY-008]** - Create @repo/validators Package

**Install Zod:**

```bash
pnpm add zod
```

**Setup package:**

```bash
mkdir -p packages/validators/src
```

**File: `packages/validators/package.json`**

```json
{
  "name": "@repo/validators",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/tsconfig": "workspace:*",
    "eslint": "^8.57.0",
    "typescript": "^5.3.0"
  }
}
```

**File: `packages/validators/tsconfig.json`**

```json
{
  "extends": "@repo/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**File: `packages/validators/src/common.ts`**

```typescript
import { z } from 'zod';

/**
 * Indonesian phone number validator
 */
export const phoneSchema = z
  .string()
  .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Invalid phone number format');

/**
 * Email validator
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * UUID validator
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Date string validator (ISO 8601)
 */
export const dateSchema = z.string().datetime('Invalid date format');

/**
 * Indonesian NIK (16 digits)
 */
export const nikSchema = z
  .string()
  .length(16, 'NIK must be 16 digits')
  .regex(/^[0-9]+$/, 'NIK must contain only numbers');

/**
 * Password validator (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least 1 uppercase, 1 lowercase, and 1 number'
  );
```

**File: `packages/validators/src/user.ts`**

```typescript
import { z } from 'zod';
import { emailSchema, phoneSchema, passwordSchema } from './common';

/**
 * User registration schema
 */
export const userRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: phoneSchema.optional(),
});

export type UserRegister = z.infer<typeof userRegisterSchema>;

/**
 * User login schema
 */
export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type UserLogin = z.infer<typeof userLoginSchema>;

/**
 * User update schema
 */
export const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: phoneSchema.optional(),
  avatar_url: z.string().url().optional(),
});

export type UserUpdate = z.infer<typeof userUpdateSchema>;
```

**File: `packages/validators/src/index.ts`**

```typescript
export * from './common';
export * from './user';
```

**Acceptance Criteria:**
- ✅ `@repo/validators` package created
- ✅ Zod schemas for common validations
- ✅ User-related schemas implemented
- ✅ Types exported from schemas
- ✅ No lint errors

---

#### Story: **[STORY-009]** - Create @repo/types Package

**Setup package:**

```bash
mkdir -p packages/types/src
```

**File: `packages/types/package.json`**

```json
{
  "name": "@repo/types",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/tsconfig": "workspace:*",
    "eslint": "^8.57.0",
    "typescript": "^5.3.0"
  }
}
```

**File: `packages/types/tsconfig.json`**

```json
{
  "extends": "@repo/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**File: `packages/types/src/user.ts`**

```typescript
/**
 * User role types
 */
export type UserRole =
  | 'super_admin'
  | 'school_admin'
  | 'admin'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'staff_finance'
  | 'staff_library';

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  email_verified: boolean;
  name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * User session
 */
export interface UserSession {
  user: User;
  expires_at: string;
}
```

**File: `packages/types/src/school.ts`**

```typescript
/**
 * Subscription tier types
 */
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';

/**
 * School entity
 */
export interface School {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo_url: string | null;
  settings: Record<string, unknown>;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * User-School relationship
 */
export interface UserSchool {
  user_id: string;
  school_id: string;
  is_primary: boolean;
  joined_at: string;
}
```

**File: `packages/types/src/api.ts`**

```typescript
/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

/**
 * API error
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}
```

**File: `packages/types/src/index.ts`**

```typescript
export * from './user';
export * from './school';
export * from './api';
```

**Acceptance Criteria:**
- ✅ `@repo/types` package created
- ✅ Common types defined (User, School, API)
- ✅ All interfaces documented
- ✅ No lint errors
- ✅ No TypeScript errors

---

### **0.3 Development Environment Setup**

#### Story: **[STORY-010]** - Create Setup Scripts

**File: `scripts/setup.sh`**

```bash
#!/bin/bash

set -e

echo "🚀 Setting up Ekosistem Sekolah development environment..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js version 20 or higher is required"
  echo "Current version: $(node -v)"
  exit 1
fi
echo "✅ Node.js version check passed"

# Check PNPM installation
if ! command -v pnpm &> /dev/null; then
  echo "❌ PNPM is not installed"
  echo "Install with: npm install -g pnpm"
  exit 1
fi
echo "✅ PNPM check passed"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Setup Husky
echo "🔧 Setting up Git hooks..."
pnpm exec husky install

# Create .env file if not exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "⚠️  Please update .env with your actual values"
fi

# Run type check
echo "🔍 Running type check..."
pnpm type-check

# Run lint
echo "🧹 Running linter..."
pnpm lint

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update .env file with your configuration"
echo "  2. Run 'pnpm dev' to start development"
echo ""
```

**File: `scripts/check-dependencies.sh`**

```bash
#!/bin/bash

echo "🔍 Checking dependencies..."

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed"
  exit 1
fi
echo "✅ Node.js: $(node -v)"

# Check for PNPM
if ! command -v pnpm &> /dev/null; then
  echo "❌ PNPM is not installed"
  exit 1
fi
echo "✅ PNPM: $(pnpm -v)"

# Check for Git
if ! command -v git &> /dev/null; then
  echo "❌ Git is not installed"
  exit 1
fi
echo "✅ Git: $(git --version)"

# Check workspace
if [ ! -f "pnpm-workspace.yaml" ]; then
  echo "❌ pnpm-workspace.yaml not found"
  exit 1
fi
echo "✅ PNPM workspace configured"

# Check turbo
if [ ! -f "turbo.json" ]; then
  echo "❌ turbo.json not found"
  exit 1
fi
echo "✅ Turborepo configured"

echo ""
echo "✅ All dependency checks passed!"
```

**Make scripts executable:**

```bash
chmod +x scripts/setup.sh
chmod +x scripts/check-dependencies.sh
```

---

#### Story: **[STORY-011]** - Create Documentation

**File: `docs/SETUP.md`**

```markdown
# Development Setup Guide

## Prerequisites

- Node.js 20.x or higher
- PNPM 8.x or higher
- Git

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ekosistem-sekolah
   ```

2. **Run setup script**
   ```bash
   ./scripts/setup.sh
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development**
   ```bash
   pnpm dev
   ```

## Manual Setup

If the setup script fails, follow these steps:

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Setup Git hooks**
   ```bash
   pnpm exec husky install
   ```

3. **Verify installation**
   ```bash
   pnpm type-check
   pnpm lint
   ```

## Available Commands

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps for production
- `pnpm lint` - Lint all packages
- `pnpm format` - Format all files with Prettier
- `pnpm type-check` - Run TypeScript type checking
- `pnpm clean` - Clean all build artifacts

## Troubleshooting

### PNPM installation fails

Clear PNPM cache:
```bash
pnpm store prune
pnpm install
```

### Husky hooks not working

Reinstall hooks:
```bash
rm -rf .husky
pnpm exec husky install
```

### TypeScript errors

Clear TypeScript cache:
```bash
find . -name "*.tsbuildinfo" -delete
pnpm type-check
```
```

**File: `docs/CONTRIBUTING.md`**

```markdown
# Contributing Guide

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow TypeScript best practices
   - Write meaningful commit messages
   - Add tests for new features

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```
   
   Commit messages should follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting)
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Standards

### TypeScript

- Use strict mode
- Avoid `any` types
- Export types alongside implementations
- Document complex functions with JSDoc

### React

- Use functional components
- Use TypeScript for prop types
- Follow hooks best practices
- Keep components small and focused

### Naming Conventions

- **Files**: kebab-case (e.g., `user-profile.tsx`)
- **Components**: PascalCase (e.g., `UserProfile`)
- **Functions**: camelCase (e.g., `getUserData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)

## Pre-commit Checks

Before committing, these checks will run automatically:

1. **Linting** - ESLint checks code quality
2. **Formatting** - Prettier formats code
3. **Type checking** - TypeScript validates types

Fix any errors before committing.

## Testing

(To be added in future phases)

## Questions?

Contact the development team or create an issue.
```

---

## ✅ Acceptance Criteria - Phase 0

### **Functional Requirements**

- [x] Monorepo structure created with Turborepo
- [x] PNPM workspace configured
- [x] TypeScript strict mode enabled
- [x] ESLint and Prettier configured
- [x] Git hooks with Husky working
- [x] All shared packages created:
  - [x] @repo/tsconfig
  - [x] @repo/eslint-config
  - [x] @repo/ui
  - [x] @repo/utils
  - [x] @repo/validators
  - [x] @repo/types
- [x] Setup scripts created and executable
- [x] Documentation written

### **Non-Functional Requirements**

- [x] Zero build errors
- [x] Zero TypeScript errors
- [x] Zero ESLint warnings
- [x] All files formatted with Prettier
- [x] Git hooks execute successfully
- [x] Setup script completes without errors

---

## 🧪 Testing Checklist

Run these commands to verify Phase 0 is complete:

```bash
# 1. Check dependencies
./scripts/check-dependencies.sh

# 2. Install all dependencies
pnpm install

# 3. Run type check (should pass with 0 errors)
pnpm type-check

# 4. Run linter (should pass with 0 errors)
pnpm lint

# 5. Run formatter check (should pass)
pnpm format:check

# 6. Verify turbo is working
pnpm turbo --version

# 7. Test Git hooks
git add .
git commit -m "test: verify git hooks"
# Should run lint-staged successfully

# 8. Verify all packages can be imported
# This will be tested when creating first app in Phase 1
```

---

## 🚨 Common Issues & Solutions

### Issue: `pnpm install` fails with EACCES

**Solution:**
```bash
sudo chown -R $(whoami) ~/.pnpm-store
pnpm install
```

### Issue: Husky hooks not executing

**Solution:**
```bash
chmod +x .husky/*
git config core.hooksPath .husky
```

### Issue: TypeScript can't find packages

**Solution:**
```bash
# Delete all node_modules
rm -rf node_modules packages/*/node_modules
# Reinstall
pnpm install
```

### Issue: ESLint errors in shared packages

**Solution:**
```bash
# Add .eslintrc.js to each package
# Extend from @repo/eslint-config
```

---

## 📊 Phase 0 Metrics

Track these metrics to ensure quality:

| Metric | Target | How to Check |
|--------|--------|--------------|
| TypeScript errors | 0 | `pnpm type-check` |
| ESLint warnings | 0 | `pnpm lint` |
| Build time | < 5s | `time pnpm build` |
| Install time | < 30s | `time pnpm install` |
| Test coverage | N/A | (No tests in Phase 0) |

---

## 🎓 Learning Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [PNPM Workspaces](https://pnpm.io/workspaces)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)

---

## 📝 Next Steps

After completing Phase 0:

1. ✅ Commit all changes
2. ✅ Push to repository
3. ✅ Create PR for review
4. ✅ Proceed to **Phase 1: Identity Provider**

---

**Phase Status**: 🟢 Ready for Implementation  
**Estimated Completion**: 2 weeks  
**Last Updated**: 2024
