import type { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export async function loginHandler(
  req: Request,
  res: Response,
  prisma: PrismaClient,
): Promise<void> {
  try {
    const { email, password } = req.body;

    // Input validation
    if (
      !email ||
      typeof email !== 'string' ||
      !password ||
      typeof password !== 'string'
    ) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    // Sanitize email for validation
    const sanitizedEmail = email.trim().toLowerCase();

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    // Length limits (prevent DoS)
    if (sanitizedEmail.length > 255 || password.length > 128) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    // Minimum password length check
    if (password.length < 8) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    // Delegate to service layer for business logic
    const authService = new AuthService(prisma);
    const result = await authService.login({ email, password });

    if (!result) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function logoutHandler(req: Request, res: Response): void {
  res.json({ message: 'Logged out successfully' });
}
