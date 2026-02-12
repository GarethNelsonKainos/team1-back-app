import type { NextFunction, Request, Response } from 'express';

/**
 * Middleware factory to require specific user types
 * @param allowedUserTypeIds - Array of allowed userTypeIds (1 = Applicant, 2 = Admin)
 */
export function requireRole(allowedUserTypeIds: number[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // At this point, authMiddleware already ran and set req.user

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check if user's typeId is in the allowed list
    if (!allowedUserTypeIds.includes(req.user.userTypeId)) {
      res
        .status(403)
        .json({ error: 'Access denied. Insufficient permissions.' });
      return;
    }

    next(); // User has correct role, continue
  };
}

/**
 * Shorthand middleware to require Admin role (userTypeId = 2)
 */
export function requireAdmin() {
  return requireRole([2]);
}

/**
 * Middleware that allows both Applicant and Admin
 */
export function requireApplicantOrAdmin() {
  return requireRole([1, 2]);
}
