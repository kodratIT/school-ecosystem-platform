/**
 * Validate email address
 * @example isEmail("test@example.com") // true
 */
export function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Indonesian phone number
 * @example isPhone("08123456789") // true
 */
export function isPhone(phone: string): boolean {
  // Supports: 08xx, +628xx, 628xx
  const phoneRegex = /^(\+62|62|0)[2-9][0-9]{7,11}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Validate URL
 */
export function isURL(url: string): boolean {
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  return urlRegex.test(url);
}

/**
 * Validate Indonesian NIK (16 digits)
 */
export function isNIK(nik: string): boolean {
  return /^\d{16}$/.test(nik);
}

/**
 * Validate NISN (10 digits)
 */
export function isNISN(nisn: string): boolean {
  return /^\d{10}$/.test(nisn);
}

/**
 * Check if string is empty or whitespace
 */
export function isEmpty(str: string): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Validate password strength
 * @returns true if password has min 8 chars, 1 uppercase, 1 lowercase, 1 number
 */
export function isStrongPassword(password: string): boolean {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return minLength && hasUpperCase && hasLowerCase && hasNumber;
}
