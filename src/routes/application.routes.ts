import { Router } from 'express';
import { prisma } from '../db/prisma';
import { createApplicationHandler } from '../handlers/application.handler';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/applications
 * Create a new job application (requires authentication)
 */
router.post('/', authMiddleware, (req, res) =>
  createApplicationHandler(req, res, prisma),
);

export default router;
