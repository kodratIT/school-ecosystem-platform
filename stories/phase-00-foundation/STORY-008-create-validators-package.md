# STORY-008: Create @repo/validators Package

**Epic**: Phase 0 - Foundation & Setup  
**Sprint**: Week 2  
**Story Points**: 3  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **create a shared validators package using Zod** so that **form validation is consistent, type-safe, and reusable across all applications**.

This package will provide:
- Common validation schemas (email, phone, NIK, NISN)
- User authentication schemas (login, register)
- Student registration schemas (PPDB)
- Academic data schemas (grades, attendance)
- Financial schemas (payments, invoices)
- Custom validators for Indonesian formats

---

## 🎯 Goals

- Create @repo/validators workspace package
- Implement Zod validation schemas
- Create reusable validation functions
- Add Indonesian-specific validators
- Full TypeScript type inference
- Export schemas with inferred types
- Comprehensive test coverage

---

## ✅ Acceptance Criteria

- [ ] `packages/validators` directory created
- [ ] Zod installed and configured
- [ ] Common validation schemas implemented:
  - Auth (login, register, password)
  - User (profile, settings)
  - Student (registration, biodata)
  - Academic (grades, attendance)
  - Financial (payment, invoice)
  - Indonesian (NIK, NISN, phone)
- [ ] Custom error messages in Indonesian
- [ ] Type inference working
- [ ] Unit tests for all schemas
- [ ] Properly exported from index.ts
- [ ] Documentation with examples

---

## 📋 Tasks

### Task 1: Create Package Structure

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Create directory structure
mkdir -p packages/validators/src/{common,auth,user,student,academic,financial}
mkdir -p packages/validators/__tests__

