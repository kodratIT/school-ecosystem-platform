# @repo/types

Shared TypeScript types and interfaces for the school ecosystem.

## Installation

This is an internal workspace package. Import from your app:

```typescript
import type { User, Student, APIResponse } from '@repo/types';
import { UserRole, PaymentStatus } from '@repo/types';
```

## Features

- 🎯 Type-safe branded IDs
- 📦 Complete domain entity types
- 🌐 API request/response types
- 🔢 Constants and enums
- 🛠️ Utility types for common patterns
- 📝 Fully documented with TSDoc

## Utility Types

### Branded IDs

Type-safe IDs to prevent mixing different entity IDs:

```typescript
import { UserId, StudentId, brandId } from '@repo/types';

const userId = brandId<UserId>('user-123');
const studentId = brandId<StudentId>('student-456');

// TypeScript error: Type 'StudentId' is not assignable to type 'UserId'
const wrong: UserId = studentId; // ❌ Error
```

Available branded IDs:
- `UserId`, `SchoolId`, `StudentId`, `TeacherId`
- `ParentId`, `ClassId`, `SubjectId`, `GradeId`
- `InvoiceId`, `PaymentId`, `AttendanceId`
- `RoleId`, `PermissionId`

### Helper Types

```typescript
import type {
  RequireKeys,
  OptionalKeys,
  Paginated,
  APIResponse,
  Timestamps,
} from '@repo/types';

// Make specific keys required
type UserWithEmail = RequireKeys<User, 'email'>;

// Paginated response
type PaginatedUsers = Paginated<User>;

// API response wrapper
type UsersResponse = APIResponse<User[]>;
```

## Constants & Enums

### User Roles

```typescript
import { UserRole } from '@repo/types';

const role: UserRole = UserRole.TEACHER;
// Values: SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT, PARENT, STAFF
```

### Other Enums

- `Gender` - L (Laki-laki), P (Perempuan)
- `Religion` - Indonesian religions
- `EducationLevel` - tk, sd, smp, sma, smk, d1-d3, s1-s3
- `AttendanceStatus` - present, absent, sick, permit, late
- `PaymentStatus` - pending, paid, cancelled, refunded, failed
- `PaymentMethod` - bank_transfer, credit_card, ewallet, cash, virtual_account
- `InvoiceStatus` - draft, sent, paid, overdue, cancelled
- `Semester` - 1 (Ganjil), 2 (Genap)
- `PermissionAction` - create, read, update, delete, manage
- `PermissionResource` - user, student, teacher, class, etc

## Entity Types

### User & School

```typescript
import type { User, School } from '@repo/types/entities';

const user: User = {
  id: brandId<UserId>('user-1'),
  email: 'user@school.com',
  name: 'John Doe',
  role: UserRole.TEACHER,
  schoolId: brandId<SchoolId>('school-1'),
  avatar: null,
  isActive: true,
  lastLoginAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

### Student

```typescript
import type { Student } from '@repo/types/entities';

const student: Student = {
  id: brandId<StudentId>('student-1'),
  userId: brandId<UserId>('user-1'),
  schoolId: brandId<SchoolId>('school-1'),
  nisn: '1234567890',
  nis: '12345',
  fullName: 'Ahmad Rizki',
  gender: Gender.MALE,
  birthPlace: 'Jakarta',
  birthDate: new Date('2010-01-15'),
  religion: Religion.ISLAM,
  // ... other fields
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

### Complete Entity List

- `User` - Base user account
- `School` - School information
- `Student` - Student data with full biodata
- `Parent` - Parent/guardian information
- `Teacher` - Teacher data
- `Class` - Class/classroom
- `Subject` - Academic subject
- `Grade` - Student grades/scores
- `Attendance` - Attendance records
- `Invoice` - Billing invoice
- `Payment` - Payment transaction
- `Role` - RBAC role
- `Permission` - RBAC permission

## API Types

### Request/Response

```typescript
import type {
  APIResponse,
  APIErrorResponse,
  PaginatedResponse,
  LoginRequest,
  LoginResponse,
} from '@repo/types/api';

// API Success
const response: APIResponse<User> = {
  success: true,
  data: user,
  message: 'User retrieved successfully',
};

// API Error
const error: APIErrorResponse = {
  success: false,
  error: {
    code: ErrorCode.NOT_FOUND,
    message: 'User not found',
  },
};

// Paginated response
const users: PaginatedResponse<User> = {
  success: true,
  data: {
    data: [user1, user2],
    pagination: {
      page: 1,
      pageSize: 10,
      totalPages: 5,
      totalItems: 50,
    },
  },
};
```

### List Params

```typescript
import type { ListParams } from '@repo/types/api';

const params: ListParams = {
  page: 1,
  pageSize: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  search: 'john',
  filters: {
    role: 'teacher',
    isActive: true,
  },
};
```

### Error Codes

```typescript
import { ErrorCode } from '@repo/types/api';

// Authentication
ErrorCode.UNAUTHORIZED;
ErrorCode.FORBIDDEN;
ErrorCode.TOKEN_EXPIRED;
ErrorCode.INVALID_CREDENTIALS;

// Validation
ErrorCode.VALIDATION_ERROR;
ErrorCode.INVALID_INPUT;

// Resources
ErrorCode.NOT_FOUND;
ErrorCode.ALREADY_EXISTS;
ErrorCode.CONFLICT;

// Server
ErrorCode.INTERNAL_ERROR;
ErrorCode.SERVICE_UNAVAILABLE;

// Business logic
ErrorCode.INSUFFICIENT_BALANCE;
ErrorCode.ENROLLMENT_CLOSED;
ErrorCode.QUOTA_EXCEEDED;
```

## Usage Examples

### Type-Safe API Handler

```typescript
import type {
  APIResponse,
  APIErrorResponse,
  User,
} from '@repo/types';
import { ErrorCode } from '@repo/types';

async function getUser(id: UserId): Promise<APIResponse<User>> {
  try {
    const user = await db.user.findById(id);

    if (!user) {
      return {
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: 'User not found',
        },
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to fetch user',
      },
    };
  }
}
```

### Form with Branded IDs

```typescript
import type { StudentId, ClassId } from '@repo/types';
import { brandId } from '@repo/types';

interface EnrollmentForm {
  studentId: StudentId;
  classId: ClassId;
}

const form: EnrollmentForm = {
  studentId: brandId<StudentId>('student-123'),
  classId: brandId<ClassId>('class-456'),
};
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
