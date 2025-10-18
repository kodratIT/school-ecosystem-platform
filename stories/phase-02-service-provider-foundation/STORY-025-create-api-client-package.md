# STORY-025: Create API Client Package

**Epic**: Phase 2 - Service Provider Foundation  
**Sprint**: Week 3 (Day 5)  
**Story Points**: 5  
**Priority**: P0 (Critical)  
**Status**: 📋 TODO

---

## 📖 Description

As a **developer**, I want to **create a type-safe API client package** so that **Service Provider applications can easily communicate with Identity Provider and other services using HTTP requests with automatic auth token injection**.

---

## 🎯 Goals

- Create base API client with HTTP methods (GET, POST, PUT, DELETE)
- Automatic JWT token injection in headers
- Type-safe request/response handling
- Identity Provider specific client
- Error handling and retry logic
- Request/response interceptors

---

## ✅ Acceptance Criteria

- [ ] Package directory structure created
- [ ] Base API client implemented with ky library
- [ ] Auth token automatically added to requests
- [ ] Identity Provider client with typed methods
- [ ] Error handling implemented
- [ ] Retry logic for failed requests
- [ ] TypeScript types exported
- [ ] package.json configured
- [ ] pnpm type-check passes

---

## 🔗 Prerequisites

```bash
# Verify auth client exists
test -d packages/auth-client && echo "✅ Auth client ready"
test -f packages/auth-client/src/jwt-utils.ts && echo "✅ JWT utils available"
```

---

## 📋 Tasks

### Task 1: Create Package Structure

```bash
cd "/Users/kodrat/Public/Source Code/ekosistem-sekolah"

# Create directory
mkdir -p packages/api-client/src

cd packages/api-client
```

---

### Task 2: Create package.json

**File**: `packages/api-client/package.json`

```json
{
  "name": "@repo/api-client",
  "version": "0.0.0",
  "private": true,
  "description": "API client for inter-service communication",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint src/"
  },
  "dependencies": {
    "@repo/auth-client": "workspace:*",
    "@repo/types": "workspace:*",
    "ky": "^1.2.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.3.3"
  }
}
```

**Install:**
```bash
pnpm install
```

---

### Task 3: Create TypeScript Config

**File**: `packages/api-client/tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

### Task 4: Create Type Definitions

**File**: `packages/api-client/src/types.ts`

```typescript
/**
 * Standard API response wrapper
 */
export interface APIResponse<T = any> {
  data: T;
  error?: APIError;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

/**
 * API error structure
 */
export interface APIError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}

/**
 * Request configuration
 */
export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retry?: number;
}
```

---

### Task 5: Implement Base API Client

**File**: `packages/api-client/src/client.ts`

```typescript
import ky, { type KyInstance, type Options } from 'ky';
import { getToken } from '@repo/auth-client';
import type { RequestConfig } from './types';

/**
 * Create API client with default configuration
 * 
 * Features:
 * - Automatic auth token injection
 * - Retry on network errors
 * - Request/response logging
 * - Error handling
 * 
 * @param baseURL - Base URL for all requests
 * @returns Configured ky instance
 */
export function createAPIClient(baseURL: string): KyInstance {
  return ky.create({
    prefixUrl: baseURL,
    timeout: 30000, // 30 seconds
    retry: {
      limit: 2,
      methods: ['get'],
      statusCodes: [408, 413, 429, 500, 502, 503, 504],
      backoffLimit: 3000,
    },
    hooks: {
      beforeRequest: [
        request => {
          // Add auth token if available
          const token = getToken();
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }

          // Add content type
          if (!request.headers.has('Content-Type')) {
            request.headers.set('Content-Type', 'application/json');
          }

          // Log request (development only)
          if (process.env.NODE_ENV === 'development') {
            console.log('API Request:', {
              method: request.method,
              url: request.url,
              headers: Object.fromEntries(request.headers),
            });
          }
        },
      ],
      afterResponse: [
        (_request, _options, response) => {
          // Log response (development only)
          if (process.env.NODE_ENV === 'development') {
            console.log('API Response:', {
              status: response.status,
              url: response.url,
            });
          }

          // Log errors
          if (!response.ok) {
            console.error('API Error:', {
              status: response.status,
              statusText: response.statusText,
              url: response.url,
            });
          }

          return response;
        },
      ],
    },
  });
}

/**
 * Base API client class
 * Provides typed HTTP methods
 */
