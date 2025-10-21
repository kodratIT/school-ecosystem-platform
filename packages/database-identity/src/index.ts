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

// Query Builders - OAuth Clients
export {
  getOAuthClients,
  getOAuthClientById,
  getOAuthClientByClientId,
  createOAuthClient,
  updateOAuthClient,
  deleteOAuthClient,
  rotateClientSecret,
  verifyClientCredentials,
  updateClientLastUsed,
  toggleClientStatus,
  validateRedirectUri,
  canRequestScope,
  supportsGrantType,
  supportsResponseType,
  countActiveClients,
  searchOAuthClients,
} from './queries/oauth-clients';

// Query Builders - Password Reset
export {
  createResetToken,
  validateToken,
  markTokenUsed,
  getTokenWithUser,
  cleanupExpiredTokens,
  getActiveTokensForUser,
  countRecentResetRequests,
  countRecentResetRequestsByIP,
  deleteUserResetTokens,
} from './queries/password-reset';
export type {
  CreateResetTokenInput,
  ValidateTokenResult,
  TokenWithUser,
} from './queries/password-reset';

// Query Builders - Authorization Codes
export {
  createAuthorizationCode,
  getAuthorizationCodeByCode,
  markAuthorizationCodeUsed,
  deleteAuthorizationCode,
  cleanupExpiredAuthorizationCodes,
  getActiveAuthorizationCodesForUser,
  validateAndConsumeAuthorizationCode,
} from './queries/authorization-codes';
export type {
  AuthorizationCode,
  CreateAuthorizationCodeInput,
} from './queries/authorization-codes';

// Query Builders - Email Verification
export {
  createEmailVerification,
  getEmailVerificationByToken,
  markEmailVerificationVerified,
  invalidateUserEmailVerifications,
  getActiveVerificationToken,
  recordEmailResendAttempt,
  countRecentResendAttemptsByEmail,
  countRecentResendAttemptsByIP,
  getLastResendAttempt,
  cleanupExpiredEmailVerifications,
  cleanupOldResendAttempts,
} from './queries/email-verification';
export type {
  EmailVerification,
  CreateEmailVerificationInput,
  EmailResendAttempt,
} from './queries/email-verification';

// Utils - Hash
export {
  hashPassword,
  comparePassword,
  generateSecret,
  generateRandomString,
} from './utils/hash';

// Types
export type { Database } from './types/database';
export type {
  CreateOAuthClientInput,
  OAuthClientWithSecret,
  ListOAuthClientsOptions,
} from './queries/oauth-clients';

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
