import type { NextFunction, Request, Response } from 'express';
import { UserRole } from '../types/auth.types.js';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt.utils.js';

/**
 * Merged authentication and authorization middleware
 * Verifies JWT token and optionally checks user role
 * Default: allows Applicant or Admin
 * Optional: pass specific roles to restrict access
 */
export function authMiddleware(
  allowedRoles: UserRole[] = [UserRole.Applicant, UserRole.Admin],
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(payload.userRole)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    // Attach user data to request object
    req.user = payload;
    next();
  };
}

/**
 * Convenience function: requires specific roles
 */
export function requireRole(allowedRoles: UserRole[]) {
  return authMiddleware(allowedRoles);
}

/**
 * Convenience function: Admin only access
 */
export function requireAdmin() {
  return authMiddleware([UserRole.Admin]);
}

/**
 * Convenience function: Applicant or Admin
 */
export function requireApplicantOrAdmin() {
  return authMiddleware([UserRole.Applicant, UserRole.Admin]);
}
