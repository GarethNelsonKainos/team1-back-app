import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { loginHandler, logoutHandler } from '../handlers/auth.handler.js';

const router = Router();

/**
 * POST /api/auth/login
 * User logs in with email and password
 */
router.post('/login', (req, res) => loginHandler(req, res, prisma));

/**
 * POST /api/auth/logout
 * Logout endpoint (optional - mainly for frontend to clear tokens)
 */
router.post('/logout', logoutHandler);

export default router;
