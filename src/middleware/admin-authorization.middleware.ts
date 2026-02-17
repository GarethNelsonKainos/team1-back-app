import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * Middleware to check if the user is an admin.
 * Assumes req.user is set by authMiddleware and contains userTypeId.
 * Queries the UserType table for the 'Admin' type.
 */
export async function adminAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.user || typeof req.user.userTypeId !== 'number') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Find the admin userTypeId from the database
    const adminType = await prisma.userType.findFirst({
      where: { userTypeDesc: { equals: 'Admin', mode: 'insensitive' } },
      select: { userTypeId: true },
    });
    if (!adminType) {
      return res.status(500).json({ error: 'Admin role not configured' });
    }
    if (req.user.userTypeId !== adminType.userTypeId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  } catch (error) {
    console.error('Error in adminAuthMiddleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
