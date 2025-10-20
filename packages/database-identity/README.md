# @repo/database-identity

Type-safe Identity database client for Supabase with comprehensive query builders.

## Features

- ✅ Full TypeScript type safety
- ✅ Auto-generated types from database schema
- ✅ Comprehensive query builders for all tables
- ✅ Error handling utilities
- ✅ Audit logging support
- ✅ Server and client-side support

## Installation

This is a workspace package. Add to your `package.json`:

```json
{
  "dependencies": {
    "@repo/database-identity": "workspace:*"
  }
}
```

## Environment Variables

Required environment variables:

```bash
# Server-side (required)
IDENTITY_DB_URL=https://your-project.supabase.co
IDENTITY_DB_SERVICE_KEY=your-service-key

# Client-side (required for browser)
NEXT_PUBLIC_IDENTITY_DB_URL=https://your-project.supabase.co
NEXT_PUBLIC_IDENTITY_DB_ANON_KEY=your-anon-key
```

## Usage

### Get Supabase Client

```typescript
import { getSupabaseClient } from '@repo/database-identity';

// Get singleton client (server-side)
const supabase = getSupabaseClient();
```

### Schools Queries

```typescript
import {
  getActiveSchools,
  getSchoolById,
  getSchoolBySlug,
  createSchool,
  updateSchool,
} from '@repo/database-identity';

// Get all active schools
const schools = await getActiveSchools();

// Get school by ID
const school = await getSchoolById('school-id');

// Get school by slug
const school = await getSchoolBySlug('my-school');

// Create school
const newSchool = await createSchool({
  name: 'My School',
  slug: 'my-school',
  npsn: '12345678',
  education_level: 'sma',
  email: 'info@myschool.com',
  phone: '021-1234567',
  address: 'Jl. Pendidikan No. 1',
  village: 'Desa ABC',
  district: 'Kecamatan XYZ',
  city: 'Jakarta',
  province: 'DKI Jakarta',
  principal_name: 'John Doe',
  principal_phone: '081234567890',
});

// Update school
const updated = await updateSchool('school-id', {
  name: 'Updated Name',
});
```

### Users Queries

```typescript
import {
  getUserById,
  getUserByEmail,
  getUsersBySchool,
  createUser,
  updateUser,
  banUser,
  verifyUserEmail,
} from '@repo/database-identity';

// Get user by ID
const user = await getUserById('user-id');

// Get user by email
const user = await getUserByEmail('john@example.com');

// Get users by school
const teachers = await getUsersBySchool('school-id', 'teacher');

// Create user
const newUser = await createUser({
  email: 'john@example.com',
  name: 'John Doe',
  role: 'teacher',
  school_id: 'school-id',
});

// Verify email
await verifyUserEmail('user-id');

// Ban user
await banUser('user-id', 'Violation of terms', 'admin-id');

// Search users
const results = await searchUsers('john', 'school-id');
```

### Audit Logging

```typescript
import {
  logAudit,
  logUserAction,
  logAuthEvent,
  getAuditLogs,
  getUserAuditLogs,
} from '@repo/database-identity';

// Log generic audit event
await logAudit({
  action: 'user.created',
  resourceType: 'users',
  resourceId: 'user-id',
  description: 'New user created',
  newValues: { email: 'john@example.com' },
});

// Log user action
await logUserAction('profile.updated', 'user-id', 'Profile photo changed');

// Log authentication event
await logAuthEvent('login', 'user-id', {
  ip_address: '192.168.1.1',
  user_agent: 'Mozilla/5.0...',
});

// Get audit logs
const logs = await getAuditLogs({
  userId: 'user-id',
  action: 'login',
  limit: 50,
});

// Get user's audit logs
const userLogs = await getUserAuditLogs('user-id');
```

## Type Safety

All queries are fully typed with TypeScript:

```typescript
import type { Database } from '@repo/database-identity';

// Get types for tables
type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

// Use in your code
function processUser(user: User) {
  console.log(user.email); // ✅ Type-safe
  console.log(user.invalid); // ❌ TypeScript error
}
```

## Error Handling

```typescript
import {
  getUserById,
  isNotFound,
  isUniqueViolation,
  DatabaseError,
  getFriendlyErrorMessage,
} from '@repo/database-identity';

try {
  const user = await getUserById('invalid-id');
} catch (error) {
  if (isNotFound(error)) {
    console.log('User not found');
  } else if (isUniqueViolation(error)) {
    console.log('User already exists');
  } else if (error instanceof DatabaseError) {
    console.error('Database error:', error.message);
    console.error('Friendly message:', getFriendlyErrorMessage(error));
  }
}
```

## Available Query Builders

### Schools
- `getActiveSchools()` - Get all active schools
- `getAllSchools()` - Get all schools
- `getSchoolById(id)` - Get school by ID
- `getSchoolBySlug(slug)` - Get school by slug
- `getSchoolByNpsn(npsn)` - Get school by NPSN
- `createSchool(data)` - Create new school
- `updateSchool(id, data)` - Update school
- `deleteSchool(id)` - Soft delete school
- `activateSchool(id)` - Activate school
- `deactivateSchool(id)` - Deactivate school
- `updateSchoolSubscription(id, tier, starts, ends)` - Update subscription
- `countSchoolsByTier()` - Count schools by tier

### Users
- `getUserById(id)` - Get user by ID
- `getUserByEmail(email)` - Get user by email
- `getUsersBySchool(schoolId, role?)` - Get users by school
- `getUsersByRole(role)` - Get users by role
- `getSuperAdmins()` - Get all super admins
- `createUser(data)` - Create user
- `updateUser(id, data)` - Update user
- `deleteUser(id)` - Soft delete user
- `updateLastLogin(userId, ip)` - Update last login
- `verifyUserEmail(userId)` - Verify email
- `banUser(userId, reason, bannedBy)` - Ban user
- `unbanUser(userId)` - Unban user
- `activateUser(userId)` - Activate user
- `deactivateUser(userId)` - Deactivate user
- `updateUserPassword(userId, hash)` - Update password
- `searchUsers(query, schoolId?)` - Search users
- `countUsersByRole(schoolId?)` - Count users by role
- `emailExists(email)` - Check if email exists

### Audit Logs
- `logAudit(params)` - Log audit event
- `getAuditLogs(filters?)` - Get audit logs with filters
- `getUserAuditLogs(userId, limit?)` - Get user's audit logs
- `getSchoolAuditLogs(schoolId, limit?)` - Get school's audit logs
- `getResourceAuditLogs(type, id, limit?)` - Get resource audit logs
- `getRecentAuditLogs(limit?)` - Get recent audit logs
- `countAuditLogsByAction(schoolId?)` - Count logs by action
- `getAuditLogStats(schoolId?)` - Get audit statistics
- `logUserAction(action, userId, details?)` - Helper to log user action
- `logSchoolAction(action, schoolId, details?)` - Helper to log school action
- `logAuthEvent(action, userId, metadata?)` - Helper to log auth event

## Development

```bash
# Build package
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## License

Private - Part of Ekosistem Sekolah monorepo
