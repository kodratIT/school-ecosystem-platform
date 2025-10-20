import type {
  UserId,
  SchoolId,
  StudentId,
  TeacherId,
  ParentId,
  ClassId,
  SubjectId,
  GradeId,
  InvoiceId,
  PaymentId,
  AttendanceId,
  RoleId,
  PermissionId,
  Timestamps,
} from '../utils';
import type {
  UserRole,
  Gender,
  Religion,
  EducationLevel,
  AttendanceStatus,
  PaymentStatus,
  PaymentMethod,
  InvoiceStatus,
  Semester,
  PermissionAction,
  PermissionResource,
} from '../constants';

/**
 * Base User entity
 */
export interface User extends Timestamps {
  id: UserId;
  email: string;
  name: string;
  role: UserRole;
  schoolId: SchoolId | null;
  avatar: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
}

/**
 * School entity
 */
export interface School extends Timestamps {
  id: SchoolId;
  name: string;
  npsn: string; // Nomor Pokok Sekolah Nasional
  educationLevel: EducationLevel;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string | null;
  logo: string | null;
  isActive: boolean;
}

/**
 * Student entity
 */
export interface Student extends Timestamps {
  id: StudentId;
  userId: UserId;
  schoolId: SchoolId;
  nisn: string; // Nomor Induk Siswa Nasional
  nis: string; // Nomor Induk Sekolah
  fullName: string;
  nickname: string | null;
  gender: Gender;
  birthPlace: string;
  birthDate: Date;
  religion: Religion;
  nik: string; // Nomor Induk Kependudukan
  address: string;
  rt: string;
  rw: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string | null;
  email: string | null;
  bloodType: string | null;
  height: number | null;
  weight: number | null;
  specialNeeds: string | null;
  enrollmentDate: Date;
  graduationDate: Date | null;
  status: 'active' | 'graduated' | 'dropped' | 'transferred';
}

/**
 * Parent/Guardian entity
 */
export interface Parent extends Timestamps {
  id: ParentId;
  userId: UserId;
  studentId: StudentId;
  relationship: 'father' | 'mother' | 'guardian';
  name: string;
  nik: string;
  birthYear: number;
  education: EducationLevel;
  occupation: string;
  monthlyIncome: string;
  phone: string;
  email: string | null;
}

/**
 * Teacher entity
 */
export interface Teacher extends Timestamps {
  id: TeacherId;
  userId: UserId;
  schoolId: SchoolId;
  nip: string | null; // Nomor Induk Pegawai
  fullName: string;
  gender: Gender;
  birthPlace: string;
  birthDate: Date;
  nik: string;
  phone: string;
  email: string;
  address: string;
  education: EducationLevel;
  major: string;
  joinDate: Date;
  employmentStatus: 'permanent' | 'contract' | 'honorary';
  isActive: boolean;
}

/**
 * Class entity
 */
export interface Class extends Timestamps {
  id: ClassId;
  schoolId: SchoolId;
  name: string;
  grade: number; // 1-12
  academicYear: string; // "2024/2025"
  homeroomTeacherId: TeacherId | null;
  capacity: number;
  currentStudents: number;
  room: string | null;
  isActive: boolean;
}

/**
 * Subject entity
 */
export interface Subject extends Timestamps {
  id: SubjectId;
  schoolId: SchoolId;
  name: string;
  code: string;
  description: string | null;
  credits: number;
  isActive: boolean;
}

/**
 * Grade/Score entity
 */
export interface Grade extends Timestamps {
  id: GradeId;
  studentId: StudentId;
  subjectId: SubjectId;
  classId: ClassId;
  teacherId: TeacherId;
  academicYear: string;
  semester: Semester;
  assignments: number | null;
  midterm: number | null;
  finalExam: number | null;
  final: number;
  notes: string | null;
}

/**
 * Attendance entity
 */
export interface Attendance extends Timestamps {
  id: AttendanceId;
  studentId: StudentId;
  classId: ClassId;
  subjectId: SubjectId | null;
  teacherId: TeacherId | null;
  date: Date;
  status: AttendanceStatus;
  notes: string | null;
}

/**
 * Invoice entity
 */
export interface Invoice extends Timestamps {
  id: InvoiceId;
  schoolId: SchoolId;
  studentId: StudentId;
  invoiceNumber: string;
  title: string;
  description: string | null;
  amount: number;
  dueDate: Date;
  status: InvoiceStatus;
  paidAt: Date | null;
}

/**
 * Payment entity
 */
export interface Payment extends Timestamps {
  id: PaymentId;
  invoiceId: InvoiceId;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  referenceNumber: string | null;
  paidAt: Date | null;
  notes: string | null;
}

/**
 * Role entity (for RBAC)
 */
export interface Role extends Timestamps {
  id: RoleId;
  schoolId: SchoolId | null;
  name: string;
  description: string | null;
  isSystemRole: boolean;
}

/**
 * Permission entity (for RBAC)
 */
export interface Permission extends Timestamps {
  id: PermissionId;
  roleId: RoleId;
  resource: PermissionResource;
  action: PermissionAction;
}
