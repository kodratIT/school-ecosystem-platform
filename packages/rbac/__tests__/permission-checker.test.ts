import { PermissionChecker } from '../src/core/permission-checker';
import type { User, Permission } from '../src/types';

describe('PermissionChecker', () => {
  const permissions: Permission[] = [
    {
      id: '1',
      name: 'users.create',
      resource: 'users',
      action: 'create',
    },
    {
      id: '2',
      name: 'users.read',
      resource: 'users',
      action: 'read',
    },
  ];

  const user: User = {
    id: 'user-1',
    role: 'teacher',
    schoolId: 'school-1',
  };

  const superAdmin: User = {
    id: 'admin-1',
    role: 'super_admin',
  };

  let checker: PermissionChecker;

  beforeEach(() => {
    checker = new PermissionChecker(permissions);
  });

  describe('can', () => {
    it('should allow super admin all permissions', () => {
      const result = checker.can(superAdmin, {
        resource: 'anything',
        action: 'anything',
      });
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('Super admin');
    });

    it('should check user permissions correctly', () => {
      const result = checker.can(user, { resource: 'users', action: 'create' });
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('Permission granted');
    });

    it('should deny permission not granted', () => {
      const result = checker.can(user, { resource: 'users', action: 'delete' });
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Permission denied');
    });

    it('should cache permission checks', () => {
      const result1 = checker.can(user, {
        resource: 'users',
        action: 'read',
      });
      const result2 = checker.can(user, {
        resource: 'users',
        action: 'read',
      });

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
    });
  });

  describe('canAny', () => {
    it('should return true if user has any permission', () => {
      const result = checker.canAny(user, [
        { resource: 'users', action: 'delete' },
        { resource: 'users', action: 'create' },
      ]);
      expect(result.allowed).toBe(true);
    });

    it('should return false if user has no permissions', () => {
      const result = checker.canAny(user, [
        { resource: 'users', action: 'delete' },
        { resource: 'schools', action: 'delete' },
      ]);
      expect(result.allowed).toBe(false);
    });
  });

  describe('canAll', () => {
    it('should return true if user has all permissions', () => {
      const result = checker.canAll(user, [
        { resource: 'users', action: 'create' },
        { resource: 'users', action: 'read' },
      ]);
      expect(result.allowed).toBe(true);
    });

    it('should return false if user missing any permission', () => {
      const result = checker.canAll(user, [
        { resource: 'users', action: 'create' },
        { resource: 'users', action: 'delete' },
      ]);
      expect(result.allowed).toBe(false);
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      checker.can(user, { resource: 'users', action: 'read' });
      checker.clearCache();
      // Cache should be cleared, but permission still works
      const result = checker.can(user, { resource: 'users', action: 'read' });
      expect(result.allowed).toBe(true);
    });

    it('should update permissions and clear cache', () => {
      checker.can(user, { resource: 'users', action: 'read' });
      checker.updatePermissions([
        {
          id: '3',
          name: 'users.delete',
          resource: 'users',
          action: 'delete',
        },
      ]);

      const result = checker.can(user, { resource: 'users', action: 'delete' });
      expect(result.allowed).toBe(true);
    });
  });
});
