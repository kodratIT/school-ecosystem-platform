# STORY-007: Create @repo/utils Package

**Epic**: Phase 0 - Foundation & Setup  
**Sprint**: Week 2  
**Story Points**: 3  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **create a shared utils package with reusable utility functions** so that **common functionality can be used consistently across all applications without duplication**.

This utils package will contain:
- String manipulation helpers
- Date/time formatting functions
- Number formatting (currency, percentage)
- Array and object utilities
- Validation helpers
- Error handling utilities
- API response formatters

---

## 🎯 Goals

- Create @repo/utils workspace package
- Implement common utility functions
- Add comprehensive unit tests (>90% coverage)
- Setup TypeScript with strict mode
- Export all utilities with proper types
- Document all functions with JSDoc

---

## ✅ Acceptance Criteria

- [ ] `packages/utils` directory created
- [ ] package.json configured as workspace package
- [ ] TypeScript configured with strict mode
- [ ] Utility functions implemented:
  - String utilities (slugify, truncate, capitalize)
  - Date utilities (format, parse, relative time)
  - Number utilities (formatCurrency, formatPercentage)
  - Array utilities (unique, groupBy, chunk)
  - Object utilities (pick, omit, merge)
  - Validation utilities (isEmail, isPhone, isURL)
- [ ] Unit tests for all functions (Jest)
- [ ] Test coverage >90%
- [ ] Properly exported from index.ts
- [ ] Documentation with examples

---

## 📋 Tasks

### Task 1: Create Package Structure

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Create directory structure
mkdir -p packages/utils/src/{string,date,number,array,object,validation}
mkdir -p packages/utils/__tests__

# Verify structure
ls -R packages/utils/
```

**Expected structure:**
```
packages/utils/
├── src/
│   ├── string/
│   ├── date/
│   ├── number/
│   ├── array/
│   ├── object/
│   ├── validation/
│   └── index.ts
├── __tests__/
├── package.json
├── tsconfig.json
└── README.md
```

---

### Task 2: Create package.json

**File:** `packages/utils/package.json`

```json
{
  "name": "@repo/utils",
  "version": "0.1.0",
  "private": true,
  "description": "Shared utility functions for the school ecosystem",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./string": {
      "types": "./dist/string/index.d.ts",
      "import": "./dist/string/index.mjs",
      "require": "./dist/string/index.js"
    },
    "./date": {
      "types": "./dist/date/index.d.ts",
      "import": "./dist/date/index.mjs",
      "require": "./dist/date/index.js"
    },
    "./number": {
      "types": "./dist/number/index.d.ts",
      "import": "./dist/number/index.mjs",
      "require": "./dist/number/index.js"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@repo/eslint-config": "workspace:*",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "tsup": "^8.0.1",
    "typescript": "^5.3.3"
  }
}
```

---

### Task 3: Create TypeScript Config

**File:** `packages/utils/tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "__tests__"]
}
```

---

### Task 4: Implement String Utilities

**File:** `packages/utils/src/string/index.ts`

```typescript
/**
 * Convert a string to slug format (lowercase with dashes)
 * @example slugify("Hello World!") // "hello-world"
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
 * Truncate text to specified length with ellipsis
 * @example truncate("Hello World", 5) // "Hello..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Capitalize first letter of each word
 * @example capitalize("hello world") // "Hello World"
 */
export function capitalize(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Capitalize only first letter of string
 * @example capitalizeFirst("hello world") // "Hello world"
 */
export function capitalizeFirst(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Generate random string with specified length
 * @example randomString(10) // "a3B5Cx8Yz1"
 */
export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Extract initials from name
 * @example getInitials("John Doe") // "JD"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}
```

---

### Task 5: Implement Date Utilities

**File:** `packages/utils/src/date/index.ts`

```typescript
import { format as dateFnsFormat, formatDistance, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format date to Indonesian format
 * @example formatDate(new Date(), 'dd MMM yyyy') // "25 Des 2024"
 */
export function formatDate(date: Date | string, formatStr: string = 'dd MMMM yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsFormat(dateObj, formatStr, { locale: id });
}

/**
 * Format date to time string
 * @example formatTime(new Date()) // "14:30"
 */
export function formatTime(date: Date | string): string {
  return formatDate(date, 'HH:mm');
}

/**
 * Format date to datetime string
 * @example formatDateTime(new Date()) // "25 Des 2024, 14:30"
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'dd MMM yyyy, HH:mm');
}

/**
 * Get relative time from now
 * @example timeAgo(new Date(Date.now() - 3600000)) // "1 jam yang lalu"
 */
export function timeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true, locale: id });
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
}

