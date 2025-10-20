/**
 * User roles
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SCHOOL_ADMIN = 'school_admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
  STAFF = 'staff',
}

/**
 * Gender options
 */
export enum Gender {
  MALE = 'L',
  FEMALE = 'P',
}

/**
 * Religion options (Indonesia)
 */
export enum Religion {
  ISLAM = 'islam',
  KRISTEN = 'kristen',
  KATOLIK = 'katolik',
  HINDU = 'hindu',
  BUDDHA = 'buddha',
  KONGHUCU = 'konghucu',
}

/**
 * Education levels
 */
export enum EducationLevel {
  TK = 'tk',
  SD = 'sd',
  SMP = 'smp',
  SMA = 'sma',
  SMK = 'smk',
  D1 = 'd1',
  D2 = 'd2',
  D3 = 'd3',
  S1 = 's1',
  S2 = 's2',
  S3 = 's3',
}

/**
 * Attendance status
 */
export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  SICK = 'sick',
  PERMIT = 'permit',
  LATE = 'late',
}

/**
 * Payment status
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

/**
 * Payment methods
 */
export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  EWALLET = 'ewallet',
  CASH = 'cash',
  VIRTUAL_ACCOUNT = 'virtual_account',
}

/**
 * Invoice status
 */
export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

/**
 * Academic year semester
 */
export enum Semester {
  GANJIL = 1,
  GENAP = 2,
}

/**
 * Day of week
 */
export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

/**
 * Permission actions
 */
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

/**
 * Permission resources
 */
export enum PermissionResource {
  USER = 'user',
  STUDENT = 'student',
  TEACHER = 'teacher',
  CLASS = 'class',
  SUBJECT = 'subject',
  GRADE = 'grade',
  ATTENDANCE = 'attendance',
  INVOICE = 'invoice',
  PAYMENT = 'payment',
  REPORT = 'report',
  SETTING = 'setting',
}
