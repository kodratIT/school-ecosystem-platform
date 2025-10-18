# STORY-009: Create @repo/types Package

**Epic**: Phase 0 - Foundation & Setup  
**Sprint**: Week 2  
**Story Points**: 2  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **create a shared types package for TypeScript definitions** so that **all applications use consistent, centralized type definitions without duplication**.

This package provides:
- Domain types (User, Student, School)
- API request/response types
- Database entity types
- Utility types
- Constants and enums
- Branded types for IDs

---

## 🎯 Goals

- Create @repo/types workspace package
- Define all domain entity types
- Create API types (requests, responses, errors)
- Define database types with Supabase
- Create utility types
- Export constants and enums
- Full type safety with branded types

---

## ✅ Acceptance Criteria

- [ ] `packages/types` directory created
- [ ] Domain types implemented:
  - User, Role, Permission
  - School, School Admin
  - Student, Parent, Guardian
  - Teacher, Staff
  - Class, Subject
  - Grade, Attendance
  - Invoice, Payment
- [ ] API types (Request, Response, Error)
- [ ] Database types matching schemas
- [ ] Utility types (Paginated, APIResponse)
- [ ] Branded types for IDs
- [ ] Constants exported
- [ ] Properly documented with TSDoc

---

## 📋 Tasks

### Task 1: Create Package Structure

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Create structure
mkdir -p packages/types/src/{entities,api,database,utils,constants}

ls -R packages/types/
```

**Expected structure:**
```
packages/types/
├── src/
│   ├── entities/       # Domain entities
│   ├── api/            # API types
│   ├── database/       # Database types
│   ├── utils/          # Utility types
│   ├── constants/      # Constants & enums
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

### Task 2: Create package.json

**File:** `packages/types/package.json`

```json
{
  "name": "@repo/types",
  "version": "0.1.0",
  "private": true,
  "description": "Shared TypeScript types for the school ecosystem",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./entities": {
      "types": "./dist/entities/index.d.ts",
      "import": "./dist/entities/index.mjs",
      "require": "./dist/entities/index.js"
    },
    "./api": {
      "types": "./dist/api/index.d.ts",
      "import": "./dist/api/index.mjs",
      "require": "./dist/api/index.js"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@repo/eslint-config": "workspace:*",
    "tsup": "^8.0.1",
    "typescript": "^5.3.3"
  }
}
```

---

### Task 3: Create TypeScript Config

**File:** `packages/types/tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "strict": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### Task 4: Create Branded Types

**File:** `packages/types/src/utils/branded.ts`

```typescript
/**
 * Branded type for type-safe IDs
 * Prevents mixing different ID types
 */
declare const __brand: unique symbol;
type Brand<T, TBrand> = T & { [__brand]: TBrand };

// ID types
export type UserId = Brand<string, 'UserId'>;
export type SchoolId = Brand<string, 'SchoolId'>;
export type StudentId = Brand<string, 'StudentId'>;
export type TeacherId = Brand<string, 'TeacherId'>;
export type ParentId = Brand<string, 'ParentId'>;
export type ClassId = Brand<string, 'ClassId'>;
export type SubjectId = Brand<string, 'SubjectId'>;
export type GradeId = Brand<string, 'GradeId'>;
export type InvoiceId = Brand<string, 'InvoiceId'>;
export type PaymentId = Brand<string, 'PaymentId'>;

/**
 * Helper to create branded ID
 * @example const userId = brandId<UserId>('123');
 */
export function brandId<T extends string>(id: string): T {
  return id as T;
}
```

---

### Task 5: Create Utility Types

**File:** `packages/types/src/utils/index.ts`

```typescript
export * from './branded';

/**
 * Make specific keys required
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific keys optional
 */
export type PartialKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Paginated response
 */
export interface Paginated<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API response wrapper
 */
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: Record<string, unknown>;
}

/**
 * API error
 */
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  field?: string;
}

/**
 * Timestamps
 */
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Soft delete
 */
export interface SoftDelete {
  deletedAt: Date | null;
}

/**
 * Entity with ID and timestamps
 */
export interface BaseEntity extends Timestamps {
  id: string;
}

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Optional type
 */
export type Optional<T> = T | undefined;

