import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z
  .string({ required_error: 'Email wajib diisi' })
  .email('Format email tidak valid')
  .toLowerCase()
  .trim();

/**
 * Indonesian phone number validation
 * Supports: 08xx, +628xx, 628xx
 */
export const phoneSchema = z
  .string({ required_error: 'Nomor telepon wajib diisi' })
  .regex(
    /^(\+62|62|0)[2-9][0-9]{7,11}$/,
    'Nomor telepon harus format Indonesia (08xx atau +628xx)'
  )
  .transform((phone) => {
    // Normalize to 08xx format
    if (phone.startsWith('+62')) return '0' + phone.slice(3);
    if (phone.startsWith('62')) return '0' + phone.slice(2);
    return phone;
  });

/**
 * NIK (Nomor Induk Kependudukan) - 16 digits
 */
export const nikSchema = z
  .string({ required_error: 'NIK wajib diisi' })
  .regex(/^\d{16}$/, 'NIK harus 16 digit angka');

/**
 * NISN (Nomor Induk Siswa Nasional) - 10 digits
 */
export const nisnSchema = z
  .string({ required_error: 'NISN wajib diisi' })
  .regex(/^\d{10}$/, 'NISN harus 10 digit angka');

/**
 * Strong password validation
 * Min 8 chars, 1 uppercase, 1 lowercase, 1 number
 */
export const passwordSchema = z
  .string({ required_error: 'Password wajib diisi' })
  .min(8, 'Password minimal 8 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
  .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
  .regex(/[0-9]/, 'Password harus mengandung angka');

/**
 * Name validation (Indonesian)
 */
export const nameSchema = z
  .string({ required_error: 'Nama wajib diisi' })
  .min(2, 'Nama minimal 2 karakter')
  .max(100, 'Nama maksimal 100 karakter')
  .regex(/^[a-zA-Z\s.,']+$/, 'Nama hanya boleh huruf dan spasi');

/**
 * Date schema
 */
export const dateSchema = z
  .string({ required_error: 'Tanggal wajib diisi' })
  .or(z.date())
  .pipe(z.coerce.date());

/**
 * Currency/amount schema (in Rupiah)
 */
export const amountSchema = z
  .number({ required_error: 'Jumlah wajib diisi' })
  .int('Jumlah harus bilangan bulat')
  .positive('Jumlah harus lebih dari 0');

/**
 * URL validation
 */
export const urlSchema = z.string().url('Format URL tidak valid').optional();

/**
 * Gender enum
 */
export const genderSchema = z.enum(['L', 'P'], {
  errorMap: () => ({
    message: 'Jenis kelamin harus L (Laki-laki) atau P (Perempuan)',
  }),
});

/**
 * Religion enum
 */
export const religionSchema = z.enum(
  ['islam', 'kristen', 'katolik', 'hindu', 'buddha', 'konghucu'],
  {
    errorMap: () => ({ message: 'Agama tidak valid' }),
  }
);

/**
 * Education level enum
 */
export const educationLevelSchema = z.enum(
  ['tk', 'sd', 'smp', 'sma', 'smk', 'd1', 'd2', 'd3', 's1', 's2', 's3'],
  {
    errorMap: () => ({ message: 'Tingkat pendidikan tidak valid' }),
  }
);
