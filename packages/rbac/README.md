# @repo/rbac

Role-Based Access Control (RBAC) package for the school ecosystem platform.

## Features

- ✅ Permission checking with caching
- ✅ Role-based access control
- ✅ Resource-based permissions
- ✅ React hooks for client components
- ✅ Guard functions for server-side
- ✅ Type-safe API
- ✅ School-level isolation

## Installation

```bash
pnpm add @repo/rbac
```

## Usage

### Server-Side (API Routes)

```typescript
import { requirePermission, Permissions, PermissionChecker } from '@repo/rbac';

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  const checker = new PermissionChecker(await getUserPermissions(user.id));
  
  // Throws if user doesn't have permission
  requirePermission(user, checker, Permissions.deleteUser());
  
  // Delete user...
  return Response.json({ success: true });
}
```

### Role-Based Guards

```typescript
import { requireRole, requireSameSchool } from '@repo/rbac';

export async function updateStudent(studentId: string) {
  const user = await getCurrentUser();
  const student = await getStudent(studentId);
  
  // Require specific role
  requireRole(user, ['teacher', 'school_admin']);
  
  // Require same school
  requireSameSchool(user, student.schoolId);
  
  // Update student...
}
```

### React Hooks

```typescript
import { usePermission, useRole, Permissions } from '@repo/rbac/hooks';

function UserActions({ user, permissions }) {
  const { can } = usePermission(user, permissions);
  const { isTeacher, isSuperAdmin } = useRole(user);
  
  return (
    <div>
      {can(Permissions.updateUser()) && (
        <button>Edit User</button>
      )}
      {can(Permissions.deleteUser()) && (
        <button>Delete User</button>
      )}
      {isTeacher && <p>Welcome, Teacher!</p>}
    </div>
  );
}
```

### Permission Component

```typescript
import { Can, Permissions } from '@repo/rbac';

function UserCard({ user, currentUser, permissions }) {
  return (
    <div>
      <h2>{user.name}</h2>
      
      <Can 
        user={currentUser} 
        permissions={permissions} 
        do={Permissions.deleteUser()}
        fallback={<p>No permission</p>}
      >
        <button>Delete User</button>
      </Can>
    </div>
  );
}
```

## API Reference

### PermissionChecker

Main class for checking permissions.

```typescript
const checker = new PermissionChecker(permissions);

// Check single permission
const result = checker.can(user, { resource: 'users', action: 'create' });
console.log(result.allowed); // true/false

// Check any permission
checker.canAny(user, [
  { resource: 'users', action: 'create' },
  { resource: 'users', action: 'update' }
]);

// Check all permissions
checker.canAll(user, [
  { resource: 'users', action: 'create' },
  { resource: 'users', action: 'read' }
]);

// Clear cache
checker.clearCache();

// Update permissions
checker.updatePermissions(newPermissions);
```

### Guards

Functions that throw errors if conditions not met.

```typescript
// Require permission
requirePermission(user, checker, Permissions.createUser());

// Require any permission
requireAnyPermission(user, checker, [
  Permissions.createUser(),
  Permissions.updateUser()
]);

// Require all permissions
requireAllPermissions(user, checker, [
  Permissions.readUser(),
  Permissions.updateUser()
]);

// Require role
requireRole(user, 'super_admin');
requireRole(user, ['teacher', 'school_admin']); // Any of these roles

// Require same school
requireSameSchool(user, 'school-123');

// Check role (boolean)
hasRole(user, 'teacher'); // true/false

// Check same school (boolean)
isSameSchool(user, 'school-123'); // true/false
```

### Permission Builders

Pre-built permission checks for common resources.

```typescript
import { Permissions } from '@repo/rbac';

// Users
Permissions.createUser()
Permissions.readUser()
Permissions.updateUser()
Permissions.deleteUser()
Permissions.listUsers()

// Schools
Permissions.createSchool()
Permissions.updateSchool()
// ... etc

// Students
Permissions.createStudent()
Permissions.readStudent()
// ... etc

// Custom permission
Permissions.custom('grades', 'approve')
```

### React Hooks

#### usePermission

```typescript
const { can, canAny, canAll } = usePermission(user, permissions);

if (can(Permissions.deleteUser())) {
  // Show delete button
}
```

#### useRole

```typescript
const { 
  hasRole, 
  hasAnyRole,
  isSuperAdmin, 
  isSchoolAdmin,
  isTeacher,
  isStudent,
  isParent 
} = useRole(user);

if (isSuperAdmin) {
  // Show admin panel
}
```

#### useCanRender

```typescript
const canDelete = useCanRender(user, permissions, Permissions.deleteUser());

return canDelete ? <DeleteButton /> : null;
```

## Types

```typescript
interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

interface User {
  id: string;
  role: string;
  schoolId?: string;
  roles?: Role[];
}

type PermissionCheck = {
  resource: string;
  action: string;
};

type PermissionResult = {
  allowed: boolean;
  reason?: string;
};
```

## Best Practices

1. **Cache Permissions**: Load user permissions once and reuse
2. **Use Guards in API Routes**: Protect endpoints with `requirePermission`
3. **Use Hooks in Components**: Check permissions in UI with `usePermission`
4. **Super Admin Bypass**: Super admins automatically have all permissions
5. **School Isolation**: Use `requireSameSchool` for multi-tenant features
6. **Clear Cache**: Clear cache when user permissions change

## Examples

### Protecting API Routes

```typescript
// app/api/users/[id]/route.ts
import { requirePermission, Permissions, PermissionChecker } from '@repo/rbac';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  const permissions = await getUserPermissions(user.id);
  const checker = new PermissionChecker(permissions);
  
  requirePermission(user, checker, Permissions.deleteUser());
  
  await deleteUser(params.id);
  return Response.json({ success: true });
}
```

### Multi-tenant Access Control

```typescript
export async function getStudents(schoolId: string) {
  const user = await getCurrentUser();
  
  // Super admin can access all schools
  if (!hasRole(user, 'super_admin')) {
    requireSameSchool(user, schoolId);
  }
  
  return await db.students.where('schoolId', schoolId).findMany();
}
```

## License

Private - School Ecosystem Platform