/**
 * DeepPartial - make all nested properties optional
 */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/**
 * Prettify - flatten intersections for better IDE hints
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
```

---

### Task 6: Create Constants

**File:** `packages/types/src/constants/index.ts`

```typescript
/**
 * User roles
 */
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  SCHOOL_ADMIN: 'school_admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
  FINANCE_STAFF: 'finance_staff',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Education levels
 */
export const EDUCATION_LEVELS = {
  TK: 'tk',
  SD: 'sd',
  SMP: 'smp',
  SMA: 'sma',
  SMK: 'smk',
} as const;

export type EducationLevel = (typeof EDUCATION_LEVELS)[keyof typeof EDUCATION_LEVELS];

/**
 * Gender
 */
export const GENDER = {
  MALE: 'L',
  FEMALE: 'P',
} as const;

export type Gender = (typeof GENDER)[keyof typeof GENDER];

/**
 * Attendance status
 */
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  SICK: 'sick',
  PERMISSION: 'permission',
  ABSENT: 'absent',
} as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

/**
 * Payment status
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

/**
 * Payment methods
 */
export const PAYMENT_METHODS = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  VIRTUAL_ACCOUNT: 'virtual_account',
  CREDIT_CARD: 'credit_card',
  E_WALLET: 'e_wallet',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

/**
 * Fee types
 */
export const FEE_TYPES = {
  REGISTRATION: 'registration',
  TUITION: 'tuition',
  BOOK: 'book',
  UNIFORM: 'uniform',
  ACTIVITY: 'activity',
  EXAM: 'exam',
  OTHER: 'other',
} as const;

export type FeeType = (typeof FEE_TYPES)[keyof typeof FEE_TYPES];

/**
 * PPDB status
 */
export const PPDB_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  VERIFIED: 'verified',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const;

export type PPDBStatus = (typeof PPDB_STATUS)[keyof typeof PPDB_STATUS];
```

---

### Task 7: Create Entity Types - User

**File:** `packages/types/src/entities/user.ts`

```typescript
import type { UserId, SchoolId } from '../utils/branded';
import type { BaseEntity } from '../utils';
import type { UserRole } from '../constants';

/**
 * User entity
 */
export interface User extends BaseEntity {
  id: UserId;
  schoolId: SchoolId | null;
  
  email: string;
  emailVerified: boolean;
  
  name: string;
  avatar: string | null;
  phone: string | null;
  
  role: UserRole;
  
  isActive: boolean;
  lastLoginAt: Date | null;
}

/**
 * User profile (public view)
 */
export interface UserProfile {
  id: UserId;
  name: string;
  email: string;
  avatar: string | null;
  role: UserRole;
}

/**
 * User session
 */
export interface UserSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

/**
 * User permissions
 */
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string | null;
}

/**
 * Role with permissions
 */
export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
}
```

---

### Task 8: Create Entity Types - School

**File:** `packages/types/src/entities/school.ts`

```typescript
import type { SchoolId, UserId } from '../utils/branded';
import type { BaseEntity } from '../utils';
import type { EducationLevel } from '../constants';

/**
 * School entity
 */
export interface School extends BaseEntity {
  id: SchoolId;
  
  name: string;
  slug: string;
  logo: string | null;
  
  npsn: string; // Nomor Pokok Sekolah Nasional
  educationLevel: EducationLevel;
  
  email: string;
  phone: string;
  website: string | null;
  
  address: string;
  city: string;
  province: string;
  postalCode: string;
  
  principalName: string;
  principalPhone: string;
  
  isActive: boolean;
  subscriptionTier: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionEndsAt: Date | null;
}

/**
 * School settings
 */
export interface SchoolSettings {
  schoolId: SchoolId;
  
  // Academic
  academicYearStart: number; // Month (0-11)
  academicYearEnd: number;
  semesterStartMonth: number;
  
  // Attendance
  attendanceGracePeriod: number; // Minutes
  
  // Finance
  lateFeePercentage: number;
  lateFeeDays: number;
  
  // PPDB
  ppdbEnabled: boolean;
  ppdbOpenDate: Date | null;
  ppdbCloseDate: Date | null;
  
  // Customization
  primaryColor: string;
  secondaryColor: string;
  