/**
 * Get academic year from date (July - June)
 * @example getAcademicYear(new Date('2024-08-15')) // "2024/2025"
 */
export function getAcademicYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  // Academic year starts in July (month 6)
  if (month >= 6) {
    return `${year}/${year + 1}`;
  }
  return `${year - 1}/${year}`;
}
```

---

### Task 6: Implement Number Utilities

**File:** `packages/utils/src/number/index.ts`

```typescript
/**
 * Format number as Indonesian Rupiah currency
 * @example formatCurrency(1000000) // "Rp 1.000.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number as percentage
 * @example formatPercentage(0.75) // "75%"
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format number with thousand separators
 * @example formatNumber(1000000) // "1.000.000"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Clamp number between min and max
 * @example clamp(15, 0, 10) // 10
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round number to specified decimal places
 * @example roundTo(3.14159, 2) // 3.14
 */
export function roundTo(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * Generate random number between min and max
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
```

---

### Task 7: Implement Array Utilities

**File:** `packages/utils/src/array/index.ts`

```typescript
/**
 * Remove duplicate values from array
 * @example unique([1, 2, 2, 3]) // [1, 2, 3]
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Group array items by key
 * @example groupBy([{id: 1, type: 'a'}, {id: 2, type: 'a'}], 'type')
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    (result[groupKey] = result[groupKey] || []).push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Split array into chunks
 * @example chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Shuffle array randomly
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get random item from array
 */
export function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Sort array of objects by key
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
}
```

---

### Task 8: Implement Object Utilities

**File:** `packages/utils/src/object/index.ts`

```typescript
/**
 * Pick specific keys from object
 * @example pick({a: 1, b: 2, c: 3}, ['a', 'c']) // {a: 1, c: 3}
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Omit specific keys from object
 * @example omit({a: 1, b: 2, c: 3}, ['b']) // {a: 1, c: 3}
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result as Omit<T, K>;
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key] as object, source[key] as object);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * Check if value is plain object
 */
export function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (obj instanceof Object) {
    const copy = {} as T;
    Object.keys(obj).forEach(key => {
      copy[key as keyof T] = deepClone((obj as Record<string, unknown>)[key]) as T[keyof T];
    });
    return copy;
  }
  return obj;
}
```

---

### Task 9: Implement Validation Utilities

**File:** `packages/utils/src/validation/index.ts`

```typescript
/**
 * Validate email address
 * @example isEmail("test@example.com") // true
 */
export function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Indonesian phone number
 * @example isPhone("08123456789") // true
 */
export function isPhone(phone: string): boolean {
  // Supports: 08xx, +628xx, 628xx
  const phoneRegex = /^(\+62|62|0)[2-9][0-9]{7,11}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Validate URL
 */
export function isURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate Indonesian NIK (16 digits)
 */
export function isNIK(nik: string): boolean {
  return /^\d{16}$/.test(nik);
}

/**
 * Validate NISN (10 digits)
 */
export function isNISN(nisn: string): boolean {
  return /^\d{10}$/.test(nisn);
}

/**
 * Check if string is empty or whitespace
 */
export function isEmpty(str: string): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Validate password strength
 * @returns true if password has min 8 chars, 1 uppercase, 1 lowercase, 1 number
 */
export function isStrongPassword(password: string): boolean {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return minLength && hasUpperCase && hasLowerCase && hasNumber;
}
```

---

### Task 10: Create Main Index

**File:** `packages/utils/src/index.ts`

```typescript
// String utilities
export * from './string';

// Date utilities
export * from './date';

// Number utilities
export * from './number';

// Array utilities
export * from './array';

// Object utilities
export * from './object';

// Validation utilities
export * from './validation';
```

---

### Task 11: Create Tests

**File:** `packages/utils/__tests__/string.test.ts`

```typescript
import { slugify, truncate, capitalize, getInitials } from '../src/string';

describe('String Utilities', () => {
  describe('slugify', () => {
    it('should convert text to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Hello  World!')).toBe('hello-world');
      expect(slugify('  Trim Me  ')).toBe('trim-me');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
      expect(truncate('Hi', 10)).toBe('Hi');
    });
  });

  describe('capitalize', () => {
    it('should capitalize each word', () => {
      expect(capitalize('hello world')).toBe('Hello World');
      expect(capitalize('HELLO WORLD')).toBe('Hello World');
    });
  });

  describe('getInitials', () => {
    it('should extract initials', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('John Middle Doe')).toBe('JM');
    });
  });
});
```

**File:** `packages/utils/__tests__/validation.test.ts`

```typescript
import { isEmail, isPhone, isNIK, isStrongPassword } from '../src/validation';

