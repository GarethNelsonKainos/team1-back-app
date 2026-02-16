import type { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import {
  formatLoginResponse,
  validateLoginRequest,
} from '../mappers/LoginMapper.js';
import { AuthService } from '../services/auth.service.js';

export async function loginHandler(
  req: Request,
  res: Response,
  prisma: PrismaClient,
): Promise<void> {
  try {
    const validationResult = validateLoginRequest(req.body);
    if (!validationResult.ok) {
      res.status(400).json({ error: validationResult.error });
      return;
    }

    // Delegate to service layer for business logic
    const authService = new AuthService(prisma);
    const result = await authService.login(validationResult.credentials);

    if (!result) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    res.json(formatLoginResponse(result));
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function logoutHandler(req: Request, res: Response): void {
  res.json({ message: 'Logged out successfully' });
}