# Verify structure
ls -R packages/validators/
```

**Expected structure:**
```
packages/validators/
├── src/
│   ├── common/
│   ├── auth/
│   ├── user/
│   ├── student/
│   ├── academic/
│   ├── financial/
│   └── index.ts
├── __tests__/
├── package.json
├── tsconfig.json
└── README.md
```

---

### Task 2: Create package.json

**File:** `packages/validators/package.json`

```json
{
  "name": "@repo/validators",
  "version": "0.1.0",
  "private": true,
  "description": "Shared Zod validation schemas for the school ecosystem",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./auth": {
      "types": "./dist/auth/index.d.ts",
      "import": "./dist/auth/index.mjs",
      "require": "./dist/auth/index.js"
    },
    "./student": {
      "types": "./dist/student/index.d.ts",
      "import": "./dist/student/index.mjs",
      "require": "./dist/student/index.js"
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
    "zod": "^3.22.4",
    "@repo/utils": "workspace:*"
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

**File:** `packages/validators/tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "strict": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "__tests__"]
}
```

---

### Task 4: Create Common Validators

**File:** `packages/validators/src/common/index.ts`

```typescript
import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z
  .string({ required_error: 'Email wajib diisi' })
  .email('Format email tidak valid')
  .toLowerCase()
  .trim();

/**
 * Indonesian phone number validation
 * Supports: 08xx, +628xx, 628xx
 */
export const phoneSchema = z
  .string({ required_error: 'Nomor telepon wajib diisi' })
  .regex(
    /^(\+62|62|0)[2-9][0-9]{7,11}$/,
    'Nomor telepon harus format Indonesia (08xx atau +628xx)'
  )
  .transform(phone => {
    // Normalize to 08xx format
    if (phone.startsWith('+62')) return '0' + phone.slice(3);
    if (phone.startsWith('62')) return '0' + phone.slice(2);
    return phone;
  });

/**
 * NIK (Nomor Induk Kependudukan) - 16 digits
 */
export const nikSchema = z
  .string({ required_error: 'NIK wajib diisi' })
  .regex(/^\d{16}$/, 'NIK harus 16 digit angka');

/**
 * NISN (Nomor Induk Siswa Nasional) - 10 digits
 */
export const nisnSchema = z
  .string({ required_error: 'NISN wajib diisi' })
  .regex(/^\d{10}$/, 'NISN harus 10 digit angka');

/**
 * Strong password validation
 * Min 8 chars, 1 uppercase, 1 lowercase, 1 number
 */
export const passwordSchema = z
  .string({ required_error: 'Password wajib diisi' })
  .min(8, 'Password minimal 8 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
  .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
  .regex(/[0-9]/, 'Password harus mengandung angka');

/**
 * Name validation (Indonesian)
 */
export const nameSchema = z
  .string({ required_error: 'Nama wajib diisi' })
  .min(2, 'Nama minimal 2 karakter')
  .max(100, 'Nama maksimal 100 karakter')
  .regex(/^[a-zA-Z\s.,']+$/, 'Nama hanya boleh huruf dan spasi');

/**
 * Date schema
 */
export const dateSchema = z
  .string({ required_error: 'Tanggal wajib diisi' })
  .or(z.date())
  .pipe(z.coerce.date());

/**
 * Currency/amount schema (in Rupiah)
 */
export const amountSchema = z
  .number({ required_error: 'Jumlah wajib diisi' })
  .int('Jumlah harus bilangan bulat')
  .positive('Jumlah harus lebih dari 0');

/**
 * URL validation
 */
export const urlSchema = z
  .string()
  .url('Format URL tidak valid')
  .optional();

/**
 * Gender enum
 */
export const genderSchema = z.enum(['L', 'P'], {
  errorMap: () => ({ message: 'Jenis kelamin harus L (Laki-laki) atau P (Perempuan)' })
});
```

---

### Task 5: Create Auth Validators

**File:** `packages/validators/src/auth/index.ts`

```typescript
import { z } from 'zod';
import { emailSchema, passwordSchema } from '../common';

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: 'Password wajib diisi' }),
  remember: z.boolean().default(false).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Register schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  agree: z.literal(true, {
    errorMap: () => ({ message: 'Anda harus menyetujui syarat dan ketentuan' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
  token: z.string(),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: 'Password lama wajib diisi' }),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Password baru tidak cocok',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'Password baru harus berbeda dengan password lama',
  path: ['newPassword'],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * OAuth callback schema
 */
export const oauthCallbackSchema = z.object({
  code: z.string(),
  state: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>;
```

---

### Task 6: Create Student Validators

**File:** `packages/validators/src/student/index.ts`

```typescript
import { z } from 'zod';
import {
  nameSchema,
  nikSchema,
  nisnSchema,
  genderSchema,
  dateSchema,
  phoneSchema,
  emailSchema,
} from '../common';

/**
 * Student biodata schema
 */
export const studentBiodataSchema = z.object({
  // Personal info
  fullName: nameSchema,
  nickname: z.string().optional(),
  nisn: nisnSchema.optional(),
  nik: nikSchema,
  birthPlace: z.string().min(2, 'Tempat lahir minimal 2 karakter'),
  birthDate: dateSchema,
  gender: genderSchema,
  
  // Contact
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  
  // Address
  address: z.string().min(10, 'Alamat minimal 10 karakter'),
  rt: z.string().regex(/^\d{3}$/, 'RT harus 3 digit').optional(),
  rw: z.string().regex(/^\d{3}$/, 'RW harus 3 digit').optional(),
  village: z.string().min(2, 'Kelurahan minimal 2 karakter'),
  district: z.string().min(2, 'Kecamatan minimal 2 karakter'),
  city: z.string().min(2, 'Kota minimal 2 karakter'),
  province: z.string().min(2, 'Provinsi minimal 2 karakter'),
  postalCode: z.string().regex(/^\d{5}$/, 'Kode pos harus 5 digit').optional(),
  
  // Family
  childOrder: z.number().int().positive('Anak ke- harus bilangan positif'),
  siblingsCount: z.number().int().min(0, 'Jumlah saudara tidak boleh negatif'),
  
  // Religion & Special needs
  religion: z.enum(['islam', 'kristen', 'katolik', 'hindu', 'buddha', 'konghucu']),
  specialNeeds: z.string().optional(),
  
  // Previous education
  previousSchool: z.string().optional(),
  previousSchoolAddress: z.string().optional(),
  
  // Living situation
  livingWith: z.enum(['parents', 'father', 'mother', 'guardian', 'dormitory']),
  transportation: z.enum(['walk', 'bicycle', 'motorcycle', 'car', 'public_transport']),
  distanceKm: z.number().positive('Jarak harus lebih dari 0').optional(),
});

export type StudentBiodata = z.infer<typeof studentBiodataSchema>;

/**
 * Parent/Guardian schema
 */
export const parentSchema = z.object({
  name: nameSchema,
  nik: nikSchema,
  birthYear: z.number().int().min(1950).max(new Date().getFullYear()),
  education: z.enum([
    'sd',
    'smp',
    'sma',
    'd1',
    'd2',
    'd3',
    's1',
    's2',
    's3',
  ]),
  occupation: z.string().min(2, 'Pekerjaan minimal 2 karakter'),
  monthlyIncome: z.enum([
    'less_1m',
    '1m_3m',
    '3m_5m',
    '5m_10m',
    'more_10m',
  ]),
  phone: phoneSchema,
  email: emailSchema.optional(),
});

export type Parent = z.infer<typeof parentSchema>;

/**
 * PPDB Registration schema
 */
export const ppdbRegistrationSchema = z.object({
  // Student data
  student: studentBiodataSchema,
  
  // Parent data
  father: parentSchema,
  mother: parentSchema,
  guardian: parentSchema.optional(),
  
  // Program selection
  educationLevel: z.enum(['tk', 'sd', 'smp', 'sma', 'smk']),
  grade: z.number().int().min(1).max(12),
  major: z.string().optional(), // For SMA/SMK
  
  // Documents
  birthCertificate: z.string().url('URL akta lahir tidak valid'),
  familyCard: z.string().url('URL kartu keluarga tidak valid'),
  studentPhoto: z.string().url('URL foto siswa tidak valid'),
  reportCard: z.string().url('URL rapor tidak valid').optional(),
  
  // Agreement
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: 'Anda harus menyetujui syarat dan ketentuan' }),
  }),
});

export type PPDBRegistration = z.infer<typeof ppdbRegistrationSchema>;
```

---

### Task 7: Create Academic Validators

**File:** `packages/validators/src/academic/index.ts`

```typescript
import { z } from 'zod';
import { dateSchema } from '../common';

/**
 * Grade/score schema (0-100)
 */
export const gradeSchema = z
  .number()
  .min(0, 'Nilai minimal 0')
  .max(100, 'Nilai maksimal 100');

/**
 * Single subject grade
 */
export const subjectGradeSchema = z.object({
  subjectId: z.string().uuid('ID mata pelajaran tidak valid'),
  subjectName: z.string(),
  score: gradeSchema,
  description: z.string().optional(),
  date: dateSchema,
});

export type SubjectGrade = z.infer<typeof subjectGradeSchema>;

/**
 * Report card (Rapor)
 */
export const reportCardSchema = z.object({
  studentId: z.string().uuid(),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, 'Format tahun ajaran: YYYY/YYYY'),
  semester: z.enum(['1', '2'], {
    errorMap: () => ({ message: 'Semester harus 1 atau 2' }),
  }),
  grades: z.array(subjectGradeSchema).min(1, 'Harus ada minimal 1 nilai'),
  attendance: z.object({
    present: z.number().int().min(0),
    sick: z.number().int().min(0),
    permission: z.number().int().min(0),
    absent: z.number().int().min(0),
  }),
  teacherNote: z.string().optional(),
  principalNote: z.string().optional(),
});

export type ReportCard = z.infer<typeof reportCardSchema>;

/**
 * Attendance record
 */
export const attendanceSchema = z.object({
  studentId: z.string().uuid(),
  date: dateSchema,
  status: z.enum(['present', 'sick', 'permission', 'absent'], {
    errorMap: () => ({
      message: 'Status kehadiran: present, sick, permission, atau absent',
    }),
  }),
  note: z.string().optional(),
  attachmentUrl: z.string().url().optional(), // For sick/permission letter
});

export type Attendance = z.infer<typeof attendanceSchema>;

/**
 * Class/Room schema
 */
export const classSchema = z.object({
  name: z.string().min(1, 'Nama kelas wajib diisi'),
  grade: z.number().int().min(1).max(12),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/),
  teacherId: z.string().uuid('ID guru tidak valid'),
  capacity: z.number().int().positive('Kapasitas harus lebih dari 0'),
  currentStudents: z.number().int().min(0),
}).refine((data) => data.currentStudents <= data.capacity, {
  message: 'Jumlah siswa tidak boleh melebihi kapasitas',
  path: ['currentStudents'],
});

export type Class = z.infer<typeof classSchema>;

/**
 * Subject schema
 */
export const subjectSchema = z.object({
  name: z.string().min(2, 'Nama mata pelajaran minimal 2 karakter'),
  code: z.string().min(2, 'Kode mata pelajaran minimal 2 karakter').toUpperCase(),
  grade: z.number().int().min(1).max(12),
  category: z.enum(['compulsory', 'specialization', 'local', 'extracurricular']),
  credits: z.number().int().min(1, 'SKS minimal 1'),
});

export type Subject = z.infer<typeof subjectSchema>;
```

---

### Task 8: Create Financial Validators

**File:** `packages/validators/src/financial/index.ts`

```typescript
import { z } from 'zod';
import { amountSchema, dateSchema } from '../common';

/**
 * Payment method enum
 */
export const paymentMethodSchema = z.enum([
  'cash',
  'bank_transfer',
  'virtual_account',
  'credit_card',
  'e_wallet',
]);

/**
 * Payment status enum
 */
export const paymentStatusSchema = z.enum([
  'pending',
  'processing',
  'success',
  'failed',
  'expired',
  'cancelled',
]);

/**
 * Fee type enum
 */
export const feeTypeSchema = z.enum([
  'registration',
  'tuition',
  'book',
  'uniform',
  'activity',
  'exam',
  'other',
]);

/**
 * Invoice schema
 */
export const invoiceSchema = z.object({
  studentId: z.string().uuid(),
  invoiceNumber: z.string().min(1, 'Nomor invoice wajib diisi'),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/),
  
  items: z.array(z.object({
    feeType: feeTypeSchema,
    description: z.string(),
    amount: amountSchema,
    quantity: z.number().int().positive().default(1),
  })).min(1, 'Harus ada minimal 1 item'),
  
  subtotal: amountSchema,
  discount: z.number().int().min(0).default(0),
  tax: z.number().int().min(0).default(0),
  total: amountSchema,
  
  dueDate: dateSchema,
  status: paymentStatusSchema.default('pending'),
  
  notes: z.string().optional(),
}).refine((data) => {
  const calculatedTotal = data.subtotal - data.discount + data.tax;
  return data.total === calculatedTotal;
}, {
  message: 'Total tidak sesuai dengan perhitungan (subtotal - discount + tax)',
  path: ['total'],
});

export type Invoice = z.infer<typeof invoiceSchema>;

/**
 * Payment schema
 */
export const paymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: amountSchema,
  method: paymentMethodSchema,
  
  // For bank transfer
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
  
  // For virtual account
  vaNumber: z.string().optional(),
  
  // Proof
  proofUrl: z.string().url().optional(),
  
  // Gateway response
  transactionId: z.string().optional(),
  gatewayResponse: z.record(z.unknown()).optional(),
  
  paidAt: dateSchema.optional(),
  status: paymentStatusSchema.default('pending'),
  
  notes: z.string().optional(),
});

export type Payment = z.infer<typeof paymentSchema>;

/**
 * Scholarship schema
 */
export const scholarshipSchema = z.object({
  name: z.string().min(2, 'Nama beasiswa minimal 2 karakter'),
  description: z.string(),
  type: z.enum(['full', 'partial']),
  amount: amountSchema.optional(),
  percentage: z.number().min(0).max(100).optional(),
  
  eligibilityCriteria: z.object({
    minGrade: z.number().min(0).max(100).optional(),
    maxIncome: amountSchema.optional(),
    categories: z.array(z.string()).optional(),
  }),
  
  quota: z.number().int().positive().optional(),
  validFrom: dateSchema,
  validUntil: dateSchema,
  
  isActive: z.boolean().default(true),
}).refine((data) => {
  if (data.type === 'partial') {
    return data.amount !== undefined || data.percentage !== undefined;
  }
  return true;
}, {
  message: 'Beasiswa partial harus memiliki amount atau percentage',
  path: ['amount'],
});

export type Scholarship = z.infer<typeof scholarshipSchema>;
```

---

### Task 9: Create Main Index

**File:** `packages/validators/src/index.ts`

```typescript
// Common validators
export * from './common';

// Auth validators
export * from './auth';

// User validators
export * from './user';

// Student validators
export * from './student';

// Academic validators
export * from './academic';

// Financial validators
export * from './financial';

// Re-export zod for convenience
export { z } from 'zod';
```

---

### Task 10: Create User Validators

**File:** `packages/validators/src/user/index.ts`

```typescript
import { z } from 'zod';
import { nameSchema, emailSchema, phoneSchema } from '../common';

/**
 * User profile schema
 */
export const userProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500, 'Bio maksimal 500 karakter').optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

/**
 * User role enum
 */
export const userRoleSchema = z.enum([
  'super_admin',
  'school_admin',
  'teacher',
  'student',
  'parent',
  'finance_staff',
]);

export type UserRole = z.infer<typeof userRoleSchema>;
```

---

### Task 11: Create Tests

**File:** `packages/validators/__tests__/auth.test.ts`

```typescript
import { loginSchema, registerSchema, changePasswordSchema } from '../src/auth';

describe('Auth Validators', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
      };
      expect(loginSchema.safeParse(data).success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'password123',
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const data = {
        email: 'test@example.com',
        password: 'Pass123word',
        confirmPassword: 'Pass123word',
        name: 'John Doe',
        agree: true,
      };
      expect(registerSchema.safeParse(data).success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const data = {
        email: 'test@example.com',
        password: 'Pass123word',
        confirmPassword: 'Different123',
        name: 'John Doe',
        agree: true,
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
```

**File:** `packages/validators/__tests__/common.test.ts`

```typescript
import {
  emailSchema,
  phoneSchema,
  nikSchema,
  nisnSchema,
  passwordSchema,
} from '../src/common';

describe('Common Validators', () => {
  describe('phoneSchema', () => {
    it('should validate Indonesian phone numbers', () => {
      expect(phoneSchema.safeParse('081234567890').success).toBe(true);
      expect(phoneSchema.safeParse('+6281234567890').success).toBe(true);
      expect(phoneSchema.safeParse('6281234567890').success).toBe(true);
    });

    it('should normalize phone numbers', () => {
      const result1 = phoneSchema.parse('+6281234567890');
      const result2 = phoneSchema.parse('6281234567890');
      expect(result1).toBe('081234567890');
      expect(result2).toBe('081234567890');
    });
  });

  describe('nikSchema', () => {
    it('should validate 16-digit NIK', () => {
      expect(nikSchema.safeParse('1234567890123456').success).toBe(true);
      expect(nikSchema.safeParse('12345').success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong passwords', () => {
      expect(passwordSchema.safeParse('Pass123word').success).toBe(true);
      expect(passwordSchema.safeParse('weak').success).toBe(false);
    });
  });
});
```

**File:** `packages/validators/jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

---

### Task 12: Create README

**File:** `packages/validators/README.md`

```markdown
# @repo/validators

Shared Zod validation schemas for the school ecosystem.

## Installation

Import in your app:

\`\`\`typescript
import { loginSchema, emailSchema } from '@repo/validators';
\`\`\`

## Features

- 🔒 Type-safe with full TypeScript inference
- 🇮🇩 Indonesian validation (phone, NIK, NISN)
- 🌐 Indonesian error messages
- ✅ Comprehensive schemas for all domains
- 🧪 Well-tested

## Schemas

### Common

- `emailSchema` - Email validation
- `phoneSchema` - Indonesian phone (auto-normalize)
- `nikSchema` - NIK (16 digits)
- `nisnSchema` - NISN (10 digits)
- `passwordSchema` - Strong password
- `nameSchema` - Name validation
- `genderSchema` - Gender (L/P)

### Auth

- `loginSchema` - Login form
- `registerSchema` - Registration with password confirmation
- `changePasswordSchema` - Change password
- `resetPasswordSchema` - Reset password

### Student

- `studentBiodataSchema` - Student personal data
- `parentSchema` - Parent/guardian data
- `ppdbRegistrationSchema` - PPDB registration

### Academic

- `gradeSchema` - Score (0-100)
- `reportCardSchema` - Report card
- `attendanceSchema` - Attendance record
- `classSchema` - Class/room
- `subjectSchema` - Subject

### Financial

- `invoiceSchema` - Invoice with auto-calculation
- `paymentSchema` - Payment record
- `scholarshipSchema` - Scholarship

## Usage Examples

### Form Validation

\`\`\`typescript
import { loginSchema, type LoginInput } from '@repo/validators';

// In your form handler
function handleLogin(data: unknown) {
  const result = loginSchema.safeParse(data);
  
  if (!result.success) {
    console.error(result.error.errors);
    return;
  }
  
  // result.data is type-safe LoginInput
  const loginData: LoginInput = result.data;
  // ... login logic
}
\`\`\`

### API Validation

\`\`\`typescript
import { studentBiodataSchema } from '@repo/validators';

export async function POST(req: Request) {
  const body = await req.json();
  
  // Validate
  const result = studentBiodataSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { errors: result.error.errors },
      { status: 400 }
    );
  }
  
  // Use validated data
  const student = result.data;
  // ... save to database
}
\`\`\`

### Type Inference

\`\`\`typescript
import { z, invoiceSchema } from '@repo/validators';

// Automatically get TypeScript type
type Invoice = z.infer<typeof invoiceSchema>;

const invoice: Invoice = {
  // ... TypeScript will enforce structure
};
\`\`\`

## Testing

\`\`\`bash
# Run tests
pnpm test

# Coverage
pnpm test:coverage
\`\`\`
```

---

## 🧪 Testing Instructions

### Test 1: Build Package

```bash
cd packages/validators
pnpm install
pnpm build
ls -la dist/
```

**Expected:** Build successful, dist/ folder created

---

### Test 2: Run Tests

```bash
pnpm test
```

**Expected:** All tests pass

---

### Test 3: Test Phone Validation

```typescript
import { phoneSchema } from '@repo/validators';

// Valid phones
console.log(phoneSchema.parse('081234567890')); // "081234567890"
console.log(phoneSchema.parse('+6281234567890')); // "081234567890"

// Invalid
phoneSchema.parse('12345'); // Throws error
```

---

### Test 4: Test Type Inference

```typescript
import { loginSchema, type LoginInput } from '@repo/validators';

const data: LoginInput = {
  email: 'test@example.com',
  password: 'password',
  // TypeScript autocomplete works!
};
```

---

## 📸 Expected Results

```
packages/validators/
├── dist/                      ✅ Built files
├── src/
│   ├── common/index.ts       ✅ Common validators
│   ├── auth/index.ts         ✅ Auth schemas
│   ├── student/index.ts      ✅ Student schemas
│   ├── academic/index.ts     ✅ Academic schemas
│   ├── financial/index.ts    ✅ Financial schemas
│   └── index.ts              ✅ Main export
├── __tests__/                ✅ Tests
└── README.md                 ✅ Documentation
```

---

## ❌ Common Errors & Solutions

### Error: "Zod not found"

```bash
cd packages/validators
pnpm install zod
```

---

### Error: "Cannot find @repo/utils"

```bash
# Build utils first
cd packages/utils
pnpm build
```

---

### Error: "Type inference not working"

**Cause:** Not importing type properly

**Solution:**
```typescript
// Correct
import { loginSchema, type LoginInput } from '@repo/validators';

// Or infer manually
import { z, loginSchema } from '@repo/validators';
type LoginInput = z.infer<typeof loginSchema>;
```

---

## 🔍 Code Review Checklist

- [ ] All schemas have Indonesian error messages
- [ ] Phone numbers auto-normalize to 08xx format
- [ ] Password meets security requirements
- [ ] Custom refinements for complex validation
- [ ] Type exports available
- [ ] Tests cover edge cases
- [ ] README has examples

---

## 🔗 Dependencies

- **Depends on**: 
  - STORY-001 (Monorepo)
  - STORY-002 (TypeScript)
  - STORY-007 (Utils package)
- **Blocks**: All Phase 1 stories using forms

---

## 📚 Resources

- [Zod Documentation](https://zod.dev/)
- [Zod Error Handling](https://zod.dev/ERROR_HANDLING)
- [TypeScript Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)

---

## 💡 Tips

1. **Use safeParse** - Never throws, returns success/error
2. **Transform data** - Phone normalization example
3. **Refine for complex logic** - Password matching
4. **Export types** - `type LoginInput = z.infer<...>`
5. **Compose schemas** - Reuse common validators
6. **Test edge cases** - Empty, null, invalid formats

---

## 📝 Notes for Next Story

After this story:
- ✅ Type-safe form validation
- ✅ Consistent error messages
- ✅ Indonesian-specific validators
- ✅ Reusable across all apps

Next (STORY-009) creates @repo/types for shared TypeScript types.

---

## ✏️ Definition of Done

- [ ] All acceptance criteria met
- [ ] Package builds successfully
- [ ] All tests passing
- [ ] Type inference working
- [ ] Indonesian error messages
- [ ] Phone normalization working
- [ ] Can be imported from other packages
- [ ] Documentation complete
- [ ] Code reviewed and approved

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