describe('Validation Utilities', () => {
  describe('isEmail', () => {
    it('should validate email', () => {
      expect(isEmail('test@example.com')).toBe(true);
      expect(isEmail('invalid')).toBe(false);
      expect(isEmail('test@')).toBe(false);
    });
  });

  describe('isPhone', () => {
    it('should validate Indonesian phone', () => {
      expect(isPhone('081234567890')).toBe(true);
      expect(isPhone('+6281234567890')).toBe(true);
      expect(isPhone('021234567')).toBe(true);
      expect(isPhone('12345')).toBe(false);
    });
  });

  describe('isNIK', () => {
    it('should validate NIK', () => {
      expect(isNIK('1234567890123456')).toBe(true);
      expect(isNIK('123456')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('should validate password strength', () => {
      expect(isStrongPassword('Passw0rd')).toBe(true);
      expect(isStrongPassword('weak')).toBe(false);
      expect(isStrongPassword('NoNumber')).toBe(false);
    });
  });
});
```

**File:** `packages/utils/jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/index.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

---

### Task 12: Create README

**File:** `packages/utils/README.md`

```markdown
# @repo/utils

Shared utility functions for the school ecosystem.

## Installation

This is an internal workspace package. Import from your app:

\`\`\`typescript
import { slugify, formatCurrency } from '@repo/utils';
\`\`\`

## Utilities

### String

- `slugify(text)` - Convert to URL-friendly slug
- `truncate(text, length)` - Truncate with ellipsis
- `capitalize(text)` - Capitalize words
- `getInitials(name)` - Extract initials

### Date

- `formatDate(date, format)` - Format date in Indonesian
- `formatTime(date)` - Format time
- `timeAgo(date)` - Relative time
- `getAcademicYear(date)` - Get academic year

### Number

- `formatCurrency(amount)` - Format as Rupiah
- `formatPercentage(value)` - Format as percentage
- `formatNumber(num)` - Format with thousand separators

### Array

- `unique(array)` - Remove duplicates
- `groupBy(array, key)` - Group by key
- `chunk(array, size)` - Split into chunks

### Object

- `pick(obj, keys)` - Pick specific keys
- `omit(obj, keys)` - Omit specific keys
- `deepMerge(target, source)` - Deep merge objects

### Validation

- `isEmail(email)` - Validate email
- `isPhone(phone)` - Validate Indonesian phone
- `isNIK(nik)` - Validate NIK
- `isStrongPassword(password)` - Check password strength

## Examples

\`\`\`typescript
import { formatCurrency, slugify, isEmail } from '@repo/utils';

// Currency
formatCurrency(1000000); // "Rp 1.000.000"

// String
slugify("Hello World!"); // "hello-world"

// Validation
isEmail("test@example.com"); // true
\`\`\`

## Development

\`\`\`bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# Build
pnpm build
\`\`\`
```

---

## 🧪 Testing Instructions

### Test 1: Build Package

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"
cd packages/utils

# Install dependencies
pnpm install

# Build
pnpm build

# Check dist folder
ls -la dist/
```

**Expected:** Build succeeds, dist/ folder created with .js, .mjs, .d.ts files

---

### Test 2: Run Unit Tests

```bash
# Run all tests
pnpm test

# Expected: All tests pass
```

**Expected output:**
```
PASS __tests__/string.test.ts
PASS __tests__/validation.test.ts

Test Suites: 2 passed, 2 total
Tests:       15 passed, 15 total
```

---

### Test 3: Check Coverage

```bash
# Run with coverage
pnpm test:coverage
```

**Expected:** Coverage >90% for all metrics

---

### Test 4: Type Checking

```bash
# Check types
pnpm typecheck
```

**Expected:** No type errors

---

### Test 5: Test in Another Package

Create test file in another package:

```typescript
// Test in apps or packages
import { formatCurrency, slugify } from '@repo/utils';

console.log(formatCurrency(1000000)); // Should work
console.log(slugify("Test String")); // Should work
```

---

## 📸 Expected Results

```
packages/utils/
├── dist/                   ✅ Built files
│   ├── index.js
│   ├── index.mjs
│   ├── index.d.ts
│   ├── string/
│   ├── date/
│   └── ...
├── src/
│   ├── string/index.ts    ✅ String utilities
│   ├── date/index.ts      ✅ Date utilities
│   ├── number/index.ts    ✅ Number utilities
│   ├── array/index.ts     ✅ Array utilities
│   ├── object/index.ts    ✅ Object utilities
│   ├── validation/index.ts ✅ Validation utilities
│   └── index.ts           ✅ Main export
├── __tests__/             ✅ Unit tests
│   ├── string.test.ts
│   └── validation.test.ts
├── package.json           ✅ Package config
├── tsconfig.json          ✅ TypeScript config
├── jest.config.js         ✅ Jest config
└── README.md              ✅ Documentation
```

**Test output:**
```bash
$ pnpm test
✓ String utilities (4 tests)
✓ Validation utilities (4 tests)

Coverage: 95% statements, 92% branches, 94% functions, 95% lines
```

---

## ❌ Common Errors & Solutions

### Error: "Cannot find module '@repo/typescript-config'"

**Cause:** Dependencies not built

**Solution:**
```bash
# Build all packages first
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"
pnpm build --filter=@repo/typescript-config
pnpm build --filter=@repo/utils
```

---

### Error: "Module not found: Can't resolve 'date-fns'"

**Cause:** Missing dependencies

**Solution:**
```bash
cd packages/utils
pnpm install
```

---

### Error: "Tests fail with import errors"

**Cause:** TypeScript not configured for Jest

**Solution:** Check jest.config.js has `preset: 'ts-jest'`

---

### Error: "Type errors in tests"

**Cause:** Missing @types/jest

**Solution:**
```bash
pnpm add -D @types/jest
```

---

### Error: "Build fails with tsup error"

**Cause:** Invalid tsconfig or missing files

**Solution:**
```bash
# Check tsconfig is valid
pnpm typecheck

# Check all files exist
ls -la src/
```

---

## 🔍 Code Review Checklist

- [ ] All utility functions have JSDoc comments
- [ ] All functions have unit tests
- [ ] Test coverage >90%
- [ ] TypeScript strict mode enabled
- [ ] No any types used
- [ ] Proper exports in index.ts
- [ ] README has examples
- [ ] Package builds successfully
- [ ] Functions handle edge cases (null, undefined, empty)

---

## 🔗 Dependencies

- **Depends on**: 
  - STORY-001 (Monorepo initialized)
  - STORY-002 (TypeScript config)
  - STORY-003 (ESLint config)
- **Blocks**: 
  - STORY-008 (validators package uses utils)
  - All Phase 1 stories (will use utils)

---

## 📚 Resources

- [date-fns Documentation](https://date-fns.org/)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Jest Documentation](https://jestjs.io/)
- [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)

---

## 💡 Tips

1. **Pure functions** - No side effects, predictable output
2. **Edge cases** - Test null, undefined, empty strings
3. **Type safety** - Use proper generics for reusable functions
4. **Performance** - Avoid unnecessary loops or cloning
5. **Documentation** - JSDoc helps IntelliSense
6. **Tree shaking** - Export individual functions
7. **Immutability** - Don't mutate input parameters

---

## 📝 Notes for Next Story

After this story, you have:
- ✅ Reusable utility functions
- ✅ Type-safe helpers
- ✅ Well-tested code
- ✅ Consistent formatting across apps

Next (STORY-008) will create @repo/validators for form validation.

---

## ✏️ Definition of Done

- [ ] All acceptance criteria met
- [ ] Package structure created
- [ ] All utility functions implemented
- [ ] Unit tests written (>90% coverage)
- [ ] Tests passing
- [ ] Type checking passing
- [ ] Package builds successfully
- [ ] README documentation complete
- [ ] Can be imported from other packages
- [ ] Code reviewed and approved

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
