// Client
export {
  getSupabaseClient,
  createAuthClient,
  getBrowserClient,
  resetClient,
} from './client/supabase';

// Query Builders - Schools
export {
  getActiveSchools,
  getAllSchools,
  getSchoolById,
  getSchoolBySlug,
  getSchoolByNpsn,
  createSchool,
  updateSchool,
  deleteSchool,
  activateSchool,
  deactivateSchool,
  updateSchoolSubscription,
  countSchoolsByTier,
} from './queries/schools';

// Query Builders - Users
export {
  getUserById,
  getUserByEmail,
  getUsersBySchool,
  getUsersByRole,
  getSuperAdmins,
  createUser,
  updateUser,
  deleteUser,
  updateLastLogin,
  verifyUserEmail,
  banUser,
  unbanUser,
  activateUser,
  deactivateUser,
  updateUserPassword,
  searchUsers,
  countUsersByRole,
  emailExists,
} from './queries/users';

// Query Builders - Audit Logs
export {
  logAudit,
  getAuditLogs,
  getUserAuditLogs,
  getSchoolAuditLogs,
  getResourceAuditLogs,
  getRecentAuditLogs,
  countAuditLogsByAction,
  getAuditLogStats,
  logUserAction,
  logSchoolAction,
  logAuthEvent,
} from './queries/audit';

// Types
export type { Database } from './types/database';

// Error Handling
export {
  DatabaseError,
  handleDatabaseError,
  isUniqueViolation,
  isForeignKeyViolation,
  isNotFound,
  isCheckViolation,
  isNullViolation,
  getFriendlyErrorMessage,
} from './utils/errors';
