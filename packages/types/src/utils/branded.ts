/**
 * Branded type for type-safe IDs
 * Prevents mixing different ID types
 */
declare const __brand: unique symbol;
type Brand<T, TBrand> = T & { [__brand]: TBrand };

// ID types
export type UserId = Brand<string, 'UserId'>;
export type SchoolId = Brand<string, 'SchoolId'>;
export type StudentId = Brand<string, 'StudentId'>;
export type TeacherId = Brand<string, 'TeacherId'>;
export type ParentId = Brand<string, 'ParentId'>;
export type ClassId = Brand<string, 'ClassId'>;
export type SubjectId = Brand<string, 'SubjectId'>;
export type GradeId = Brand<string, 'GradeId'>;
export type InvoiceId = Brand<string, 'InvoiceId'>;
export type PaymentId = Brand<string, 'PaymentId'>;
export type AttendanceId = Brand<string, 'AttendanceId'>;
export type RoleId = Brand<string, 'RoleId'>;
export type PermissionId = Brand<string, 'PermissionId'>;

/**
 * Helper to create branded ID
 * @example const userId = brandId<UserId>('user-123');
 */
export function brandId<T extends string>(id: string): T {
  return id as T;
}
