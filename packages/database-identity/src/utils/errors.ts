import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Custom database error class
 */
export class DatabaseError extends Error {
  code: string;
  details?: string;
  hint?: string;

  constructor(error: PostgrestError) {
    super(error.message);
    this.name = 'DatabaseError';
    this.code = error.code;
    this.details = error.details;
    this.hint = error.hint;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }
}

/**
 * Handle Supabase errors and throw DatabaseError
 */
export function handleDatabaseError(error: PostgrestError): never {
  throw new DatabaseError(error);
}

/**
 * Check if error is unique constraint violation (23505)
 * Occurs when trying to insert duplicate values in unique columns
 */
export function isUniqueViolation(error: unknown): boolean {
  return error instanceof DatabaseError && error.code === '23505';
}

/**
 * Check if error is foreign key violation (23503)
 * Occurs when referencing non-existent foreign key
 */
export function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof DatabaseError && error.code === '23503';
}

/**
 * Check if error is not found (PGRST116)
 * Occurs when single() query returns no rows
 */
export function isNotFound(error: unknown): boolean {
  return error instanceof DatabaseError && error.code === 'PGRST116';
}

/**
 * Check if error is check constraint violation (23514)
 * Occurs when data doesn't meet check constraints
 */
export function isCheckViolation(error: unknown): boolean {
  return error instanceof DatabaseError && error.code === '23514';
}

/**
 * Check if error is null violation (23502)
 * Occurs when required field is null
 */
export function isNullViolation(error: unknown): boolean {
  return error instanceof DatabaseError && error.code === '23502';
}

/**
 * Get friendly error message
 */
export function getFriendlyErrorMessage(error: unknown): string {
  if (!(error instanceof DatabaseError)) {
    return 'An unexpected error occurred';
  }

  if (isUniqueViolation(error)) {
    return 'A record with this value already exists';
  }

  if (isForeignKeyViolation(error)) {
    return 'Referenced record does not exist';
  }

  if (isNotFound(error)) {
    return 'Record not found';
  }

  if (isCheckViolation(error)) {
    return 'Invalid value provided';
  }

  if (isNullViolation(error)) {
    return 'Required field is missing';
  }

  return error.message || 'Database operation failed';
}
