import type { NextFunction, Request, Response } from 'express';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt.utils.js';

/**
 * Middleware to verify JWT tokens
 * Attaches decoded user data to req.user if valid
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
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

  // Attach user data to request object
  req.user = payload;
  next();
}
