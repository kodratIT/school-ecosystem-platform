import { PermissionChecker } from '../src/core/permission-checker';
import {
  requirePermission,
  requireRole,
  hasRole,
  isSameSchool,
  requireSameSchool,
} from '../src/core/guards';
import type { User, Permission } from '../src/types';

describe('Guards', () => {
  const permissions: Permission[] = [
    {
      id: '1',
      name: 'users.create',
      resource: 'users',
      action: 'create',
    },
  ];

  const user: User = {
    id: 'user-1',
    role: 'teacher',
    schoolId: 'school-1',
  };

  const checker = new PermissionChecker(permissions);

  describe('requirePermission', () => {
    it('should not throw if user has permission', () => {
      expect(() => {
        requirePermission(user, checker, {
          resource: 'users',
          action: 'create',
        });
      }).not.toThrow();
    });

    it('should throw if user lacks permission', () => {
      expect(() => {
        requirePermission(user, checker, {
          resource: 'users',
          action: 'delete',
        });
      }).toThrow('Permission denied: users.delete');
    });
  });

  describe('requireRole', () => {
    it('should not throw if user has role', () => {
      expect(() => {
        requireRole(user, 'teacher');
      }).not.toThrow();
    });

    it('should not throw if user has one of roles', () => {
      expect(() => {
        requireRole(user, ['teacher', 'admin']);
      }).not.toThrow();
    });

    it('should throw if user lacks role', () => {
      expect(() => {
        requireRole(user, 'super_admin');
      }).toThrow('Role required: super_admin');
    });
  });

  describe('hasRole', () => {
    it('should return true if user has role', () => {
      expect(hasRole(user, 'teacher')).toBe(true);
    });

    it('should return false if user lacks role', () => {
      expect(hasRole(user, 'admin')).toBe(false);
    });
  });

  describe('isSameSchool', () => {
    it('should return true if same school', () => {
      expect(isSameSchool(user, 'school-1')).toBe(true);
    });

    it('should return false if different school', () => {
      expect(isSameSchool(user, 'school-2')).toBe(false);
    });
  });

  describe('requireSameSchool', () => {
    it('should not throw if same school', () => {
      expect(() => {
        requireSameSchool(user, 'school-1');
      }).not.toThrow();
    });

    it('should throw if different school', () => {
      expect(() => {
        requireSameSchool(user, 'school-2');
      }).toThrow('Access denied: Different school');
    });
  });
});
