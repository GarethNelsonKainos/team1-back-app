import type { NextFunction, Request, Response } from 'express';

/**
 * Middleware to enforce role-based access control
 */
export function requireRole(allowedRoles: number[]) {
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
 * Admin only access (userTypeId === 2)
 */
export function requireAdmin() {
  return requireRole([2]);
}

/**
 * Applicant or Admin (userTypeId 1 or 2)
 */
export function requireApplicantOrAdmin() {
  return requireRole([1, 2]);
}
