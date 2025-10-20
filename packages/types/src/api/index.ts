import type { Paginated } from '../utils';

/**
 * Generic API request with pagination
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Generic API request with filters
 */
export interface FilterParams {
  search?: string;
  filters?: Record<string, unknown>;
}

/**
 * List request params
 */
export type ListParams = PaginationParams & FilterParams;

/**
 * Login request
 */
export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

/**
 * Login response
 */
export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
  refreshToken: string;
}

/**
 * Register request
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Error codes
 */
export enum ErrorCode {
  // Authentication
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Business logic
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  ENROLLMENT_CLOSED = 'ENROLLMENT_CLOSED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
}

/**
 * Validation error detail
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * API Error response structure
 */
export interface APIErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: ValidationError[] | Record<string, unknown>;
  };
}

/**
 * API Success response structure
 */
export interface APISuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * API Response (success or error)
 */
export type APIResponse<T = unknown> = APISuccessResponse<T> | APIErrorResponse;

/**
 * Paginated API response
 */
export type PaginatedResponse<T> = APISuccessResponse<Paginated<T>>;
