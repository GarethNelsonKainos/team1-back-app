import { Router } from 'express';
import { prisma } from '../config/database';
import {
  loginController,
  logoutController,
} from '../controllers/auth.controller';

const router = Router();

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
