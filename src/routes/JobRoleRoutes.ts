import type { Request, Response } from 'express';
import { Router } from 'express';
import { JobRoleController } from '../controllers/JobRoleController.js';
import { JobRoleDAO } from '../db/JobRoleDAO.js';
import { prisma } from '../db/prisma.js';
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware.js';
import { JobRoleService } from '../services/JobRoleService.js';

const router = Router();

// Initialize job role dependencies
const jobRoleDAO = new JobRoleDAO(prisma);
const jobRoleService = new JobRoleService(jobRoleDAO);
const jobRoleController = new JobRoleController(jobRoleService);

// Job Roles API routes
router.get('/job-roles', (req, res) => jobRoleController.getJobRoles(req, res));

// Delete job role (admin only)
router.delete(
  '/job-roles/:id',
  requireAdmin(),
  // adminAuthMiddleware,
  (req: Request, res: Response) => jobRoleController.deleteJobRole(req, res),
);

router.get('/job-roles/:id', authMiddleware(), (req, res) =>
  jobRoleController.getJobRoleById(req, res),
);

// Admin-only routes
router.post('/job-roles', requireAdmin(), (req, res) =>
  jobRoleController.createJobRole(req, res),
);

// Data lookup routes
router.get('/bands', (req, res) => jobRoleController.getBands(req, res));
router.get('/capabilities', (req, res) =>
  jobRoleController.getCapabilities(req, res),
);
router.get('/locations', (req, res) =>
  jobRoleController.getLocations(req, res),
);

export default router;
