import type { NextFunction, Request, Response } from 'express';
import { UserRole } from '../types/auth.types.js';

/**
 * Middleware to enforce role-based access control
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!allowedRoles.includes(req.user.userTypeId)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

/**
 * Admin only access
 */
export function requireAdmin() {
  return requireRole([UserRole.Admin]);
}

/**
 * Applicant or Admin
 */
export function requireApplicantOrAdmin() {
  return requireRole([UserRole.Applicant, UserRole.Admin]);
}