export class BaseAPIClient {
  protected client: KyInstance;

  constructor(baseURL: string) {
    this.client = createAPIClient(baseURL);
  }

  /**
   * GET request
   */
  async get<T>(path: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.get(path, {
      searchParams: config?.params,
      headers: config?.headers,
      timeout: config?.timeout,
      retry: config?.retry,
    } as Options);
    
    return response.json<T>();
  }

  /**
   * POST request
   */
  async post<T>(
    path: string,
    body?: any,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.client.post(path, {
      json: body,
      headers: config?.headers,
      timeout: config?.timeout,
      retry: config?.retry,
    } as Options);
    
    return response.json<T>();
  }

  /**
   * PUT request
   */
  async put<T>(
    path: string,
    body?: any,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.client.put(path, {
      json: body,
      headers: config?.headers,
      timeout: config?.timeout,
      retry: config?.retry,
    } as Options);
    
    return response.json<T>();
  }

  /**
   * PATCH request
   */
  async patch<T>(
    path: string,
    body?: any,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.client.patch(path, {
      json: body,
      headers: config?.headers,
      timeout: config?.timeout,
      retry: config?.retry,
    } as Options);
    
    return response.json<T>();
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.delete(path, {
      headers: config?.headers,
      timeout: config?.timeout,
      retry: config?.retry,
    } as Options);
    
    return response.json<T>();
  }
}
```

---

### Task 6: Create Identity Provider Client

**File**: `packages/api-client/src/identity-client.ts`

```typescript
import { BaseAPIClient } from './client';

/**
 * User type from Identity Provider
 */
interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * School type from Identity Provider
 */
interface School {
  id: string;
  name: string;
  domain: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Role type from Identity Provider
 */
interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

/**
 * Identity Provider API client
 * Communicates with the central Identity Provider
 * 
 * @example
 * const idpClient = new IdentityAPIClient();
 * const user = await idpClient.getUser('user-id');
 * const school = await idpClient.getSchool('school-id');
 */
export class IdentityAPIClient extends BaseAPIClient {
  constructor(idpURL?: string) {
    super(
      idpURL || 
      process.env.NEXT_PUBLIC_IDP_URL || 
      'http://localhost:3000'
    );
  }

  // ==================
  // User APIs
  // ==================

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User> {
    return this.get<User>(`/api/users/${userId}`);
  }

  /**
   * Get users for a school
   */
  async getSchoolUsers(schoolId: string): Promise<User[]> {
    return this.get<User[]>('/api/users', {
      params: { school_id: schoolId },
    });
  }

  /**
   * Search users
   */
  async searchUsers(
    schoolId: string,
    query: string
  ): Promise<User[]> {
    return this.get<User[]>('/api/users/search', {
      params: { school_id: schoolId, q: query },
    });
  }

  // ==================
  // School APIs
  // ==================

  /**
   * Get school by ID
   */
  async getSchool(schoolId: string): Promise<School> {
    return this.get<School>(`/api/schools/${schoolId}`);
  }

  /**
   * Get school by domain
   */
  async getSchoolByDomain(domain: string): Promise<School> {
    return this.get<School>('/api/schools/by-domain', {
      params: { domain },
    });
  }

  // ==================
  // Role & Permission APIs
  // ==================

  /**
   * Get user roles
   */
  async getUserRoles(
    userId: string,
    schoolId: string
  ): Promise<Role[]> {
    return this.get<Role[]>(`/api/users/${userId}/roles`, {
      params: { school_id: schoolId },
    });
  }

  /**
   * Check if user has permission
   */
  async checkPermission(
    userId: string,
    schoolId: string,
    permission: string
  ): Promise<boolean> {
    const result = await this.post<{ hasPermission: boolean }>(
      '/api/auth/check-permission',
      {
        user_id: userId,
        school_id: schoolId,
        permission,
      }
    );
    return result.hasPermission;
  }

  /**
   * Check if user has role
   */
  async checkRole(
    userId: string,
    schoolId: string,
    role: string
  ): Promise<boolean> {
    const result = await this.post<{ hasRole: boolean }>(
      '/api/auth/check-role',
      {
        user_id: userId,
        school_id: schoolId,
        role,
      }
    );
    return result.hasRole;
  }

