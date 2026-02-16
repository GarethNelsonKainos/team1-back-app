import { Router } from 'express';
import { prisma } from '../db/prisma';
import {
  checkApplicationStatusHandler,
  createApplicationHandler,
} from '../handlers/application.handler';
import { uploadMiddleware } from '../handlers/cv.handler';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/applications
 * Create a new job application with optional CV upload (requires authentication)
 */
router.post('/', authMiddleware, uploadMiddleware, (req, res) =>
  createApplicationHandler(req, res, prisma),
);

/**
 * GET /api/applications/status/:jobRoleId
 * Check if user has already applied for a specific job role (requires authentication)
 */
router.get('/status/:jobRoleId', authMiddleware, (req, res) =>
  checkApplicationStatusHandler(req, res, prisma),
);

export default router;
