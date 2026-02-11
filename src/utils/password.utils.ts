import bcrypt from 'bcrypt';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

/**
 * Hash a plain text password using bcrypt
 * @param password - Plain text password from user
 * @returns Hashed password (safe to store in DB)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a stored hash
 * @param password - Plain text password from login attempt
 * @param hash - Hashed password from database
 * @returns True if they match, false otherwise
 */
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
