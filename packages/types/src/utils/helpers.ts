/**
 * Make specific keys required
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific keys optional
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/**
 * Paginated response wrapper
 */
export type Paginated<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
};

/**
 * Result type (success or error)
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Timestamp fields
 */
export type Timestamps = {
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Soft delete field
 */
export type SoftDelete = {
  deletedAt: Date | null;
};

/**
 * Entity with timestamps
 */
export type WithTimestamps<T> = T & Timestamps;

/**
 * Entity with soft delete
 */
export type WithSoftDelete<T> = T & SoftDelete;

/**
 * Nullable fields
 */
export type Nullable<T> = T | null;

/**
 * Maybe type (value or undefined)
 */
export type Maybe<T> = T | undefined;