  updatedAt: Date;
  updatedBy: UserId;
}
```

---

### Task 9: Create Entity Types - Student

**File:** `packages/types/src/entities/student.ts`

```typescript
import type { StudentId, UserId, SchoolId, ClassId } from '../utils/branded';
import type { BaseEntity } from '../utils';
import type { Gender } from '../constants';

/**
 * Student entity
 */
export interface Student extends BaseEntity {
  id: StudentId;
  schoolId: SchoolId;
  userId: UserId;
  
  // Personal
  fullName: string;
  nickname: string | null;
  nisn: string | null;
  nik: string;
  birthPlace: string;
  birthDate: Date;
  gender: Gender;
  
  // Contact
  email: string | null;
  phone: string | null;
  
  // Address
  address: string;
  rt: string | null;
  rw: string | null;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string | null;
  
  // Family
  childOrder: number;
  siblingsCount: number;
  
  // Academic
  currentClassId: ClassId | null;
  enrollmentDate: Date;
  graduationDate: Date | null;
  
  // Status
  status: 'active' | 'alumni' | 'dropout' | 'transferred';
  
  // Photos
  photo: string | null;
}

/**
 * Parent/Guardian entity
 */
export interface Parent extends BaseEntity {
  id: string;
  schoolId: SchoolId;
  userId: UserId;
  studentId: StudentId;
  
  relationship: 'father' | 'mother' | 'guardian';
  
  name: string;
  nik: string;
  birthYear: number;
  education: string;
  occupation: string;
  monthlyIncome: string;
  
  phone: string;
  email: string | null;
  
  isPrimaryContact: boolean;
}
```

---

### Task 10: Create Entity Types - Academic

**File:** `packages/types/src/entities/academic.ts`

```typescript
import type { ClassId, SubjectId, StudentId, TeacherId, GradeId } from '../utils/branded';
import type { BaseEntity } from '../utils';
import type { AttendanceStatus } from '../constants';

/**
 * Class entity
 */
export interface Class extends BaseEntity {
  id: ClassId;
  
  name: string;
  grade: number;
  academicYear: string;
  
  teacherId: TeacherId;
  capacity: number;
  currentStudents: number;
  
  isActive: boolean;
}

/**
 * Subject entity
 */
export interface Subject extends BaseEntity {
  id: SubjectId;
  
  name: string;
  code: string;
  grade: number;
  category: 'compulsory' | 'specialization' | 'local' | 'extracurricular';
  credits: number;
  
  description: string | null;
}

/**
 * Grade/Score entity
 */
export interface Grade extends BaseEntity {
  id: GradeId;
  
  studentId: StudentId;
  subjectId: SubjectId;
  academicYear: string;
  semester: '1' | '2';
  
  score: number;
  description: string | null;
  
  gradedBy: TeacherId;
  gradedAt: Date;
}

/**
 * Attendance entity
 */
export interface Attendance extends BaseEntity {
  studentId: StudentId;
  classId: ClassId;
  
  date: Date;
  status: AttendanceStatus;
  
  note: string | null;
  attachmentUrl: string | null;
  
  markedBy: TeacherId;
}

/**
 * Report card
 */
export interface ReportCard {
  studentId: StudentId;
  academicYear: string;
  semester: '1' | '2';
  
  grades: Grade[];
  
  attendance: {
    present: number;
    sick: number;
    permission: number;
    absent: number;
  };
  
  teacherNote: string | null;
  principalNote: string | null;
  
  generatedAt: Date;
}
```

---

### Task 11: Create Entity Types - Financial

**File:** `packages/types/src/entities/financial.ts`

```typescript
import type { InvoiceId, PaymentId, StudentId } from '../utils/branded';
import type { BaseEntity } from '../utils';
import type { PaymentStatus, PaymentMethod, FeeType } from '../constants';

/**
 * Invoice entity
 */
export interface Invoice extends BaseEntity {
  id: InvoiceId;
  
  studentId: StudentId;
  invoiceNumber: string;
  academicYear: string;
  
  items: InvoiceItem[];
  
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  
  dueDate: Date;
  paidAt: Date | null;
  
  status: PaymentStatus;
  notes: string | null;
}

/**
 * Invoice item
 */
export interface InvoiceItem {
  feeType: FeeType;
  description: string;
  amount: number;
  quantity: number;
}

