import jwt from 'jsonwebtoken';
import type { JWTPayload } from '../types/auth.types';

// Validate environment variables at module load time
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '24h';

if (!JWT_SECRET || !JWT_EXPIRES_IN) {
  throw new Error('Required JWT environment variables are not defined');
}

// Now TypeScript knows these are defined
const secret: string = JWT_SECRET;
const expiresIn: string = JWT_EXPIRES_IN;

/**
 * Generate a JWT token for a user
 * @param payload - User data to encode in token
 * @returns JWT token string
 */
export function generateToken(payload: JWTPayload): string {
  // biome-ignore lint/suspicious/noExplicitAny: jsonwebtoken type compatibility requires this
  return jwt.sign(payload, secret, { expiresIn } as any);
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token from request header
 * @returns Decoded payload if valid, null if invalid/expired
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    // Token expired, invalid signature, malformed, etc.
    return null;
  }
}

/**
 * Extract token from Authorization header
 * Expected format: "Bearer <token>"
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
}
