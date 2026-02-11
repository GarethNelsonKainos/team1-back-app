import { PrismaPg } from '@prisma/adapter-pg';
import { Router } from 'express';
import { Pool } from 'pg';
import {
  loginController,
  logoutController,
} from '../controllers/auth.controller';
import { PrismaClient } from '../generated/prisma/client';

const router = Router();

// Initialize Prisma with pg adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * POST /api/auth/login
 * User logs in with email and password
 */
router.post('/login', (req, res) => loginController(req, res, prisma));

/**
 * POST /api/auth/logout
 * Logout endpoint (optional - mainly for frontend to clear tokens)
 */
router.post('/logout', logoutController);

export default router;
