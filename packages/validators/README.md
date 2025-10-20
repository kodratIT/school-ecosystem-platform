# @repo/validators

Shared Zod validation schemas for the school ecosystem with full TypeScript type inference.

## Installation

This is an internal workspace package. Import from your app:

```typescript
import { loginSchema, emailSchema } from '@repo/validators';
```

## Features

- 🔒 Type-safe validation with Zod
- 🇮🇩 Indonesian-specific validators (NIK, NISN, phone)
- 📝 Custom error messages in Indonesian
- 🎯 Full TypeScript type inference
- ♻️ Reusable schemas across all apps

## Common Validators

### Basic

- `emailSchema` - Email validation with lowercase
- `phoneSchema` - Indonesian phone with auto-normalization
- `nikSchema` - 16-digit NIK validation
- `nisnSchema` - 10-digit NISN validation
- `passwordSchema` - Strong password (min 8 chars, uppercase, lowercase, number)
- `nameSchema` - Indonesian name validation
- `dateSchema` - Date with automatic coercion
- `amountSchema` - Positive integer amounts
- `urlSchema` - URL validation

### Enums

- `genderSchema` - L (Laki-laki) / P (Perempuan)
- `religionSchema` - Indonesian religions
- `educationLevelSchema` - tk, sd, smp, sma, smk, d1-d3, s1-s3

## Auth Validators

### Login

```typescript
import { loginSchema, type LoginInput } from '@repo/validators/auth';

const data: LoginInput = {
  email: 'user@example.com',
  password: 'password123',
  remember: true,
};

const result = loginSchema.safeParse(data);
```

### Register

```typescript
import { registerSchema, type RegisterInput } from '@repo/validators/auth';

const data: RegisterInput = {
  email: 'user@example.com',
  password: 'Password123',
  confirmPassword: 'Password123',
  name: 'John Doe',
  agree: true,
};
```

### Password Management

- `forgotPasswordSchema` - Email for reset
- `resetPasswordSchema` - Reset with token
- `changePasswordSchema` - Change with validation

## Student Validators

### PPDB Registration

```typescript
import {
  ppdbRegistrationSchema,
  type PPDBRegistration,
} from '@repo/validators/student';

const registration: PPDBRegistration = {
  student: {
    fullName: 'Ahmad Rizki',
    nik: '1234567890123456',
    birthPlace: 'Jakarta',
    birthDate: new Date('2010-01-15'),
    gender: 'L',
    // ... more fields
  },
  father: {
    name: 'Budi Santoso',
    nik: '1234567890123456',
    birthYear: 1980,
    // ... more fields
  },
  mother: {
    // ... parent info
  },
  educationLevel: 'smp',
  grade: 7,
  agreeToTerms: true,
};
```

### Biodata & Parent Schemas

- `studentBiodataSchema` - Complete student biodata
- `parentSchema` - Parent/guardian information

## Academic Validators

### Grades

```typescript
import { gradeRecordSchema, type GradeRecord } from '@repo/validators/academic';

const grade: GradeRecord = {
  studentId: 'student-123',
  subjectId: 'math-101',
  semester: 1,
  academicYear: '2024/2025',
  assignments: 85,
  midterm: 80,
  finalExam: 90,
  final: 85,
};
```

### Attendance

```typescript
import { attendanceSchema } from '@repo/validators/academic';

const attendance = {
  studentId: 'student-123',
  date: new Date(),
  status: 'present', // present | absent | sick | permit
  notes: 'On time',
};
```

## Usage Examples

### Form Validation

```typescript
import { loginSchema } from '@repo/validators';

function LoginForm() {
  const handleSubmit = (data: unknown) => {
    const result = loginSchema.safeParse(data);

    if (!result.success) {
      // Show validation errors
      console.error(result.error.errors);
      return;
    }

    // Data is valid and typed
    const validData = result.data;
    // validData.email: string
    // validData.password: string
    // validData.remember?: boolean
  };
}
```

### API Validation

```typescript
import { registerSchema } from '@repo/validators';

export async function POST(request: Request) {
  const body = await request.json();
  const result = registerSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { errors: result.error.errors },
      { status: 400 }
    );
  }

  // Process valid data
  const user = await createUser(result.data);
  return Response.json(user);
}
```

### Custom Error Messages

All schemas include Indonesian error messages:

```typescript
const result = emailSchema.safeParse('invalid-email');

if (!result.success) {
  console.log(result.error.errors[0].message);
  // Output: "Format email tidak valid"
}
```

## Type Inference

All schemas automatically infer TypeScript types:

```typescript
import { loginSchema, type LoginInput } from '@repo/validators';

// Automatically typed from schema
type LoginInput = z.infer<typeof loginSchema>;
// { email: string; password: string; remember?: boolean }
```

## Development

```bash
# Type check
pnpm type-check

# Lint
pnpm lint
```

## License

Private - Internal use only
