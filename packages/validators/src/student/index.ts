import { z } from 'zod';
import {
  nameSchema,
  nikSchema,
  nisnSchema,
  genderSchema,
  dateSchema,
  phoneSchema,
  emailSchema,
  religionSchema,
  educationLevelSchema,
} from '../common';

/**
 * Student biodata schema
 */
export const studentBiodataSchema = z.object({
  // Personal info
  fullName: nameSchema,
  nickname: z.string().optional(),
  nisn: nisnSchema.optional(),
  nik: nikSchema,
  birthPlace: z.string().min(2, 'Tempat lahir minimal 2 karakter'),
  birthDate: dateSchema,
  gender: genderSchema,

  // Contact
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),

  // Address
  address: z.string().min(10, 'Alamat minimal 10 karakter'),
  rt: z
    .string()
    .regex(/^\d{3}$/, 'RT harus 3 digit')
    .optional(),
  rw: z
    .string()
    .regex(/^\d{3}$/, 'RW harus 3 digit')
    .optional(),
  village: z.string().min(2, 'Kelurahan minimal 2 karakter'),
  district: z.string().min(2, 'Kecamatan minimal 2 karakter'),
  city: z.string().min(2, 'Kota minimal 2 karakter'),
  province: z.string().min(2, 'Provinsi minimal 2 karakter'),
  postalCode: z
    .string()
    .regex(/^\d{5}$/, 'Kode pos harus 5 digit')
    .optional(),

  // Family
  childOrder: z.number().int().positive('Anak ke- harus bilangan positif'),
  siblingsCount: z.number().int().min(0, 'Jumlah saudara tidak boleh negatif'),

  // Religion & Special needs
  religion: religionSchema,
  specialNeeds: z.string().optional(),

  // Previous education
  previousSchool: z.string().optional(),
  previousSchoolAddress: z.string().optional(),

  // Living situation
  livingWith: z.enum(['parents', 'father', 'mother', 'guardian', 'dormitory']),
  transportation: z.enum([
    'walk',
    'bicycle',
    'motorcycle',
    'car',
    'public_transport',
  ]),
  distanceKm: z.number().positive('Jarak harus lebih dari 0').optional(),
});

export type StudentBiodata = z.infer<typeof studentBiodataSchema>;

/**
 * Parent/Guardian schema
 */
export const parentSchema = z.object({
  name: nameSchema,
  nik: nikSchema,
  birthYear: z.number().int().min(1950).max(new Date().getFullYear()),
  education: educationLevelSchema,
  occupation: z.string().min(2, 'Pekerjaan minimal 2 karakter'),
  monthlyIncome: z.enum(['less_1m', '1m_3m', '3m_5m', '5m_10m', 'more_10m']),
  phone: phoneSchema,
  email: emailSchema.optional(),
});

export type Parent = z.infer<typeof parentSchema>;

/**
 * PPDB Registration schema
 */
export const ppdbRegistrationSchema = z.object({
  // Student data
  student: studentBiodataSchema,

  // Parent data
  father: parentSchema,
  mother: parentSchema,
  guardian: parentSchema.optional(),

  // Program selection
  educationLevel: z.enum(['tk', 'sd', 'smp', 'sma', 'smk']),
  grade: z.number().int().min(1).max(12),
  major: z.string().optional(), // For SMA/SMK

  // Documents
  birthCertificate: z.string().url('URL akta lahir tidak valid'),
  familyCard: z.string().url('URL kartu keluarga tidak valid'),
  studentPhoto: z.string().url('URL foto siswa tidak valid'),
  reportCard: z.string().url('URL rapor tidak valid').optional(),

  // Agreement
  agreeToTerms: z.literal(true, {
    errorMap: () => ({
      message: 'Anda harus menyetujui syarat dan ketentuan',
    }),
  }),
});

export type PPDBRegistration = z.infer<typeof ppdbRegistrationSchema>;
