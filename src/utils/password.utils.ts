import bcrypt from 'bcrypt';

// Validate bcrypt salt rounds from environment
const saltRoundsEnv = process.env.BCRYPT_SALT_ROUNDS;

if (!saltRoundsEnv) {
  throw new Error('BCRYPT_SALT_ROUNDS environment variable is required');
}

const SALT_ROUNDS = Number(saltRoundsEnv);

if (Number.isNaN(SALT_ROUNDS) || SALT_ROUNDS < 10 || SALT_ROUNDS > 15) {
  throw new Error(
    'BCRYPT_SALT_ROUNDS must be a number between 10 and 15 (recommended: 12)',
  );
}

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
