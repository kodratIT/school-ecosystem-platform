import crypto from 'crypto';

/**
 * Hash password using bcrypt (via bcryptjs for compatibility)
 * Note: Using crypto pbkdf2 for Node.js native support
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 10000;
  const keylen = 64;
  const digest = 'sha512';

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      iterations,
      keylen,
      digest,
      (err, derivedKey) => {
        if (err) reject(err);
        resolve(salt + ':' + derivedKey.toString('hex'));
      }
    );
  });
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  const [salt, key] = hash.split(':');
  if (!salt || !key) return false;

  const iterations = 10000;
  const keylen = 64;
  const digest = 'sha512';

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      iterations,
      keylen,
      digest,
      (err, derivedKey) => {
        if (err) reject(err);
        resolve(key === derivedKey.toString('hex'));
      }
    );
  });
}

/**
 * Generate random secret for client credentials
 */
export function generateSecret(length: number = 48): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Generate random string with specific character set
 */
export function generateRandomString(length: number = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i]! % chars.length];
  }

  return result;
}
