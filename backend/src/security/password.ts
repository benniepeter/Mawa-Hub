import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

/**
 * Hash a password using Node.js scrypt with a unique random salt.
 * The returned value contains only the algorithm parameters, salt and hash;
 * the plaintext password is never persisted.
 */
export async function hashPassword(password: string): Promise<string> {
  if (password.length < 8) throw new Error('password_too_short');
  const salt = randomBytes(SALT_BYTES);
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `scrypt:v1:${salt.toString('base64url')}:${derivedKey.toString('base64url')}`;
}

/** Verify a password without exposing whether the stored hash is valid. */
export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  try {
    const [algorithm, version, saltText, hashText] = encoded.split(':');
    if (algorithm !== 'scrypt' || version !== 'v1' || !saltText || !hashText) return false;
    const salt = Buffer.from(saltText, 'base64url');
    const expected = Buffer.from(hashText, 'base64url');
    if (expected.length !== KEY_LENGTH) return false;
    const actual = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