/**
 * Payment entity
 */
export interface Payment extends BaseEntity {
  id: PaymentId;
  
  invoiceId: InvoiceId;
  amount: number;
  method: PaymentMethod;
  
  // Bank transfer details
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  
  // Virtual account
  vaNumber: string | null;
  
  // Proof & gateway
  proofUrl: string | null;
  transactionId: string | null;
  gatewayResponse: Record<string, unknown> | null;
  
  paidAt: Date | null;
  status: PaymentStatus;
  
  notes: string | null;
}

/**
 * Scholarship entity
 */
export interface Scholarship extends BaseEntity {
  name: string;
  description: string;
  
  type: 'full' | 'partial';
  amount: number | null;
  percentage: number | null;
  
  validFrom: Date;
  validUntil: Date;
  
  quota: number | null;
  awarded: number;
  
  isActive: boolean;
}
```

---

### Task 12: Create API Types

**File:** `packages/types/src/api/index.ts`

```typescript
import type { APIResponse, Paginated, APIError } from '../utils';

/**
 * API request with pagination
 */
export interface PaginatedRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/**
 * Success response
 */
export type SuccessResponse<T> = APIResponse<T> & {
  success: true;
  data: T;
};

/**
 * Error response
 */
export type ErrorResponse = APIResponse & {
  success: false;
  error: APIError;
};

/**
 * HTTP method types
 */
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API endpoint definition
 */
export interface APIEndpoint<TRequest = unknown, TResponse = unknown> {
  method: HTTPMethod;
  path: string;
  request?: TRequest;
  response: TResponse;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: ValidationError[];
}

// Re-export utility types
export type { APIResponse, Paginated, APIError };
```

---

### Task 13: Create Main Index

**File:** `packages/types/src/index.ts`

```typescript
// Entities
export * from './entities/user';
export * from './entities/school';
export * from './entities/student';
export * from './entities/academic';
export * from './entities/financial';

// API types
export * from './api';

// Utils
export * from './utils';

// Constants
export * from './constants';
```

---

### Task 14: Create README

**File:** `packages/types/README.md`

```markdown
# @repo/types

Shared TypeScript types for the school ecosystem.

## Installation

Import in your app:

\`\`\`typescript
import type { User, Student, APIResponse } from '@repo/types';
\`\`\`

## Features

- 🏷️ Branded types for type-safe IDs
- 📦 Domain entity types
- 🔌 API request/response types
- 🛠️ Utility types
- 📊 Constants and enums
- 📝 Full TSDoc documentation

## Types

### Entities

- `User` - User account
- `School` - School entity
- `Student` - Student data
- `Parent` - Parent/guardian
- `Teacher` - Teacher data
- `Class` - Class/room
- `Subject` - Subject/course
- `Grade` - Score/grade
- `Attendance` - Attendance record
- `Invoice` - Invoice
- `Payment` - Payment record

### Branded IDs

Prevents mixing different ID types:

\`\`\`typescript
import type { UserId, StudentId } from '@repo/types';

const userId: UserId = brandId<UserId>('user-123');
const studentId: StudentId = brandId<StudentId>('student-456');

// TypeScript error: Type 'StudentId' is not assignable to 'UserId'
const wrong: UserId = studentId; // ❌ Error!
\`\`\`

### API Types

\`\`\`typescript
import type { APIResponse, Paginated, SuccessResponse } from '@repo/types';

const response: SuccessResponse<User> = {
  success: true,
  data: {
    id: 'user-123',
    name: 'John Doe',
    // ...
  },
};

const list: Paginated<Student> = {
  data: [...],
  pagination: {
    page: 1,
    pageSize: 10,
    total: 100,
    totalPages: 10,
  },
};
\`\`\`

### Utility Types

\`\`\`typescript
import type { RequireKeys, PartialKeys, DeepPartial } from '@repo/types';

// Make specific keys required
type UserWithEmail = RequireKeys<User, 'email'>;

// Make specific keys optional
type PartialUser = PartialKeys<User, 'phone' | 'avatar'>;

// Deep partial
type DeepPartialUser = DeepPartial<User>;
\`\`\`

### Constants

\`\`\`typescript
import { USER_ROLES, PAYMENT_STATUS } from '@repo/types';

console.log(USER_ROLES.TEACHER); // 'teacher'
console.log(PAYMENT_STATUS.SUCCESS); // 'success'
\`\`\`

## Examples

### Component Props

\`\`\`typescript
import type { User, Student } from '@repo/types';

interface UserCardProps {
  user: User;
  onEdit?: () => void;
}

function UserCard({ user }: UserCardProps) {
  return <div>{user.name}</div>;
}
\`\`\`

### API Handler

\`\`\`typescript
import type { APIResponse, Student } from '@repo/types';

export async function GET(): Promise<APIResponse<Student[]>> {
  const students = await getStudents();
  
  return {
    success: true,
    data: students,
  };
}
\`\`\`

## Development

\`\`\`bash
# Type check
pnpm typecheck

# Build
pnpm build
\`\`\`
```