  // ==================
  // Session APIs
  // ==================

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<{
    valid: boolean;
    user?: User;
  }> {
    return this.post('/api/auth/validate-token', { token });
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(refreshToken: string): Promise<{
    token: string;
    refreshToken: string;
    expiresAt: string;
  }> {
    return this.post('/api/auth/refresh-token', {
      refresh_token: refreshToken,
    });
  }
}
```

---

### Task 7: Create Main Index

**File**: `packages/api-client/src/index.ts`

```typescript
// Base client
export { BaseAPIClient, createAPIClient } from './client';

// Specific clients
export { IdentityAPIClient } from './identity-client';

// Types
export type { 
  APIResponse, 
  APIError, 
  RequestConfig 
} from './types';
```

---

### Task 8: Create README

**File**: `packages/api-client/README.md`

```markdown
# API Client Package

Type-safe API client for inter-service communication.

## Features

- **Base API Client**: Generic HTTP client with common methods
- **Identity Provider Client**: Typed client for IdP APIs
- **Auto Auth**: Automatic JWT token injection
- **Retry Logic**: Auto-retry on network errors
- **Type-Safe**: Full TypeScript support

## Installation

Already installed as workspace package: `@repo/api-client`

## Usage

### Identity Provider Client

\`\`\`typescript
import { IdentityAPIClient } from '@repo/api-client';

const idpClient = new IdentityAPIClient();

// Get user
const user = await idpClient.getUser('user-id');

// Get school
const school = await idpClient.getSchool('school-id');

// Check permission
const hasPermission = await idpClient.checkPermission(
  'user-id',
  'school-id',
  'students.read'
);
\`\`\`

### Custom API Client

\`\`\`typescript
import { BaseAPIClient } from '@repo/api-client';

class MyServiceClient extends BaseAPIClient {
  constructor() {
    super('http://localhost:3002'); // Your service URL
  }

  async getStudents(schoolId: string) {
    return this.get<Student[]>('/api/students', {
      params: { school_id: schoolId }
    });
  }

  async createStudent(data: StudentInput) {
    return this.post<Student>('/api/students', data);
  }
}

const client = new MyServiceClient();
const students = await client.getStudents('school-123');
\`\`\`

### With Custom Headers

\`\`\`typescript
const data = await client.get('/api/data', {
  headers: {
    'X-Custom-Header': 'value'
  },
  timeout: 5000
});
\`\`\`

## API Methods

### BaseAPIClient

- `get<T>(path, config?)` - GET request
- `post<T>(path, body?, config?)` - POST request
- `put<T>(path, body?, config?)` - PUT request
- `patch<T>(path, body?, config?)` - PATCH request
- `delete<T>(path, config?)` - DELETE request

### IdentityAPIClient

**Users:**
- `getUser(userId)` - Get user by ID
- `getSchoolUsers(schoolId)` - Get all users in school
- `searchUsers(schoolId, query)` - Search users

**Schools:**
- `getSchool(schoolId)` - Get school by ID
- `getSchoolByDomain(domain)` - Get school by domain

**Auth:**
- `getUserRoles(userId, schoolId)` - Get user roles
- `checkPermission(userId, schoolId, permission)` - Check permission
- `checkRole(userId, schoolId, role)` - Check role
- `validateToken(token)` - Validate JWT
- `refreshToken(refreshToken)` - Refresh JWT

## Configuration

### Request Config

\`\`\`typescript
interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retry?: number;
}
\`\`\`

### Environment Variables

\`\`\`bash
# Identity Provider URL
NEXT_PUBLIC_IDP_URL=http://localhost:3000
\`\`\`

## Error Handling

\`\`\`typescript
try {
  const user = await idpClient.getUser('user-id');
} catch (error) {
  if (error.response?.status === 404) {
    console.log('User not found');
  } else if (error.response?.status === 401) {
    console.log('Unauthorized');
  } else {
    console.error('API error:', error);
  }
}
\`\`\`

## Retry Logic

Automatically retries on:
- Status codes: 408, 413, 429, 500, 502, 503, 504
- Network errors
- Timeout errors

Retry configuration:
- Max retries: 2
- Backoff limit: 3 seconds
- Only for GET requests

## Authentication

JWT token automatically added to all requests:

\`\`\`
Authorization: Bearer <token>
\`\`\`

Token retrieved from cookie via `@repo/auth-client`.

## Best Practices

1. **Create Service-Specific Clients**
   \`\`\`typescript
   class PPDBClient extends BaseAPIClient {
     constructor() {
       super(process.env.NEXT_PUBLIC_PPDB_URL);
     }
   }
   \`\`\`

2. **Type Your Responses**
   \`\`\`typescript
   interface Student {
     id: string;
     name: string;
     school_id: string;
   }

   const students = await client.get<Student[]>('/api/students');
   \`\`\`

3. **Handle Errors**
   \`\`\`typescript
   try {
     const data = await client.get('/api/data');
   } catch (error) {
     // Handle error
   }
   \`\`\`

4. **Use Query Params**
   \`\`\`typescript
   const data = await client.get('/api/data', {
     params: { page: 1, limit: 20 }
   });
   // Calls: /api/data?page=1&limit=20
   \`\`\`
\`\`\`

---

## 🧪 Testing Instructions

### Test 1: Package Builds

```bash
cd packages/api-client
pnpm type-check
# Should pass
```

### Test 2: Create Test Client

**File**: `test-client.ts`

```typescript
import { IdentityAPIClient, BaseAPIClient } from './src/index';

// Test instantiation
const idpClient = new IdentityAPIClient();
console.log('✅ IdP client created');

class TestClient extends BaseAPIClient {
  constructor() {
    super('http://localhost:3000');
  }
}

const testClient = new TestClient();
console.log('✅ Base client created');
```

Run:
```bash
npx tsx test-client.ts
rm test-client.ts
```

### Test 3: Mock API Call

```typescript
import { IdentityAPIClient } from './src/index';

// Create client
const client = new IdentityAPIClient('http://localhost:3000');

// Mock test (requires IdP running)
async function test() {
  try {
    // This will fail if IdP not running - that's OK for structure test
    console.log('Testing API call structure...');
    await client.getUser('test-id');
  } catch (error) {
    console.log('✅ Client structure correct (API call attempted)');
  }
}

test();
```

---

## 📸 Expected Results

```
packages/api-client/
├── package.json          ✅
├── tsconfig.json        ✅
├── README.md            ✅
└── src/
    ├── index.ts         ✅
    ├── types.ts         ✅
    ├── client.ts        ✅
    └── identity-client.ts ✅
```

**Terminal:**
```bash
$ pnpm type-check
✓ Type check passed

$ pnpm list --depth 0
@repo/api-client
├── @repo/auth-client workspace:*
├── ky 1.2.0
```

---

## ❌ Common Errors & Solutions

### Error: "Cannot find module 'ky'"

```bash
cd packages/api-client
pnpm install
```

### Error: "Network request failed"

**Cause:** Service not running or wrong URL

**Check:**
- Service is running
- URL is correct
- Network connectivity

### Error: "401 Unauthorized"

**Cause:** No JWT token or expired

**Check:**
- User is logged in
- Token not expired
- Token in cookie

---

## 💡 Usage Examples

### Example 1: Get User from IdP

```typescript
import { IdentityAPIClient } from '@repo/api-client';

const idpClient = new IdentityAPIClient();
const user = await idpClient.getUser('user-id');
console.log(user.name);
```

### Example 2: Custom Service Client

```typescript
import { BaseAPIClient } from '@repo/api-client';

class PPDBClient extends BaseAPIClient {
  constructor() {
    super(process.env.NEXT_PUBLIC_PPDB_URL);
  }

  async getApplications(schoolId: string) {
    return this.get('/api/applications', {
      params: { school_id: schoolId }
    });
  }
}
```

### Example 3: With Error Handling

```typescript
import { IdentityAPIClient } from '@repo/api-client';

const client = new IdentityAPIClient();

try {
  const user = await client.getUser('user-id');
  console.log('User found:', user);
} catch (error) {
  console.error('Failed to get user:', error);
}
```

---

## 🔗 Dependencies

- **Depends on**: STORY-023 (Auth Client)
- **Blocks**: Service Provider apps communication

---

## 📚 Resources

- [ky Documentation](https://github.com/sindresorhus/ky)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## ✏️ Definition of Done

- [ ] All files created
- [ ] package.json configured
- [ ] Base API client implemented
- [ ] Identity Provider client implemented
- [ ] Types exported
- [ ] README complete
- [ ] pnpm install works
- [ ] pnpm type-check passes
- [ ] Usage examples documented
- [ ] Code reviewed
- [ ] Story marked complete

---

**Created**: 2024  
**Last Updated**: 2024  
**Story Owner**: Development Team
