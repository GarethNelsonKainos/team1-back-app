import { Router, Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword, comparePassword } from '../utils/password.utils';
import { generateToken } from '../utils/jwt.utils';
import { LoginRequest, LoginResponse } from '../types/auth.types';

const router = Router();

// Initialize Prisma with pg adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * POST /api/auth/login
 * User logs in with email and password
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { userEmail: email },
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

    const response: LoginResponse = {
      token,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.userEmail,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/logout
 * Logout endpoint (optional - mainly for frontend to clear tokens)
 */
router.post('/logout', (req: Request, res: Response): void => {
  // Since JWT is stateless, logout is mainly frontend responsibility
  // Frontend just deletes the token from storage
  res.json({ message: 'Logged out successfully' });
});

export default router;