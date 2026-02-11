import type { Request, Response } from 'express';
import type { PrismaClient } from '../generated/prisma/client';
import { generateToken } from '../utils/jwt.utils';
import { comparePassword } from '../utils/password.utils';

export async function loginController(
  req: Request,
  res: Response,
  prisma: PrismaClient,
): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validation
    if (
      !email ||
      typeof email !== 'string' ||
      !password ||
      typeof password !== 'string'
    ) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    // Sanitize email first (trim whitespace, lowercase)
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

    // Minimum password length check (for user login attempts)
    if (password.length < 8) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { userEmail: sanitizedEmail },
      include: { userType: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Compare passwords
    const passwordMatch = await comparePassword(password, user.userPassword);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.userId,
      email: user.userEmail,
      userTypeId: user.userTypeId,
    });

    res.json({
      token,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.userEmail,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function logoutController(req: Request, res: Response): void {
  res.json({ message: 'Logged out successfully' });
}
