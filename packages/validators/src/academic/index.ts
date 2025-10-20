import { z } from 'zod';
import { dateSchema } from '../common';

/**
 * Grade/score schema (0-100)
 */
export const gradeSchema = z
  .number({ required_error: 'Nilai wajib diisi' })
  .int('Nilai harus bilangan bulat')
  .min(0, 'Nilai minimal 0')
  .max(100, 'Nilai maksimal 100');

/**
 * Attendance status enum
 */
export const attendanceStatusSchema = z.enum(
  ['present', 'absent', 'sick', 'permit'],
  {
    errorMap: () => ({ message: 'Status kehadiran tidak valid' }),
  }
);

/**
 * Attendance record schema
 */
export const attendanceSchema = z.object({
  studentId: z.string(),
  date: dateSchema,
  status: attendanceStatusSchema,
  notes: z.string().optional(),
});

export type Attendance = z.infer<typeof attendanceSchema>;

/**
 * Grade record schema
 */
export const gradeRecordSchema = z.object({
  studentId: z.string(),
  subjectId: z.string(),
  semester: z.number().int().min(1).max(2),
  academicYear: z
    .string()
    .regex(/^\d{4}\/\d{4}$/, 'Format tahun ajaran: YYYY/YYYY'),
  assignments: gradeSchema.optional(),
  midterm: gradeSchema.optional(),
  finalExam: gradeSchema.optional(),
  final: gradeSchema,
});

export type GradeRecord = z.infer<typeof gradeRecordSchema>;

/**
 * Academic year schema
 */
export const academicYearSchema = z
  .string()
  .regex(
    /^\d{4}\/\d{4}$/,
    'Format tahun ajaran harus YYYY/YYYY (contoh: 2024/2025)'
  );
