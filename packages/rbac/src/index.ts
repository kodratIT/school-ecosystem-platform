// Core
export { PermissionChecker } from './core/permission-checker';
export {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  requireSameSchool,
  hasRole,
  isSameSchool,
} from './core/guards';

// Utils
export { permission, Permissions } from './utils/permission-builder';

// Types
export type {
  Permission,
  Role,
  User,
  PermissionCheck,
  PermissionResult,
} from './types';

// Components (re-export for convenience)
export { Can } from './components/Can';