---

## 🧪 Testing Instructions

### Test 1: Build Package

```bash
cd packages/types
pnpm install
pnpm build
```

**Expected:** Build successful

---

### Test 2: Type Check

```bash
pnpm typecheck
```

**Expected:** No type errors

---

### Test 3: Import in Another Package

```typescript
import type { User, Student, APIResponse } from '@repo/types';
import { USER_ROLES, brandId } from '@repo/types';
import type { UserId } from '@repo/types';

// Should work
const userId = brandId<UserId>('123');
console.log(USER_ROLES.TEACHER);
```

---

### Test 4: Test Branded Types

```typescript
import type { UserId, StudentId } from '@repo/types';

const userId: UserId = '123' as UserId;
const studentId: StudentId = '456' as StudentId;

// This should cause TypeScript error
const wrong: UserId = studentId; // ❌ Type error
```

---

## 📸 Expected Results

```
packages/types/
├── dist/                     ✅ Built files
├── src/
│   ├── entities/
│   │   ├── user.ts          ✅ User types
│   │   ├── school.ts        ✅ School types
│   │   ├── student.ts       ✅ Student types
│   │   ├── academic.ts      ✅ Academic types
│   │   └── financial.ts     ✅ Financial types
│   ├── api/index.ts         ✅ API types
│   ├── utils/               ✅ Utility types
│   ├── constants/index.ts   ✅ Constants
│   └── index.ts             ✅ Main export
└── README.md                ✅ Documentation
```

---

## ❌ Common Errors & Solutions

### Error: "Cannot assign branded type"

**This is correct!** Branded types prevent mixing IDs.

**Solution:** Use `brandId()` helper:
```typescript
const userId = brandId<UserId>('123');
```

---

### Error: "Type is not assignable"

**Cause:** Strict type checking

**Solution:** Make sure types match exactly, use type assertions only when safe

---

## 🔍 Code Review Checklist

- [ ] All entities have BaseEntity (id, timestamps)
- [ ] Branded types used for IDs
- [ ] Constants use `as const`
- [ ] API types have proper generics
- [ ] TSDoc comments for all types
- [ ] No `any` types
- [ ] Utility types are properly exported

---

## 🔗 Dependencies

- **Depends on**: 
  - STORY-001 (Monorepo)
  - STORY-002 (TypeScript config)
- **Blocks**: All Phase 1 stories

---

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Branded Types](https://egghead.io/blog/using-branded-types-in-typescript)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

---

## 💡 Tips

1. **Branded types** - Prevent mixing different IDs
2. **as const** - Make constants truly constant
3. **Utility types** - Compose types, don't duplicate
4. **TSDoc** - Document complex types
5. **No any** - Use unknown for truly unknown types
6. **Generic types** - Make reusable type definitions

---

## 📝 Notes for Next Story

After this story:
- ✅ Centralized type definitions
- ✅ Type-safe IDs
- ✅ Consistent API types
- ✅ Reusable utility types

Next (STORY-010) creates setup scripts for automation.

---

## ✏️ Definition of Done

- [ ] All acceptance criteria met
- [ ] Package builds successfully
- [ ] Type checking passes
- [ ] All entity types defined
- [ ] API types complete
- [ ] Constants exported
- [ ] Branded types working
- [ ] Can be imported from other packages
- [ ] Documentation complete
- [ ] Code reviewed and approved

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
